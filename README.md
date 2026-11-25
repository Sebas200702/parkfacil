# ParkFácil

Plataforma SaaS multi-tenant de monitoreo, tarifas y reservas de parqueaderos.
Proyecto del curso Buenas Prácticas de Desarrollo de Software.

| Carpeta            | Contenido                                |
| ------------------ | ---------------------------------------- |
| `apps/web`         | Frontend React (conductor y panel admin) |
| `services/api`     | Lambdas en TypeScript                    |
| `infra`            | Plantilla AWS SAM                        |
| `tools/sensor-sim` | Simulador de sensores                    |
| `tools/seed`       | Datos de prueba                          |
| `docs`             | Contrato de la API y guías               |

## Comandos

```bash
npm install
npm run lint && npm run typecheck && npm test && npm run build
npm run db:local && npm run test:int   # pruebas de integración con DynamoDB Local
npm run dev -w @parkfacil/web          # frontend en http://localhost:5173 (Next.js; /ui abre el sistema de diseño)
```

## Probar la app en local contra el Learner Lab

App publicada: <https://parkfacil.app>.

1. Node 22 (`.nvmrc`) y `npm install` en la raíz.
2. Crea `apps/web/.env.local` (git lo ignora) con los datos del stack del lab:

   ```bash
   NEXT_PUBLIC_API_URL=/api
   API_PROXY_TARGET=https://qm7k00c3ie.execute-api.us-east-1.amazonaws.com
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_Vmomy3wX4
   NEXT_PUBLIC_COGNITO_CLIENT_ID=2574arg5uv33vm6ll8k473pmil
   NEXT_PUBLIC_COGNITO_DOMAIN=parkfacil-auth.auth.us-east-1.amazoncognito.com
   ```

   La API solo acepta CORS desde `https://parkfacil.app`; por eso el navegador llama a `/api` y
   Next.js la reenvía a `API_PROXY_TARGET`. Si el stack se recrea, toma los valores nuevos de sus
   salidas (`ApiUrl`, `UserPoolId`, `UserPoolClientId`, `CognitoDomain`).
3. `npm run dev -w @parkfacil/web` y abre <http://localhost:5173>.
4. Inicia sesión:
   - Conductor: "Continuar con Google" o `conductor@parkfacil.test`.
   - Admin: `admin.centro-93@parkfacil.test`, `admin.zona-t@parkfacil.test` o
     `admin.usaquen@parkfacil.test`.
   - Contraseña de los usuarios de demostración: `ParkFacil2026`.

Ten en cuenta:

- La API, Cognito y los datos solo responden mientras alguien tenga el Learner Lab iniciado.
  Sin lab, deja `NEXT_PUBLIC_API_URL` y las de Cognito vacías y el frontend usa parqueaderos de demostración.
- Los datos son compartidos: reservas y tarifas que cambies se ven para todo el equipo.
- Antes de abrir un PR: `npm run lint && npm run typecheck && npm test && npm run build`.

Despliegue en AWS Emulator y en el Learner Lab: [docs/despliegue.md](docs/despliegue.md).
Contrato de la API y modelo de datos: [docs/api.md](docs/api.md).
Sistema de diseño del frontend: [docs/sistema-de-diseno.md](docs/sistema-de-diseno.md).
