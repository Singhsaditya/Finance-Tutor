@echo off
REM Run data ingestion to build FAISS index
pushd "%~dp0backend"
python ingestion.py
popd
