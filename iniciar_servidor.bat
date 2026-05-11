@echo off
echo =======================================================
echo Iniciando Kamaleon Clinic Hub...
echo =======================================================
echo.
echo [1/2] Iniciando o servidor Next.js...
start cmd /k "npm run dev"

echo.
echo Aguardando 5 segundos para iniciar o tunnel do Stripe...
timeout /t 5 /nobreak > nul

echo.
echo [2/2] Iniciando o Stripe CLI para Webhooks...
start cmd /k ".\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe"

echo.
echo =======================================================
echo Servidor e conexoes externas iniciados em novas janelas!
echo Acesse: http://localhost:3000
echo =======================================================
pause
