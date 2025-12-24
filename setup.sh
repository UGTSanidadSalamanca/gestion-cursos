#!/bin/bash

# Script de configuración para sincronización multi-dispositivo
# Sistema de Gestión de Cursos

echo "🚀 Configurando Sistema de Gestión de Cursos para sincronización multi-dispositivo"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm"
    exit 1
fi

echo "✅ Node.js y npm verificados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar si existe .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creando archivo de configuración..."
    cp .env.example .env.local
    echo "📝 Por favor edita el archivo .env.local con tus credenciales:"
    echo "   - DATABASE_URL: URL de tu base de datos PostgreSQL"
    echo "   - NEXTAUTH_SECRET: Clave secreta para NextAuth"
    echo "   - ZAI_API_KEY: Tu API key de Z-AI (opcional)"
    echo ""
    read -p "Presiona Enter después de configurar .env.local..."
fi

# Verificar configuración de base de datos
echo "🗄️  Verificando configuración de base de datos..."
if grep -q "sqlite" .env.local; then
    echo "📊 Usando SQLite (base de datos local)"
    npm run db:push
elif grep -q "postgresql" .env.local; then
    echo "🌐 Usando PostgreSQL (base de datos remota)"
    # Verificar si el esquema es para PostgreSQL
    if [ -f "prisma/schema-postgresql.prisma" ]; then
        echo "🔄 Cambiando a esquema PostgreSQL..."
        cp prisma/schema-postgresql.prisma prisma/schema.prisma
    fi
    npx prisma migrate dev
else
    echo "❌ Configuración de base de datos no reconocida"
    exit 1
fi

echo "✅ Base de datos configurada correctamente"

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

echo "🎉 Configuración completada con éxito!"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   npm run dev"
echo ""
echo "📱 Accede a http://localhost:3000 en tu navegador"
echo ""
echo "🔄 Para sincronizar en otro dispositivo:"
echo "   1. Clona este repositorio"
echo "   2. Ejecuta este script de configuración"
echo "   3. Asegúrate de usar la misma DATABASE_URL"