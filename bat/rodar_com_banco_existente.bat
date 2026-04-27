@echo off
echo ========================================
echo Rodando Projeto - Choir Deck
echo (Com Banco Existente)
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
echo Verificando banco de dados existente...
if not exist orquestra.db (
    echo Banco de dados nao encontrado!
    echo Execute iniciar_banco.bat primeiro!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Iniciando Choir Deck com banco existente...
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