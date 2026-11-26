
# Guía de simulación y pruebas de sensores — ParkFácil

Esta guía explica cómo simular eventos de sensores de estacionamiento en ParkFácil y verificar el cambio de estado de los espacios, la actualización de cupos disponibles y el cumplimiento de reservas.

## 1. Arquitectura y flujo del evento

ParkFácil permite recibir lecturas de sensores mediante MQTT o HTTP.

### Flujo MQTT

1. El sensor publica una lectura en AWS IoT Core.
2. El mensaje llega al tópico:

   `parkfacil/{parqueaderoId}/espacios/{espacioId}`

3. Una regla de AWS IoT Core extrae los identificadores del tópico.
4. La regla invoca la función Lambda `sensor-iot`.
5. La función valida y procesa el mensaje.
6. El servicio actualiza la información correspondiente en DynamoDB.

### Flujo HTTP alternativo

También se pueden enviar lecturas mediante `POST /sensores/eventos`, utilizando la clave configurada en `SENSOR_API_KEY` a través del encabezado `x-api-key`.

Ejemplo de solicitud:

```bash
curl -X POST "<API_URL>/sensores/eventos" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <SENSOR_API_KEY>" \
  -d '{
    "parqueaderoId": "centro-93",
    "espacioId": "C-01",
    "estado": "OCUPADO",
    "ts": 1763900000
  }'
```

Reemplaza `<API_URL>` y `<SENSOR_API_KEY>` por los valores de tu entorno. Los identificadores del parqueadero y del espacio deben existir en DynamoDB.

## 2. Estructura del mensaje del sensor

El mensaje utiliza los siguientes campos:

| Campo | Descripción |
|---|---|
| `parqueaderoId` | Identificador del parqueadero. En MQTT se obtiene del tópico. |
| `espacioId` | Identificador del espacio. En MQTT se obtiene del tópico. |
| `estado` | Estado del espacio: `LIBRE` u `OCUPADO`. |
| `ts` | Marca de tiempo opcional en segundos Unix. Si se omite, se utiliza la hora de llegada. |

El sistema valida los campos y rechaza fechas que superen los cinco minutos de adelanto respecto a la hora actual.

## 3. Prueba manual desde AWS IoT Core

Para probar la recepción de eventos mediante MQTT:

1. Ingresa a la consola de AWS.
2. Selecciona la región `us-east-1`.
3. Abre AWS IoT Core.
4. Ingresa a **MQTT test client**.
5. Selecciona **Publish to a topic**.
6. Configura el tópico con el identificador del parqueadero y del espacio:

   `parkfacil/centro-93/espacios/<espacioId>`

7. Envía un mensaje JSON:

   ```json
   {
     "estado": "OCUPADO",
     "ts": 1763900000
   }
   ```

8. Haz clic en **Publish**.

Para probar la salida de un vehículo, publica otro mensaje cambiando el estado a `LIBRE`.

**Importante:** utiliza identificadores de parqueadero y espacios existentes. En MQTT, `parqueaderoId` y `espacioId` se extraen automáticamente del tópico.

## 4. Simulador automatizado de sensores

El proyecto incluye un simulador ubicado en `services/api/src/scripts/sensor-sim.ts`.

Desde la raíz del proyecto, ejecuta:

```bash
npm run sensor-sim -w @parkfacil/api
```

### Configuración predeterminada

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `PARQUEADERO` | `centro-93` | Parqueadero donde se simulan los eventos. |
| `MODO` | `iot` | Medio de envío: `iot` o `http`. |
| `INTERVALO_MS` | `2000` | Tiempo entre eventos, en milisegundos. |
| `EVENTOS` | `20` | Cantidad de eventos que genera el simulador. |

El simulador consulta los espacios del parqueadero y genera cambios aleatorios entre `LIBRE` y `OCUPADO`.

Por defecto utiliza MQTT mediante AWS IoT Core. Para ejecutarlo necesita acceso a AWS y permisos para consultar los espacios y publicar los mensajes.

### Ejecución mediante HTTP

También se puede utilizar el modo HTTP configurando las variables necesarias:

```bash
PARQUEADERO=centro-93 MODO=http API_URL=<URL_API> SENSOR_API_KEY=<CLAVE> npm run sensor-sim -w @parkfacil/api
```

En este modo, el simulador envía las lecturas al endpoint `POST /sensores/eventos`. La clave debe coincidir con la configurada en `SENSOR_API_KEY` en la infraestructura.

## 5. Comportamiento esperado del sistema

El servicio procesa las transiciones de estado de la siguiente manera:

| Estado anterior | Nuevo estado | Efecto en cupos disponibles |
|---|---|---|
| `LIBRE` | `OCUPADO` | Disminuye en 1. |
| `OCUPADO` | `LIBRE` | Aumenta en 1. |
| `RESERVADO` | `OCUPADO` | No cambia, porque el cupo ya estaba descontado. |

Cuando un espacio reservado pasa a `OCUPADO`, la reserva asociada se actualiza a `CUMPLIDA`.

Las lecturas repetidas que no producen una transición no modifican los cupos ni generan un nuevo evento.

Cuando ocurre una entrada o salida, el sistema registra el evento correspondiente. En las salidas también calcula el valor a cobrar según el tiempo transcurrido y la tarifa del parqueadero.

## 6. Criterios de verificación (QA)

Después de enviar los mensajes, verifica lo siguiente:

- El estado del espacio se actualiza correctamente.
- Los cupos disponibles disminuyen cuando un espacio pasa de `LIBRE` a `OCUPADO`.
- Los cupos disponibles aumentan cuando un espacio pasa de `OCUPADO` a `LIBRE`.
- Una reserva asociada al espacio pasa a `CUMPLIDA` cuando el vehículo ocupa el espacio reservado.
- Las lecturas repetidas no generan cambios adicionales en la capacidad.
- Los eventos de entrada y salida quedan registrados en DynamoDB bajo la partición `PARQ#<parqueaderoId>` y una clave de ordenamiento que comienza con `EVENTO#`.

Los eventos tienen un periodo de retención de 30 días mediante el atributo TTL `expiraEn`.
