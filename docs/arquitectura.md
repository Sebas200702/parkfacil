# Arquitectura del Sistema — ParkFácil

ParkFácil implementa una arquitectura **100 % serverless multi-tenant** desplegada en **AWS (región `us-east-1`)** y protegida perimetralmente mediante **Cloudflare** para gestión de dominio personalizado (`https://parkfacil.app`), DNS y cifrado TLS/HTTPS.

## 1. Diagrama de Arquitectura

```mermaid
flowchart TB
    subgraph Usuarios["Usuarios y Dispositivos Externos"]
        C["Conductores\n(App Web Responsiva)"]
        A["Admin Parqueadero\n(Panel de Gestión)"]
        S["Sensores / Barreras\n(Estado Libre / Ocupado)"]
    end

    subgraph Borde["Distribución, DNS y Seguridad"]
        CF["Cloudflare\n(Dominio parkfacil.app, DNS y HTTPS)"]
        S3["Amazon S3\n(Static Website Hosting - Next.js Export)"]
        COG["Amazon Cognito\n(Login, Grupos y custom:parqueaderoId)"]
        IOT["AWS IoT Core\n(Broker MQTT: parkfacil/+/espacios/+)"]
    end

    subgraph Compute["API y Lógica Serverless"]
        APIGW["Amazon API Gateway\n(HTTP API + Autorizador JWT)"]
        LMB["AWS Lambda (13 funciones TypeScript)\n(Disponibilidad, Tarifas, Reservas y Sensores)"]
    end

    subgraph Data["Persistencia, Notificaciones y Eventos"]
        DDB["Amazon DynamoDB\n(Tabla única multi-tenant On-Demand)"]
        SES["Amazon SES\n(Correos de confirmación)"]
        EBS["EventBridge Scheduler\n(Vencimiento automático a 15 min)"]
    end

    CW["Amazon CloudWatch (Logs, métricas y alarmas de todos los servicios)"]

    C --> CF
    A --> CF
    CF --> S3
    C --> COG
    A --> COG
    S --> IOT

    S3 --> APIGW
    COG --> APIGW
    APIGW --> LMB
    IOT --> LMB

    LMB --> DDB
    LMB --> SES
    LMB --> EBS
    EBS --> LMB

    Compute -.-> CW
    Data -.-> CW
