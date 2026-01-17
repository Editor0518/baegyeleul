@echo off
setlocal

set "SCRIPT=%~dp0tools\static-server.ps1"
if not exist "%SCRIPT%" (
  echo Server script not found: %SCRIPT%
  exit /b 1
)

set "PORT=8000"

rem Prefer Next.js export folder
set "ROOT=%~dp0visual-novel\out"
if not exist "%ROOT%" (
  rem Fallbacks
  set "ROOT=%~dp0out"
)
if not exist "%ROOT%" (
  set "ROOT=%~dp0visual-novel-out"
)

if not exist "%ROOT%" (
  echo Build output not found.
  echo Tried: 
  echo   %~dp0visual-novel\out
  echo   %~dp0out
  echo   %~dp0visual-novel-out
  echo Please run: npm run build  (or npm run build:package)
  exit /b 1
)

echo Serving root: %ROOT%
start "Static Server" powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" -Port %PORT% -RootPath "%ROOT%" -SpaFallback

rem Robust open: wait until server responds, then open default browser
powershell -NoProfile -ExecutionPolicy Bypass -Command "param([string]$u); for($i=0;$i -lt 40; $i++){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri $u; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 400){ Start-Process $u; break } } catch{} Start-Sleep -Milliseconds 500 }" "http://localhost:%PORT%/"
echo Opened: http://localhost:%PORT%/

endlocal
