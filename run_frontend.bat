@echo off
REM Install npm deps and start React frontend
pushd "%~dp0frontend"
if exist package-lock.json (
  echo npm deps likely installed
) else (
  npm install
)
npm start
popd
