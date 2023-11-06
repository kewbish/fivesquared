@echo off

:: Change to the directory where the script is located
cd %~dp0

:: Configure the oracle instant client env variable
@REM set PATH=%PATH%;"C:\oracle\instantclient_21_12"

:: Start Node application
node server.js

exit /b 0
