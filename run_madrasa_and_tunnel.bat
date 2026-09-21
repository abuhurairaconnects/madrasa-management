@echo off
cd /d "d:\madrasa managment"
start /b cmd /c "npm start > server.log 2>&1"
timeout /t 4 /nobreak > nul
start /b cmd /c "cloudflared.exe tunnel --url http://localhost:3000 --logfile tunnel.log"
timeout /t 6 /nobreak > nul
start /b powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "d:\madrasa managment\keep_alive_pinger.ps1"
powershell -ExecutionPolicy Bypass -File "d:\madrasa managment\extract_url.ps1"
