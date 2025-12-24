# Sistema de Gestión de Cursos

## 📋 Descripción
Sistema completo de gestión de cursos educativos con funcionalidades para administrar alumnos, profesores, cursos, matrículas, pagos y más.

## 🚀 Características
- Gestión completa de alumnos, profesores y cursos
- Sistema de matrículas y pagos
- Gestión de horarios y calendario
- Reportes y analíticas avanzadas
- Panel de control con métricas en tiempo real
- Interfaz responsive y moderna
- Sistema de notificaciones

## 🛠️ Tecnologías
- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Estilos**: Tailwind CSS, shadcn/ui
- **Base de Datos**: Prisma + PostgreSQL/SQLite
- **Iconos**: Lucide React

## 📦 Instalación

### Requisitos
- Node.js 18+
- npm o yarn
- Base de datos PostgreSQL (para producción) o SQLite (para desarrollo)

### Pasos de instalación
1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-gestion-cursos
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

4. Configurar base de datos
```bash
# Para desarrollo con SQLite
npm run db:push

# Para producción con PostgreSQL
npx prisma migrate dev
```

5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

## 🔧 Configuración

### Variables de Entorno
Crear un archivo `.env.local` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Z-AI SDK (opcional)
ZAI_API_KEY="your-zai-api-key"
```

### Configuración de Base de Datos
El proyecto está configurado para usar:
- **SQLite** para desarrollo local
- **PostgreSQL** para producción

Para cambiar a PostgreSQL:
1. Modificar el `DATABASE_URL` en `.env.local`
2. Actualizar el `schema.prisma`
3. Ejecutar `npx prisma migrate dev`

## 📁 Estructura del Proyecto
```
src/
├── app/                 # Páginas y rutas API
├── components/          # Componentes React
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y configuración
└── types/              # Definiciones TypeScript
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 🔄 Sincronización Multi-Dispositivo

Para usar la aplicación en múltiples dispositivos (Mac y Windows) con datos sincronizados:

### 1. Configurar Base de Datos Remota
- Usar PostgreSQL en un servicio como:
  - Supabase (gratis y fácil)
  - Railway
  - Heroku Postgres
  - DigitalOcean Managed Databases

### 2. Configurar Repositorio Remoto
```bash
git remote add origin <url-del-repositorio>
git push -u origin master
```

### 3. Clonar en Otro Dispositivo
```bash
git clone <url-del-repositorio>
cd sistema-gestion-cursos
npm install
cp .env.example .env.local
# Configurar DATABASE_URL con la base de datos remota
npm run db:push
npm run dev
```

## 📊 Funcionalidades Principales

### Gestión Académica
- ✅ Gestión de alumnos
- ✅ Gestión de profesores
- ✅ Gestión de cursos
- ✅ Matrículas e inscripciones
- ✅ Horarios y calendario

### Gestión Financiera
- ✅ Control de pagos
- ✅ Facturación
- ✅ Reportes financieros

### Reportes y Analíticas
- ✅ Dashboard con métricas
- ✅ Reportes académicos
- ✅ Reportes financieros
- ✅ Estadísticas avanzadas

## 🤝 Contribuir
1. Hacer fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte
Para soporte técnico, puedes:
- Crear un issue en el repositorio
- Enviar un email al administrador
- Consultar la documentación

---

**Desarrollado con ❤️ para la gestión educativa**