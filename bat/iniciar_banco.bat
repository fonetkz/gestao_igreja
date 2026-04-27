@echo off
echo ========================================
echo Inicializando Banco de Dados - Choir Deck
echo ========================================

cd /d "%~dp0backend"

echo.
echo Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Instale o Python em: https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Criando Banco de Dados...
python -c "from backend.database import init_db; init_db(); print('Banco de dados criado com sucesso!')"

if errorlevel 1 (
    echo ERRO ao criar banco de dados!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Banco de dados pronto!
echo ========================================
pause