# 🔐 Auth Base — Especificación del Proyecto

> Base de autenticación reutilizable para proyectos que necesitan un sistema de login robusto.

---

## 📋 Requerimiento Original

```
Repositorio base con estructura firme de Login:

- Verificación de correo
- Google OAuth
- Monitoreo mediante Grafana con tableros de logs de quien entra quien no
- Estructura base de login de Admin y Usuario común

Backend: Node.js con NestJS
Frontend: Angular para pruebas con navbar diferenciado por rol
```

---

## 🏗️ Decisiones de Arquitectura

### Backend: NestJS

| Característica | Beneficio |
|----------------|-----------|
| Arquitectura modular | AuthModule, UsersModule separados |
| Decoradores | `@Roles('ADMIN')`, `@Public()` |
| Inyección de dependencias | Servicios conectados automáticamente |
| Swagger automático | Documentación desde DTOs |
| Passport.js integrado | JWT + Google OAuth |

### Base de Datos: PostgreSQL + Prisma ORM

- Schema declarativo en `schema.prisma`
- Migraciones automáticas
- Cliente TypeScript tipado

### Frontend: Angular 17+ (Standalone Components)

- Angular Material UI
- Guards para rutas protegidas
- Signals para estado reactivo
- Interceptors para JWT

### Monitoreo: Grafana + Loki + Promtail + Prometheus

| Herramienta | Función |
|-------------|---------|
| **Loki** | Almacena logs detallados |
| **Promtail** | Recolecta logs del backend |
| **Prometheus** | Métricas numéricas |
| **Grafana** | Dashboards de visualización |

---

## 📁 Estructura

```
Login/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Login, Register, OAuth, JWT
│   │   ├── users/             # CRUD usuarios (Admin)
│   │   ├── common/            # Guards, Decorators
│   │   ├── prisma/            # Cliente BD
│   │   ├── logging/           # Logger Pino
│   │   └── metrics/           # Prometheus
│   └── prisma/schema.prisma
│
├── frontend/                   # Angular UI
│   └── src/app/
│       ├── auth/              # Login, Register
│       ├── admin/             # Dashboard, Users, Logs
│       └── user/              # Profile
│
├── monitoring/                 # Observabilidad
│   ├── docker-compose.yml
│   ├── grafana/dashboards/
│   ├── prometheus/
│   └── promtail/
│
└── docker-compose.yml          # App (Postgres + Backend + Frontend)
```

---

## 🚀 Levantar el Proyecto

### Desarrollo

```bash
# Base de datos
docker-compose up -d postgres

# Backend
cd backend && npm install && npx prisma migrate dev && npm run start:dev

# Frontend
cd frontend && npm install && ng serve

# Monitoreo (opcional)
docker-compose -f monitoring/docker-compose.yml up -d
```

### Producción

```bash
docker-compose up -d
docker-compose -f monitoring/docker-compose.yml up -d
```

---

## 🔗 URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| Grafana | http://localhost:3001 (admin/admin) |

### Usuarios Seed

| Email | Password | Rol |
|-------|----------|-----|
| admin@authbase.com | Admin123! | ADMIN |
| user@authbase.com | User123! | USER |

---

## 📐 Modelo de Datos

```prisma
model User {
  id                       String    @id @default(uuid())
  email                    String    @unique
  password                 String?
  firstName                String
  lastName                 String
  role                     Role      @default(USER)
  provider                 Provider  @default(LOCAL)
  googleId                 String?   @unique
  avatarUrl                String?
  isEmailVerified          Boolean   @default(false)
  isActive                 Boolean   @default(true)
  loginHistory             LoginHistory[]
}

enum Role { ADMIN, USER }
enum Provider { LOCAL, GOOGLE }
```
