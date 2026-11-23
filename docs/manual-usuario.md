# Manual de Usuario — ParkFácil

**ParkFácil** es una plataforma web para consultar la disponibilidad de parqueaderos en tiempo real, reservar cupos por 15 minutos y administrar espacios y tarifas.

---

## 1. Guía para Conductores

### 1.1 Consultar parqueaderos disponibles (sin iniciar sesión)
1. Ingresa a la aplicación web de ParkFácil.
2. En el mapa principal verás los parqueaderos registrados con sus cupos disponibles (`LIBRE`), capacidad total y tarifas vigentes (por hora, fracción de 15 minutos y tope diario).
3. Haz clic sobre un parqueadero para ver el detalle de cupos por tipo de vehículo (`CARRO` o `MOTO`) y sus tarifas.

### 1.2 Registro e inicio de sesión
1. Haz clic en **Registrarse** e ingresa tu correo electrónico y contraseña.
2. Inicia sesión con tus credenciales para habilitar las opciones de reserva.

### 1.3 Reservar un cupo
1. Selecciona el parqueadero deseado y elige el tipo de vehículo (`CARRO` o `MOTO`).
2. Haz clic en **Reservar cupo**.
3. El sistema apartará un espacio por **15 minutos** y mostrará un temporizador en pantalla.
   * *Nota:* Si el parqueadero se llena al mismo tiempo, verás el aviso **"Sin cupos"**. Si ya tienes una reserva vigente, el sistema mostrará **"Ya tienes una reserva activa"**.
   * Si no llegas antes de los 15 minutos, la reserva vence automáticamente y el cupo vuelve a quedar libre.

### 1.4 Consultar o cancelar mis reservas
1. Entra a la sección **Mis reservas**.
2. Allí podrás ver tu reserva activa y tu historial (ordenado de la más reciente a la más antigua).
3. Para liberar el cupo antes de tiempo, haz clic en **Cancelar reserva**.

---

## 2. Guía para Administradores de Parqueadero

### 2.1 Acceso al panel administrativo
1. Inicia sesión con una cuenta perteneciente al grupo **admin**.
2. Accede a la ruta `/admin` (cada administrador visualiza y gestiona únicamente su parqueadero asignado).

### 2.2 Monitoreo de espacios en vivo
1. En la vista **Espacios en vivo**, consulta el estado actualizado de cada celda mediante colores:
   * **Verde (`LIBRE`):** Espacio disponible.
   * **Amarillo (`RESERVADO`):** Apartado por un conductor (ventana de 15 minutos).
   * **Rojo (`OCUPADO`):** Vehículo detectado por el sensor en el espacio.

### 2.3 Configurar tarifas
1. Dirígete a la sección **Tarifas**.
2. Selecciona el tipo de vehículo (`CARRO` o `MOTO`) e ingresa los valores enteros en pesos para:
   * **Valor por hora** (`valorHora`)
   * **Valor por fracción de 15 min** (`valorFraccion`)
   * **Tope máximo por 24 horas** (`valorDia`)
3. Guarda los cambios para actualizar las tarifas inmediatamente.

### 2.4 Consultar métricas e ingresos
1. Entra a **Métricas** para revisar el porcentaje de ocupación actual, entradas por hora, hora pico, salidas de las últimas 24 horas e ingresos estimados.
