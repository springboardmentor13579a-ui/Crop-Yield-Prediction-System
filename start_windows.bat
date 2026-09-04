@echo off
set ROOT=%~dp0
start "YieldSense Backend" cmd /k "cd /d %ROOT%backend && run_backend.bat"
start "YieldSense Frontend" cmd /k "cd /d %ROOT%frontend && run_frontend.bat"
echo YieldSense AI terminals opened.
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000/docs
pause
