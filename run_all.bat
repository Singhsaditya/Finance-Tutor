@echo off
REM Start backend and frontend in separate windows
start "Finance Tutor Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "Finance Tutor Frontend" cmd /k "%~dp0run_frontend.bat"
