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
```

Despliegue en AWS Emulator y en el Learner Lab: [docs/despliegue.md](docs/despliegue.md).
Contrato de la API y modelo de datos: [docs/api.md](docs/api.md).
