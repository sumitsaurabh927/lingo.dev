@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

node "%SCRIPT_DIR%\..\build\cli.mjs" %*

endlocal
