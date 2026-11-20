# backend-mvp — Backend e infraestructura AWS del MVP de ParkFácil

Objetivo: entregar las responsabilidades de Sebastian del plan (`ParkFacil_Plan_MVP_y_Roles.docx`, sección 5): plantilla SAM, Lambdas, reservas con transacción y vencimiento, IoT, Cognito y SES, listo para desplegar en AWS Academy Learner Lab (Vocareum).
Rama: `feat/backend-mvp`. Entrega: commits por unidad; push/PR los decide el usuario. Runner: Vitest (`npm test`; integración con DynamoDB Local vía Docker).

## Specs

- S1 Repo: monorepo con `services/api`, `infra/template.yaml`, `tools/sensor-sim`, `docs/`, CI GitHub Actions (lint, tipos, pruebas, build) sin despliegue. Plan: "La CI solo valida".
- S2 Infra SAM desplegable en Learner Lab: todo rol = `LabRole` ("el laboratorio no permite crear roles IAM"). DynamoDB on-demand, API Gateway HTTP con JWT de Cognito, Lambdas Node.js, Cognito (grupos conductor/admin, atributo `custom:parqueaderoId`), regla IoT, S3 + CloudFront.
- S3 Concurrencia de reservas, verbatim del plan: "La reserva se crea con una transacción de DynamoDB (TransactWriteItems): descuenta el cupo con la condición cuposDisponibles > 0 y crea el registro de reserva. Si la condición falla, la API responde 409 “Sin cupos”."
- S4 Aislamiento multi-tenant, verbatim: "Las Lambdas toman el parqueaderoId del token, nunca del cuerpo de la petición, así un administrador no puede leer ni modificar otro parqueadero."
- S5 Reservas: "Reserva de un cupo por 15 minutos, cancelación y vencimiento automático." Vencimiento con EventBridge Scheduler; alternativa del plan: "Regla programada cada minuto que vence reservas con venceEn pasado."
- S6 Sensores: "Simulador de sensores que cambia el estado de los espacios y actualiza los cupos." Tópico `parkfacil/{parqueaderoId}/espacios/{espacioId}` con `{"estado":"OCUPADO","ts":...}`. Alternativa: "El simulador llama un endpoint POST /sensores/eventos con API key."
- S7 Endpoints del contrato (plan 4.3): GET /parqueaderos, GET /parqueaderos/{id}, POST /reservas, DELETE /reservas/{id}, GET /reservas/mias, GET /admin/espacios, PUT /admin/tarifas, GET /admin/metricas. Contrato en `docs/openapi.yaml`.
- S8 Correo de confirmación SES (deseable); si SES no está disponible no debe romper la reserva.
- S9 Métricas admin (deseable): "ocupación, ingresos estimados y horas pico".

Supuestos (marcados): GET /parqueaderos* es público para mostrar el mapa sin login; tarifas guardadas dentro del ítem META (no ítems TARIFA#) para listar en una sola lectura; la reserva aparta un espacio concreto (estado RESERVADO) para no descontar dos veces cuando el carro llega; cobro = horas × valorHora + fracciones de 15 min × valorFraccion, tope valorDia por cada 24 h, mínimo una fracción.

## Tasks

- [x] T1 S1 scaffold monorepo + CI — inline — 59f1ee7, e9ec67a
- [x] T2 S3 S5 S6 S9 dominio puro (transiciones, cobro, claims) + pruebas — inline — 2da47e0, 02f8509
- [x] T3 S3 S4 S5 S6 repositorio DynamoDB + servicios + pruebas de integración (DynamoDB Local) — inline — 15c010e, 29ecbf0
- [x] T4 S4 S7 S8 handlers Lambda + contrato (docs/api.md; openapi.yaml pendiente con Giselle) — inline — 24e6b0b, e9ec67a
- [x] T5 S2 S5 S6 plantilla SAM + simulador + seed + guía de despliegue — inline — f06480b, 2c17460, 79b7e8c
- [ ] T6 S2 despliegue real en Learner Lab y verificación de autorizador JWT, regla IoT y Scheduler — requiere sesión del lab

Ruta: todo inline (una sola unidad de comportamiento encadenada; ningún disparador de writer).

## Log

- L1 (2026-11-20) Usuario: "Bueno epecemos con mis resposabilidades de una"
- L2 Contexto: lab = AWS Academy Learner Lab en Vocareum; sin `iam:CreateRole`; credenciales temporales; entrega antes del 2026-11-28; IA permitida.
- L3 (2026-11-20) Usuario: "recuerda seguir la calidad y patrones de codigo que estableci y configuro en mis proyectos". Se reestructuró a convenciones (skill code-conventions + biome.json del CRM): capas handler→service→repository, AppError/withErrorHandling/jsonOk/jsonError, tipos en -types.ts, alias @shared/@domains/@tests, pruebas en __tests__/, Biome sin `;` y comillas simples. Decisión: identificadores en inglés; campos del contrato en español tal como los publicó el plan (parqueaderoId, cupos, venceEn).
- L4 (2026-11-20) Usuario: "Hay un simulador oficial de aws usemoslo para probar toda la arquitectura antes de montarla en el lab". AWS Emulator 1.0.533 (binario del RPM en ~/.local/bin). Stack desplegado completo; prueba de humo 15/15. Huecos del emulador: no valida JWT en API Gateway, regla IoT no invoca Lambda, no respeta WriteAttributes de Cognito, no transforma eventos SAM IoTRule/Cognito (se hicieron explícitos), changeset de actualización se autoejecuta (deploy.sh lo maneja).
- L5 Evidencia: lint OK, typecheck OK, 46 unitarias + 15 integración (DynamoDB Local, incluye 5 reservas simultáneas por 1 cupo → 1 OK, 4×409 "Sin cupos"), build 13 bundles, prueba de humo emulador 15/15. Excepción test-first: las pruebas se escribieron después del código en esta sesión (no hubo RED observado).
- L6 Siguiente: T6 en el lab (verificar authorizer, IoT, Scheduler con LabRole, SES), openapi.yaml con Giselle, frontend usa ID token.
