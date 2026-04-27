@echo off
echo ========================================
echo Rodando Projeto - Choir Deck
echo ========================================

cd /d "%~dp0"

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
echo Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r backend/requirements.txt
    if errorlevel 1 (
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Verificando banco de dados...
if not exist orquestra.db (
    echo Banco de dados nao encontrado!
    echo Execute iniciar_banco.bat primeiro!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Iniciando Choir Deck...
echo ========================================
echo.

cd /d "%~dp0backend"
python app.py

if errorlevel 1 (
    echo.
    echo ERRO ao iniciar o projeto!
    pause
    exit /b 1
)