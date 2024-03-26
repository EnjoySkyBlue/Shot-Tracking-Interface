@echo on
cd %~dp0

@REM Run the Python Server
start python3 -m http.server

@REM Delay a second
timeout /t 1 /nobreak > nul

@REM Open up on the server
start "" "http://localhost:8000/index.html"


