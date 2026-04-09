@echo off
chcp 65001 >nul
cd /d %~dp0\frontend
echo Frontend npm 설치 시작...
call npm install
echo Frontend 설치 완료
pause
