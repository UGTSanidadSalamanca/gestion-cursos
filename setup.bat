@echo off
REM Script de configuración para Windows
REM Sistema de Gestión de Cursos

echo 🚀 Configurando Sistema de Gestión de Cursos para sincronización multi-dispositivo

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor instala npm
    pause
    exit /b 1
)

echo ✅ Node.js y npm verificados

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo ⚙️  Creando archivo de configuración...
    copy .env.example .env.local
    echo 📝 Por favor edita el archivo .env.local con tus credenciales:
    echo    - DATABASE_URL: URL de tu base de datos PostgreSQL
    echo    - NEXTAUTH_SECRET: Clave secreta para NextAuth
    echo    - ZAI_API_KEY: Tu API key de Z-AI (opcional)
    echo.
    pause
)

REM Verificar configuración de base de datos
echo 🗄️  Verificando configuración de base de datos...
findstr /c:"sqlite" .env.local >nul
if %errorlevel% equ 0 (
    echo 📊 Usando SQLite ^(base de datos local^)
    npm run db:push
) else (
    findstr /c:"postgresql" .env.local >nul
    if %errorlevel% equ 0 (
        echo 🌐 Usando PostgreSQL ^(base de datos remota^)
        REM Verificar si el esquema es para PostgreSQL
        if exist "prisma\schema-postgresql.prisma" (
            echo 🔄 Cambiando a esquema PostgreSQL...
            copy prisma\schema-postgresql.prisma prisma\schema.prisma
        )
        npx prisma migrate dev
    ) else (
        echo ❌ Configuración de base de datos no reconocida
        pause
        exit /b 1
    )
)

echo ✅ Base de datos configurada correctamente

REM Construir la aplicación
echo 🔨 Construyendo la aplicación...
npm run build

echo 🎉 Configuración completada con éxito!
echo.
echo 🚀 Para iniciar la aplicación:
echo    npm run dev
echo.
echo 📱 Accede a http://localhost:3000 en tu navegador
echo.
echo 🔄 Para sincronizar en otro dispositivo:
echo    1. Clona este repositorio
echo    2. Ejecuta este script de configuración
echo    3. Asegúrate de usar la misma DATABASE_URL
pause