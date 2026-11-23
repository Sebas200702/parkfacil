# Uso de Inteligencia Artificial en el Proyecto ParkFácil

Este documento registra qué artefactos, código y documentación del proyecto **ParkFácil** fueron asistidos o generados con Inteligencia Artificial, las herramientas utilizadas, las reglas aplicadas y el proceso de verificación realizado por el equipo.

## 1. Lineamientos del equipo para el uso de IA

* **Revisión humana obligatoria:** Todo código o documentación generado con IA pasa por Pull Request y es revisado por otro integrante del equipo antes de fusionarse a `main`.
* **Pruebas automatizadas:** Cualquier lógica de negocio generada con apoyo de IA debe contar con pruebas unitarias o de integración en verde en la CI antes de aprobarse.
* **Seguridad de credenciales:** Nunca se comparten credenciales reales de AWS Academy Learner Lab (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` ni IDs privados) en los prompts.

---

## 2. Artefactos generados o asistidos con IA

### 2.1 Backend e Infraestructura AWS (`services/api`, `infra/template.yaml`, `tools/sensor-sim`)
* **Qué se generó:**
  * Estructura inicial del monorepo, configuración de TypeScript, Biome, Vitest y flujo de integración continua (CI) en GitHub Actions.
  * Lógica de dominio puro: máquina de estados de espacios (`LIBRE`, `RESERVADO`, `OCUPADO`), cálculo de tarifas por hora/fracción de 15 minutos con tope diario y validación de claims JWT.
  * Capa de acceso a datos en DynamoDB con transacciones atómicas (`TransactWriteItems`) para prevenir sobreventa de cupos y aislamiento multi-tenant mediante `custom:parqueaderoId`.
  * Handlers Lambda para los 8 endpoints de la API REST, plantilla AWS SAM compatible con `LabRole`, simulador de sensores IoT y scripts de datos de demostración (`seed`).
* **Cómo se revisó y validó:**
  * **Análisis estático y tipado:** Verificación automática con Biome (lint/formato) y `tsc` (verificación estricta de tipos).
  * **Pruebas automatizadas (Vitest):** Ejecución de **46 pruebas unitarias** y **15 pruebas de integración** contra DynamoDB Local (Docker), incluyendo pruebas de concurrencia (5 peticiones simultáneas por 1 último cupo, verificando 1 éxito `201` y 4 rechazos `409 Sin cupos`).
  * **Pruebas en emulador local:** Despliegue completo en AWS Emulator (v1.0.533) y ejecución de una prueba de humo (*smoke test*) de 15 escenarios de punta a punta.
  * **Ajustes manuales:** Se corrigieron manualmente las diferencias entre el emulador y AWS real (definición explícita de eventos SAM para reglas IoT y triggers de Cognito, y manejo de *changesets* en `deploy.sh`).
  * **Revisión por pares (Code Review):** El código se dividió en 12 Pull Requests encadenados (máximo ~400 líneas cada uno), revisados y aprobados por Giselle Falcón (PRs #1–#6), Esteban Meléndez (PRs #7–#11) y Owen López (PR #12).

### 2.2 Documentación Técnica (`docs/api.md`, `docs/despliegue.md`, `README.md`)
* **Qué se generó:** Redacción inicial del contrato de la API REST, especificaciones de tópicos IoT Core, guía de despliegue paso a paso (local y AWS Learner Lab) y bitácora técnica (`odd/tasks/backend-mvp.md`).
* **Cómo se revisó y validó:** Revisión manual línea por línea contra el plan del MVP (rutas, códigos HTTP `200/201/404/409`, estructura de respuesta `{ data, status, error }` y uso de `LabRole`) antes de aprobar y fusionar el PR #24 en `main`.

### 2.3 Frontend y Documentación de Entrega (`apps/web`, `docs/uso-de-ia.md`, `docs/manual-usuario.md`)
* **Qué se generó:** Apoyo en la estructura de componentes base en React + TypeScript + Tailwind y redacción de guías de usuario y bitácoras.
* **Cómo se revisó y validó:** Pruebas funcionales en navegador, verificación de integración contra los contratos de `docs/api.md` y revisión de redacción por el responsable de documentación.
