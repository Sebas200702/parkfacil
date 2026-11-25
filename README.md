# ParkFácil

Plataforma SaaS multi-tenant de monitoreo, tarifas y reservas de parqueaderos.
Proyecto del curso Buenas Prácticas de Desarrollo de Software.

**App publicada:** <https://parkfacil.app>

| Carpeta            | Contenido                                |
| ------------------ | ---------------------------------------- |
| `apps/web`         | Frontend React (conductor y panel admin) |
| `services/api`     | Lambdas en TypeScript                    |
| `infra`            | Plantilla AWS SAM                        |
| `tools/sensor-sim` | Simulador de sensores                    |
| `tools/seed`       | Datos de prueba                          |
| `docs`             | Contrato de la API y guías               |

## Getting Started

### Requisitos previos
- **Node.js** 22 o superior (verificado en `.nvmrc`) y **npm** 10+
- **Git** configurado con acceso de colaborador al repositorio
- **Docker** (opcional, para ejecutar DynamoDB Local en las pruebas de integración)
- **AWS CLI** y **AWS SAM CLI** (para despliegue de infraestructura en AWS)

### Instalación y ejecución local contra el Learner Lab
1. Clonar el repositorio e instalar las dependencias desde la raíz:
   ```bash
   git clone [https://github.com/Sebas200702/parkfacil.git](https://github.com/Sebas200702/parkfacil.git)
   cd parkfacil
   npm install
