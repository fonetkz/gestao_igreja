@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Inicializando Banco de Dados - Choir Deck
echo ========================================

set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

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
cd /d "%PROJECT_ROOT%backend"
python -c "import sys; sys.path.insert(0, '..'); from database import init_db; init_db(); print('Banco criado com sucesso!')"

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