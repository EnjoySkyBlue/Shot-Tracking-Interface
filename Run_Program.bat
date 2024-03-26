@echo on
cd %~dp0

rem Run the Python Server
start python3 -m http.server

rem delay to make sure server is running before opening
timeout /t 1 /nobreak > nul

rem Open up on the server
start "" "http://localhost:8000/index.html"