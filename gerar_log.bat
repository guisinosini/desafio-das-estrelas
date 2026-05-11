@echo off
echo ==========================================================
echo INICIANDO MODO REPARO / DIAGNOSTICO DO SERVIDOR
echo ==========================================================
echo.
echo Tentando iniciar o servidor e gravando o problema em "erro_servidor.log"...
echo Por favor, aguarde de 10 a 15 segundos...
echo.

call npm run dev > erro_servidor.log 2>&1

echo.
echo ==========================================================
echo Processo finalizado! Pode fechar esta janela.
echo O log foi gerado.
pause
