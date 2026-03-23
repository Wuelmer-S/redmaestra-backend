# RedMaestra — Backend

API REST del proyecto RedMaestra, construida con NestJS y PostgreSQL.

## Prerrequisitos

- [Node.js](https://nodejs.org/) v20 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## Configuración inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/Wuelmer-S/redmaestra-backend.git
cd redmaestra-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

### 4. Levantar la base de datos
```bash
docker compose up -d
```

### 5. Levantar el servidor
```bash
npm run start:dev
```

La API estará en `http://localhost:3000`

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Servidor con hot-reload |
| `npm run test` | Tests unitarios |
| `docker compose up -d` | Levantar base de datos |
| `docker compose down` | Detener base de datos |

## Equipo

| Rol | Nombre |
|---|---|
| Hustler | Wuelmer Saldaña |
| Hacker | Bastian Reyes |
| Hacker | Ignacio González |
| Hipster | Byron Agurto |