# 🔄 Guía de Sincronización Multi-Dispositivo

## 📋 Resumen
Esta guía te explica cómo configurar tu Sistema de Gestión de Cursos para usarlo en múltiples dispositivos (Mac en casa y Windows en trabajo) con los datos sincronizados.

## 🏗️ Arquitectura Recomendada

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mac (Casa)    │    │  Windows (Trab) │    │  Base de Datos  │
│                 │    │                 │    │     Remota      │
│  Next.js App    │◄──►│  Next.js App    │◄──►│   PostgreSQL    │
│                 │    │                 │    │     o MySQL     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   Repositorio   │
                    │     Remoto      │
                    │   GitHub/GitLab │
                    └─────────────────┘
```

## 🚀 Paso 1: Configurar Base de Datos Remota

### Opción A: Supabase (Recomendado - Gratis)
1. **Crear cuenta en Supabase**
   - Visita [supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener credenciales**
   - Ve a Settings > Database
   - Copia la `Connection string`
   - Formato: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

### Opción B: Railway
1. **Crear cuenta en Railway**
   - Visita [railway.app](https://railway.app)
   - Crea una cuenta
   - Crea un nuevo proyecto PostgreSQL

2. **Obtener credenciales**
   - Ve a la pestaña "Variables"
   - Copia la `DATABASE_URL`

### Opción C: DigitalOcean
1. **Crear Managed Database**
   - Visita [digitalocean.com](https://digitalocean.com)
   - Crea una cuenta
   - Configura una base de datos PostgreSQL gestionada

## 📦 Paso 2: Configurar Repositorio Remoto

### 2.1 Crear Repositorio en GitHub/GitLab
1. Ve a [github.com](https://github.com) o [gitlab.com](https://gitlab.com)
2. Crea un nuevo repositorio (puede ser privado)
3. Sigue las instrucciones para conectar tu repositorio local

### 2.2 Conectar Repositorio Local
```bash
# En tu proyecto local
git remote add origin https://github.com/tu-usuario/sistema-gestion-cursos.git
git push -u origin master
```

### 2.3 Subir el Proyecto
```bash
# Asegurarte de que todo está commiteado
git add .
git commit -m "Configuración para sincronización multi-dispositivo"

# Subir al repositorio remoto
git push origin master
```

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env.local
```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local
```

### 3.2 Configurar .env.local
```env
# Base de Datos (usar la URL de tu servicio remoto)
DATABASE_URL="postgresql://postgres:tu-password@db.tu-proyecto.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura"

# Z-AI SDK (opcional)
ZAI_API_KEY="tu-api-key-de-z-ai"

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME="Sistema de Gestión de Cursos"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3.3 Cambiar a Esquema PostgreSQL
```bash
# Si existe el esquema PostgreSQL, copiarlo
cp prisma/schema-postgresql.prisma prisma/schema.prisma

# Ejecutar migración
npx prisma migrate dev
```

## 🖥️ Paso 4: Configurar en Cada Dispositivo

### 4.1 En tu Mac (Casa)
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-gestion-cursos.git
cd sistema-gestion-cursos

# Ejecutar script de configuración (Mac/Linux)
./setup.sh

# O manualmente:
npm install
cp .env.example .env.local
# Editar .env.local con la misma DATABASE_URL
npx prisma migrate dev
npm run dev
```

### 4.2 En tu Windows (Trabajo)
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-gestion-cursos.git
cd sistema-gestion-cursos

# Ejecutar script de configuración (Windows)
setup.bat

# O manualmente:
npm install
copy .env.example .env.local
# Editar .env.local con la misma DATABASE_URL
npx prisma migrate dev
npm run dev
```

## 🔄 Flujo de Trabajo Diario

### Para Sincronizar Cambios
```bash
# En cualquier dispositivo, antes de trabajar
git pull origin master

# Hacer tus cambios en la aplicación

# Subir cambios al repositorio
git add .
git commit -m "Descripción de los cambios"
git push origin master
```

### Para Actualizar en Otro Dispositivo
```bash
# En el otro dispositivo
git pull origin master

# Reiniciar la aplicación si es necesario
npm run dev
```

## 🚨 Solución de Problemas

### Problema: Conflictos de Git
```bash
# Si hay conflictos al hacer git pull
git pull origin master --rebase
# O
git merge origin master
```

### Problema: Base de Datos no Sincroniza
- **Verificar**: Que ambos dispositivos usen la misma `DATABASE_URL`
- **Solución**: La base de datos es remota, los cambios deberían ser visibles inmediatamente

### Problema: Migraciones de Prisma
```bash
# Si hay problemas con migraciones
npx prisma migrate reset
# CUIDADO: Esto borrará todos los datos de la base de datos
```

### Problema: Dependencias
```bash
# Si hay problemas con dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📱 Acceso a la Aplicación

- **En casa**: `http://localhost:3000`
- **En trabajo**: `http://localhost:3000`
- **Ambos dispositivos verán los mismos datos** porque están conectados a la misma base de datos remota

## 🔄 Sincronización de Datos

### ¿Qué se sincroniza?
- ✅ **Todos los datos**: Alumnos, profesores, cursos, matrículas, pagos
- ✅ **Configuración**: Preferencias del sistema
- ✅ **Archivos**: Si se almacenan en la nube (no en local)

### ¿Qué NO se sincroniza?
- ❌ **Archivos locales**: Si subes archivos al sistema local
- ❌ **Caché**: Datos temporales del navegador

## 🎯 Mejores Prácticas

### 1. **Commit Frecuente**
```bash
# Haz commits pequeños y frecuentes
git add .
git commit -m "Añadir nuevo alumno"
git push origin master
```

### 2. **Pull Antes de Trabajar**
```bash
# Siempre actualiza antes de empezar a trabajar
git pull origin master
```

### 3. **Respaldo Regular**
```bash
# Hacer respaldo de la base de datos regularmente
npx prisma db push --preview-feature
```

### 4. **Misma Versión de Node.js**
Asegúrate de que ambos dispositivos usen la misma versión de Node.js (18+ recomendado)

## 🚀 Despliegue en Producción (Opcional)

Si quieres acceder a la aplicación desde cualquier lugar:

### Usar Vercel (Recomendado)
1. Conectar tu repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Desplegar automáticamente

### Usar Railway
1. Conectar tu repositorio a Railway
2. Configurar variables de entorno
3. Desplegar

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Verifica los logs de la aplicación
3. Revisa la conexión a la base de datos
4. Crea un issue en tu repositorio de GitHub/GitLab

---

**¡Listo! Ahora puedes usar tu Sistema de Gestión de Cursos en múltiples dispositivos con todos los datos sincronizados.** 🎉