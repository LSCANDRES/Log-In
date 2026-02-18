# 🔐 Log-In — Sistema de Autenticación Base Reutilizable

## Descripción
Repositorio base de autenticación diseñado para ser consumido por múltiples proyectos.
Incluye login por email con verificación, Google OAuth, control de roles y monitoreo con Grafana.
Todo dockerizado y listo para producción.

## Stack Tecnológico

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL 16** + **Prisma ORM**
- **Passport.js** (JWT + Google OAuth)
- **Nodemailer** (verificación de email)
- **Pino** (logging estructurado)
- **Docker** (multi-stage build)

### Frontend (Testing UI)
- **Angular 17+** (Standalone Components)
- **Angular Material**
- **Nginx** (serving en producción)

### Monitoreo
- **Grafana** (dashboards de login activity)
- **Loki** (agregación de logs)
- **Promtail** (recolección de logs)

### Infraestructura
- **Docker** + **Docker Compose**
- **PostgreSQL** (containerized)
- **Nginx** (reverse proxy para Angular)

## Estructura del Proyecto
```
├── backend/                  # NestJS API
│   ├── Dockerfile           # Multi-stage build
│   ├── src/
│   │   ├── auth/            # Módulo de autenticación
│   │   ├── users/           # Módulo de usuarios
│   │   ├── common/          # Guards, decorators, filters
│   │   ├── logging/         # Logging estructurado
│   │   ├── prisma/          # Prisma service
│   │   └── config/          # Configuración centralizada
│   └── prisma/              # Schema y migraciones
├── frontend/                 # Angular Testing UI
│   ├── Dockerfile           # Multi-stage build + Nginx
│   ├── nginx.conf           # Nginx config con API proxy
│   └── src/
│       ├── app/
│       │   ├── auth/        # Login, Register, Verify Email
│       │   ├── admin/       # Dashboard, Users, Logs (3 navbar items)
│       │   ├── user/        # Profile (navbar simple)
│       │   └── core/        # Guards, interceptors, services, models
│       └── environments/
├── monitoring/               # Grafana + Loki
│   ├── grafana/             # Dashboards + provisioning
│   ├── loki/                # Loki config
│   └── promtail/            # Promtail config
├── docker-compose.yml        # Infraestructura completa
├── .env                      # Variables de entorno (local)
└── .env.example              # Template de variables
```

---

## 🐳 Quick Start con Docker (Recomendado)

### Prerequisitos
- Docker & Docker Compose

### 1. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores (JWT secrets, Google OAuth, SMTP, etc.)
```

### 2. Levantar TODO con un comando
```bash
docker-compose up -d --build
```

### 3. Ejecutar migraciones y seed
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### 4. Acceder
| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:3000/api |
| **Swagger Docs** | http://localhost:3000/api/docs |
| **Grafana** | http://localhost:3001 (admin/admin) |
| **PostgreSQL** | localhost:5432 |

---

## 💻 Desarrollo Local (sin Docker)

### Prerequisitos
- Node.js 18+
- PostgreSQL 16+
- Angular CLI (`npm i -g @angular/cli`)
- NestJS CLI (`npm i -g @nestjs/cli`)

### 1. Levantar solo PostgreSQL con Docker
```bash
docker-compose up -d postgres
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install
ng serve
```

### 4. Acceder
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs

---

## 👥 Roles y Navbar

| Rol | Descripción | Navbar Items |
|-----|-------------|--------------|
| **ADMIN** 🛡️ | Administrador del sistema | Dashboard, Usuarios, Logs |
| **USER** 👤 | Usuario común | Mi Perfil |

### Credenciales de prueba (seed)
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@authbase.com | Admin123! |
| User | user@authbase.com | User123! |

---

## 🔑 Variables de Entorno

Ver `.env.example` en la raíz para Docker Compose y `backend/.env.example` para desarrollo local.

Variables principales:
| Variable | Descripción | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario de PostgreSQL | auth_user |
| `POSTGRES_PASSWORD` | Password de PostgreSQL | auth_password_2026 |
| `JWT_SECRET` | Secret para access tokens | (cambiar) |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens | (cambiar) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | (opcional) |
| `SMTP_USER` | Email SMTP para envío | (opcional) |

---

## 📊 Monitoreo con Grafana

Grafana viene preconfigurado con un dashboard de **Auth System - Login Monitoring** que incluye:
- ✅ Successful logins per hour
- ❌ Failed logins per hour
- 👤 Who logged in (recent)
- 🚫 Who failed to login
- 🌐 Google OAuth events

---

## 🏗️ Comandos Docker útiles

```bash
# Levantar todo
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f backend

# Acceder al contenedor backend
docker-compose exec backend sh

# Ejecutar Prisma Studio
docker-compose exec backend npx prisma studio

# Detener todo
docker-compose down

# Detener y borrar volúmenes (reset completo)
docker-compose down -v
```

## Licencia
MIT
