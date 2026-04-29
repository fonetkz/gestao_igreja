@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Rodando Projeto - Gestão Igreja
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
echo Verificando banco de dados...
if not exist "%PROJECT_ROOT%orquestra.db" (
    echo Banco de dados nao encontrado!
    echo Execute iniciar_banco.bat primeiro!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Iniciando Gestão Igreja...
echo ========================================
echo.

cd /d "%PROJECT_ROOT%backend"
call python app.py

if errorlevel 1 (
    echo.
    echo ERRO ao iniciar o projeto!
    pause
    exit /b 1
)