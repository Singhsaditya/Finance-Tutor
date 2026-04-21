import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import Header, HTTPException
from jose import JWTError, jwt
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

_client: Optional[MongoClient] = None


def _mongo_client() -> MongoClient:
    global _client
    if _client is not None:
        return _client
    uri = os.getenv("MONGODB_URI", "mongodb+srv://alokdalke:alokdalke@tutor.5kldxyt.mongodb.net/?appName=tutor")
    _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    return _client


def _db():
    name = os.getenv("MONGODB_DB_NAME", "finance_tutor")
    db = _mongo_client()[name]
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.activities.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
    return db


def users_collection() -> Collection:
    return _db().users


def activities_collection() -> Collection:
    return _db().activities


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _public_user(doc: Dict[str, Any]) -> Dict[str, str]:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
    }


def _pbkdf2_hash(password: str, salt: bytes, iterations: int = 200_000) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = _pbkdf2_hash(password, salt)
    return "pbkdf2_sha256${}${}${}".format(
        200_000,
        base64.urlsafe_b64encode(salt).decode("ascii"),
        base64.urlsafe_b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algo, iter_s, salt_s, digest_s = password_hash.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        iterations = int(iter_s)
        salt = base64.urlsafe_b64decode(salt_s.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_s.encode("ascii"))
        actual = _pbkdf2_hash(password, salt, iterations)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def create_user(name: str, email: str, password: str) -> Dict[str, str]:
    email_norm = _normalize_email(email)
    users = users_collection()
    if users.find_one({"email": email_norm}):
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(timezone.utc)
    result = users.insert_one(
        {
            "name": name.strip(),
            "email": email_norm,
            "password_hash": hash_password(password),
            "created_at": now,
        }
    )
    doc = users.find_one({"_id": result.inserted_id})
    if not doc:
        raise HTTPException(status_code=500, detail="Failed to create user")
    return _public_user(doc)


def authenticate_user(email: str, password: str) -> Dict[str, str]:
    email_norm = _normalize_email(email)
    user = users_collection().find_one({"email": email_norm})
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _public_user(user)


def get_user_by_id(user_id: str) -> Dict[str, str]:
    try:
        oid = ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token subject") from exc
    user = users_collection().find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return _public_user(user)


def create_access_token(user: Dict[str, str]) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc


def _parse_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip()


def get_current_user_required(authorization: Optional[str] = Header(default=None)) -> Dict[str, str]:
    token = _parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    payload = decode_token(token)
    user_id = str(payload.get("sub", "")).strip()
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return get_user_by_id(user_id)


def get_current_user_optional(authorization: Optional[str] = Header(default=None)) -> Optional[Dict[str, str]]:
    token = _parse_bearer_token(authorization)
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = str(payload.get("sub", "")).strip()
        if not user_id:
            return None
        return get_user_by_id(user_id)
    except HTTPException:
        return None


def record_activity(
    user_id: str,
    activity_type: str,
    title: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    try:
        oid = ObjectId(user_id)
    except Exception:
        return
    activities_collection().insert_one(
        {
            "user_id": oid,
            "type": activity_type,
            "title": title[:200],
            "metadata": metadata or {},
            "timestamp": datetime.now(timezone.utc),
        }
    )


def get_dashboard_data(user_id: str) -> Dict[str, Any]:
    try:
        oid = ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc

    activities_cursor = activities_collection().find(
        {"user_id": oid}
    ).sort("timestamp", DESCENDING).limit(200)
    activities: List[Dict[str, Any]] = list(activities_cursor)

    stats = {
        "questionsAsked": 0,
        "quizAttempts": 0,
        "avgScore": 0,
        "topicsLearned": 0,
    }
    quiz_scores: List[int] = []

    for item in activities:
        t = item.get("type")
        metadata = item.get("metadata") or {}
        if t == "ask":
            stats["questionsAsked"] += 1
        elif t == "quiz":
            stats["quizAttempts"] += 1
            score = metadata.get("score_percent")
            if isinstance(score, (int, float)):
                quiz_scores.append(int(round(score)))
        elif t == "teach":
            stats["topicsLearned"] += 1
        elif t == "evaluate":
            stats["topicsLearned"] += 1

    if quiz_scores:
        stats["avgScore"] = int(round(sum(quiz_scores) / len(quiz_scores)))

    recent_activity = []
    for item in activities[:50]:
        ts = item.get("timestamp")
        recent_activity.append(
            {
                "id": str(item.get("_id")),
                "type": item.get("type", "ask"),
                "title": item.get("title", ""),
                "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else str(ts),
                "metadata": item.get("metadata", {}),
            }
        )

    return {"stats": stats, "recentActivity": recent_activity}
