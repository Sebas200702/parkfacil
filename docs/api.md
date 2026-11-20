# API de ParkFácil

Todas las respuestas tienen la forma `{ "data": ..., "status": <código>, "error": null | { "code", "message", "details"? } }`.

| Método | Ruta | Acceso | Respuesta |
|---|---|---|---|
| GET | `/parqueaderos` | Público | Parqueaderos con `cupos`, `capacidad` y `tarifas` |
| GET | `/parqueaderos/{id}` | Público | Un parqueadero; 404 si no existe |
| POST | `/reservas` | Conductor | Body `{ "parqueaderoId", "tipo": "CARRO" \| "MOTO" }`. 201 con la reserva (vence en 15 min). 409 `NO_CAPACITY` "Sin cupos"; 409 `ACTIVE_RESERVATION` si ya tiene una activa |
| DELETE | `/reservas/{id}` | Conductor (dueño) | Reserva `CANCELADA`; 404 si no es suya; 409 `RESERVATION_NOT_ACTIVE` |
| GET | `/reservas/mias` | Conductor | Sus reservas, de la más reciente a la más antigua |
| GET | `/admin/espacios` | Admin | Espacios de su parqueadero (`LIBRE`, `OCUPADO`, `RESERVADO`) |
| PUT | `/admin/tarifas` | Admin | Body `{ "tipo", "valorHora", "valorFraccion", "valorDia" }` (enteros en pesos). Devuelve el parqueadero |
| GET | `/admin/metricas` | Admin | Ocupación actual, `entradasPorHora` (hora Colombia), `horaPico`, `ingresosEstimados` y `salidas` de las últimas 24 h |
| POST | `/sensores/eventos` | Header `x-api-key` | Body `{ "parqueaderoId", "espacioId", "estado": "LIBRE" \| "OCUPADO", "ts"? }`. Alternativa a IoT Core |

El parqueadero de un admin sale del atributo `custom:parqueaderoId` del token, nunca del cuerpo.

## Sensores por IoT Core

Tópico `parkfacil/{parqueaderoId}/espacios/{espacioId}`, mensaje `{"estado":"OCUPADO","ts":1764000000}`
(`ts` en segundos epoch, opcional).

## Cobro

Horas completas × `valorHora` + fracciones de 15 min × `valorFraccion`, con tope de `valorDia` por cada
24 h. Toda estadía cobra al menos una fracción. El cobro se registra cuando el sensor pasa de `OCUPADO` a `LIBRE`.

## Modelo de datos (DynamoDB, tabla única)

| PK | SK | Contenido |
|---|---|---|
| `PARQ#<id>` | `META` | Parqueadero: `capacidad`, `cupos` y `tarifas` por tipo. GSI1 `PARQUEADEROS` |
| `PARQ#<id>` | `ESPACIO#<id>` | `tipo`, `estado`, `reservaId`, `actualizadoEn` |
| `PARQ#<id>` | `RESERVA#<id>` | Reserva. GSI1 `USER#<sub>` (por conductor); GSI2 `RESERVA#ACTIVA` por `venceEn` solo mientras está activa |
| `PARQ#<id>` | `EVENTO#<iso>#<espacio>` | `ENTRADA` / `SALIDA` con `monto`; TTL de 30 días (`expiraEn`) |

`cupos` = espacios `LIBRE`. Reservar pasa un espacio a `RESERVADO` y descuenta el cupo en la misma
transacción; cuando el carro llega (`RESERVADO → OCUPADO`) no se descuenta otra vez.
