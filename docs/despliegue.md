# Despliegue

La misma plantilla (`infra/template.yaml`) se prueba primero en **AWS Emulator** (local, gratis)
y luego se despliega en el **AWS Academy Learner Lab** (Vocareum).

## 1. Probar todo en AWS Emulator

Requisitos: Node 22+, AWS CLI v2 y el binario `aws-emulator`
([github.com/aws/aws-emulator](https://github.com/aws/aws-emulator)). En Linux sin `dnf`/`apt`
se puede extraer el RPM: `bsdtar -xf aws-emulator-x86_64.rpm` y usar `opt/aws-emulator/bin/aws-emulator`.

```bash
npm install
npm run emulator:start     # en otra terminal; deja el emulador en https://127.0.0.1:9297
npm run emulator:deploy    # crea LabRole simulado, empaqueta, despliega y carga datos de demo
npm run emulator:smoke     # prueba de humo de toda la arquitectura
```

`npm run emulator:deploy` se puede repetir: actualiza el stack.

### Qué no cubre el emulador (versión 1.0.533)

| Servicio | Comportamiento en el emulador | Cómo se cubre |
|---|---|---|
| API Gateway: autorizador JWT | No valida el token ni pasa los claims a la Lambda | La prueba de humo invoca las Lambdas con los claims de un token real de Cognito. Verificar en el lab. |
| IoT Core: regla → Lambda | Acepta `publish` y crea la regla, pero no invoca la Lambda | La Lambda `sensor-iot` se prueba invocándola con el mensaje de la regla. Verificar en el lab. |
| Cognito: `WriteAttributes` | Permite escribir `custom:parqueaderoId` en el registro | En AWS real se rechaza. Además, sin el grupo `admin` ese atributo no da acceso. |
| `cloudformation deploy` en actualizaciones | Ejecuta el changeset solo y el CLI responde `EXECUTE_IN_PROGRESS` | `tools/emulator/deploy.sh` lo detecta y espera. |
| Eventos SAM `IoTRule` y `Cognito` | No se transforman | La plantilla declara `AWS::IoT::TopicRule` y `LambdaConfig` explícitos. |

## 2. Desplegar en el Learner Lab

### Presupuesto: USD 50 por cuenta de lab

Si se agota el crédito, el lab se bloquea y se pueden perder los recursos. ParkFácil es serverless y
cuesta menos de USD 1 en la semana (el barrido de cada minuto, unas 11.500 invocaciones, cuesta centavos).

- Se despliega en **un solo lab** (el de Sebastian). Los demás usan la URL compartida.
- No crear EC2, RDS, NAT Gateway, ElastiCache ni OpenSearch: cobran por hora aunque nadie los use.
- No dejar el simulador de sensores corriendo horas; cada evento es una Lambda y escrituras en DynamoDB.
- Revisar el saldo en Vocareum al iniciar cada sesión. Si pasa de USD 10, avisar al equipo.


1. En Vocareum: **Start Lab** y luego **AWS Details → AWS CLI → Show**. Copia las credenciales en
   `~/.aws/credentials` (perfil `default`). Caducan con la sesión: repite este paso en cada sesión.
2. Compila y empaqueta:

   ```bash
   npm ci && npm run build
   BUCKET=parkfacil-artifacts-$(aws sts get-caller-identity --query Account --output text)
   aws s3 mb s3://$BUCKET
   aws cloudformation package --template-file infra/template.yaml --s3-bucket $BUCKET \
     --output-template-file packaged.yaml
   ```

3. Despliega (no se necesita `CAPABILITY_IAM`: la plantilla no crea roles, usa `LabRole`):

   ```bash
   aws cloudformation deploy --template-file packaged.yaml --stack-name parkfacil \
     --capabilities CAPABILITY_AUTO_EXPAND \
     --parameter-overrides SensorApiKey=<clave-secreta> SesFrom=<correo-verificado-o-vacío>
   ```

   Para el frontend agrega `FrontendDomain=<dominio> AllowedOrigin=https://<dominio>` (ver
   sección 4). Sin dominio, el bucket se crea con nombre automático y solo responde por la URL de S3.
   `DeployFrontend=false` omite el bucket del frontend.
   `UseScheduler=false` solo si EventBridge Scheduler no acepta `LabRole` (en el lab sí lo acepta).
4. Carga los datos de demostración:

   ```bash
   out() { aws cloudformation describe-stacks --stack-name parkfacil \
     --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
   cd services/api && TABLE_NAME=$(out TableName) USER_POOL_ID=$(out UserPoolId) npm run seed
   ```

5. Simula sensores: `TABLE_NAME=$(out TableName) PARQUEADERO=centro-93 npm run sensor-sim`.

### Resultado verificado en el lab (2026-11-20)

| Prueba | Resultado |
|---|---|
| `POST /reservas` sin token | 401 `{"message":"Unauthorized"}` del autorizador JWT |
| Reserva con ID token de Cognito | 201; segunda reserva 409 `ACTIVE_RESERVATION` |
| Conductor en `/admin/espacios` | 403 |
| `PUT /admin/tarifas` con otro `parqueaderoId` en el cuerpo | Cambia solo el parqueadero del token |
| EventBridge Scheduler con `LabRole` | Vence la reserva sola: `venceEn` 17:35:55, `VENCIDA` a las 17:36:22; espacio liberado y programación borrada |
| MQTT → regla IoT → Lambda | El espacio pasa a `OCUPADO` |

Notas del lab:

- CloudShell no llega al endpoint de datos de IoT (`aws iot-data publish` falla al conectar).
  Para publicar mensajes usa **IoT Core → MQTT test client** en la consola, o el simulador con
  `MODO=http API_URL=<ApiUrl> SENSOR_API_KEY=<clave>`.
- La terminal de CloudShell a veces deja de refrescar: recarga la página y, si el prompt no vuelve, presiona Ctrl+C.
- CloudFront está bloqueado (`cloudfront:CreateOriginAccessControl` y las OAI se niegan), por eso el
  frontend usa hosting estático de S3 y Cloudflare para el HTTPS (sección 4).

## 3. Datos para el frontend

| Variable | Salida del stack |
|---|---|
| `VITE_API_URL` | `ApiUrl` |
| `VITE_USER_POOL_ID` | `UserPoolId` |
| `VITE_USER_POOL_CLIENT_ID` | `UserPoolClientId` |

## 4. Frontend en S3 con dominio propio (Cloudflare)

El endpoint de website de S3 solo habla HTTP y enruta por el header `Host`, así que el bucket debe
llamarse exactamente como el dominio (`FrontendDomain`). Cloudflare pone el HTTPS adelante.

1. Despliega con `FrontendDomain=app.<dominio>` y `AllowedOrigin=https://app.<dominio>`.
2. Sube el sitio: `aws s3 sync apps/web/out s3://app.<dominio> --delete`.
3. En Cloudflare, DNS: registro `CNAME` `app` → valor de la salida `FrontendWebsiteUrl` sin `http://`
   (`app.<dominio>.s3-website-us-east-1.amazonaws.com`), con el proxy activado (nube naranja).
4. En Cloudflare, SSL/TLS: modo **Flexible** (S3 website no acepta HTTPS hacia el origen).
5. Comprueba `https://app.<dominio>` y que el login llame a la API sin errores de CORS.

El bucket solo permite leer objetos (`s3:GetObject`); listar y escribir siguen privados.
`FrontendErrorDocument` es `404.html` (lo genera `next build` con `output: 'export'`).

## Notas del frontend

El frontend debe enviar el **ID token** de Cognito en `Authorization: Bearer <idToken>`.
El access token no sirve: no trae `email`, `custom:parqueaderoId` ni el `aud` que valida la API.

Usuarios de demostración (contraseña `ParkFacil2026`): `conductor@parkfacil.test`,
`admin.centro-93@parkfacil.test`, `admin.zona-t@parkfacil.test`, `admin.usaquen@parkfacil.test`.

## 5. Despliegue automático (GitHub Actions)

`.github/workflows/deploy.yml` corre después de cada merge a `main` (o a mano desde
**Actions → Deploy → Run workflow**):

| Job | Qué hace |
|---|---|
| `credentials` | Revisa los secretos. Sin secretos omite el despliegue; con credenciales caducadas falla con un aviso. |
| `backend` | Empaqueta las Lambdas y despliega el stack `parkfacil` con CloudFormation. |
| `frontend` | Lee las salidas del stack, compila `apps/web` con esas variables y sube el sitio con `aws s3 sync`. |

Configuración del repositorio (**Settings → Secrets and variables → Actions**), solo el líder técnico:

- Secretos `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_SESSION_TOKEN`: copiarlos de
  **AWS Details → AWS CLI** en Vocareum al iniciar cada sesión del lab (caducan en ~4 h).
- Variable `FRONTEND_DOMAIN` (ej. `app.<dominio>`): nombra el bucket y ajusta el CORS de la API.

Las credenciales del lab dan acceso a toda la cuenta: no se comparten por chat; solo van a estos secretos.
