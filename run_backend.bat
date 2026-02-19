@echo off
REM Install Python requirements (optional) and start FastAPI backend
python -m pip install -r "%~dp0requirements.txt"
pushd "%~dp0backend"
REM Ensure environment variables from .env are available to the Python process
REM On Windows, set them manually or use a tool to load .env before running.
uvicorn main:app --reload --port 8000
popd
