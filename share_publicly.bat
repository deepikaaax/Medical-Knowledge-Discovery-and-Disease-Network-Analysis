@echo off
echo =========================================================================
echo Creating Instant Public HTTPS Link for MedNetwork...
echo Make sure start_backend.bat is running in another window!
echo =========================================================================
echo.
echo Connecting to Pinggy public tunnel...
echo (You will get a live https://....link that you can send to anyone!)
echo.
ssh -o StrictHostKeyChecking=no -p 443 -R0:localhost:8000 a.pinggy.io
pause

