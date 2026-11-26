# Checklist de pruebas y aseguramiento de calidad — ParkFácil

## 1. Objetivo

Registrar las validaciones realizadas sobre ParkFácil para comprobar el funcionamiento de sus componentes, servicios y flujos principales antes de integrar cambios o entregar una versión.

Este checklist reúne verificaciones automatizadas y pruebas manuales. No reemplaza las pruebas automatizadas ni implica que todos los escenarios manuales tengan cobertura en el código.

## 2. Preparación del entorno

- [ ] Verificar que Node.js cumple la versión indicada en `.nvmrc` y el requisito del proyecto (Node.js versión 22 o superior).
- [ ] Instalar las dependencias con `npm ci`.
- [ ] Verificar que las variables de entorno necesarias estén configuradas según el entorno de prueba.
- [ ] Para las pruebas de integración locales, disponer de DynamoDB Local en `http://localhost:8000`, según la configuración utilizada por el proyecto.

## 3. Validaciones automatizadas

Ejecutar desde la raíz del repositorio.

### 3.1. Calidad y compilación

- [ ] `npm run lint` — comprobar formato y reglas estáticas.
- [ ] `npm run typecheck` — verificar los tipos de TypeScript.
- [ ] `npm run build` — comprobar que los paquetes del proyecto compilan correctamente.

### 3.2. Pruebas unitarias

- [ ] `npm test` — ejecutar las pruebas unitarias de los workspaces.

Las pruebas existentes incluyen validaciones de autenticación, manejo de errores HTTP, reglas de reservas, tarifas, métricas, sensores y transiciones de espacios.

### 3.3. Pruebas de integración

- [ ] Iniciar o disponer de DynamoDB Local en el puerto 8000.
- [ ] Ejecutar `npm run test:int`.
- [ ] Verificar que las pruebas de integración finalicen sin errores.

Las pruebas de integración del backend incluyen servicios de reservas, sensores y tarifas administrativas.

## 4. Pruebas funcionales manuales

Realizar estas verificaciones desde la aplicación y registrar el resultado.

### 4.1. Acceso y autenticación

- [ ] Abrir la página de inicio y comprobar que carga correctamente.
- [ ] Iniciar sesión con credenciales válidas.
- [ ] Comprobar que las credenciales inválidas muestran un mensaje de error.
- [ ] Cerrar sesión y verificar que se pierde el acceso a las rutas protegidas.

### 4.2. Consulta de parqueaderos y espacios

- [ ] Consultar los parqueaderos disponibles.
- [ ] Abrir el detalle de un parqueadero.
- [ ] Verificar que se visualice la información de los espacios y su estado.
- [ ] Comprobar que la información mostrada corresponda a la respuesta del sistema.

### 4.3. Reservas

- [ ] Realizar una reserva cuando existan cupos disponibles.
- [ ] Verificar que la reserva quede registrada.
- [ ] Consultar la reserva desde la sección de mis reservas.
- [ ] Intentar reservar cuando no existan cupos y comprobar que se informe que no hay disponibilidad (respuesta 409, cuando corresponda).
- [ ] Cancelar una reserva y verificar que el estado se actualice correctamente.

### 4.4. Administración

- [ ] Comprobar que un usuario sin permisos administrativos no pueda acceder a las rutas de administración.
- [ ] Ingresar con un usuario autorizado.
- [ ] Verificar la visualización de los espacios en el panel administrativo.
- [ ] Consultar las métricas disponibles.
- [ ] Revisar la información de tarifas.

### 4.5. Sensores

- [ ] Verificar el formato de los datos enviados por el simulador de sensores.
- [ ] Comprobar la recepción y validación de los mensajes.
- [ ] Verificar que los cambios de estado de los espacios se reflejen correctamente.
- [ ] Registrar cualquier error de conexión o procesamiento.

Consultar `docs/guia-sensores.md` para el procedimiento de prueba de sensores.

## 5. Validación de CI

- [ ] Confirmar que el workflow de CI se ejecute en el Pull Request.
- [ ] Verificar que finalicen correctamente los pasos de instalación, lint, validación de CloudFormation/SAM, typecheck, pruebas unitarias, pruebas de integración y build.
- [ ] Revisar y corregir los errores reportados antes de integrar los cambios.

El workflow actual utiliza DynamoDB Local como servicio para ejecutar las pruebas de integración.

## 6. Registro de resultados

**Fecha:** ____________________

**Responsable:** ____________________

**Rama o versión evaluada:** ____________________

**Entorno:** ____________________

| Validación | Resultado | Observaciones |
|---|---|---|
| Lint | Pendiente | |
| Typecheck | Pendiente | |
| Pruebas unitarias | Pendiente | |
| Pruebas de integración | Pendiente | |
| Build | Pendiente | |
| Pruebas funcionales | Pendiente | |
| CI | Pendiente | |

**Resultado general:** ____________________

**Incidencias encontradas:**  
________________________________________________________________

**Observaciones adicionales:**  
________________________________________________________________
EOF