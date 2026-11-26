# Integración y Despliegue Continuo (CI/CD) — ParkFácil

El repositorio automatiza la verificación de calidad y el despliegue hacia AWS mediante **GitHub Actions** (`.github/workflows/`), garantizando que ningún cambio llegue a `main` sin superar las pruebas y controles estáticos.

## 1. Pipeline de Integración Continua (`CI`)
- **Disparadores:** Cada apertura o actualización de un `pull_request` hacia `main` y cada `push` en `main`.
- **Etapas ejecutadas:**
  1. **Instalación limpia:** `npm ci` con Node.js 22 (`.nvmrc`).
  2. **Linting y formato:** `npm run lint` mediante **Biome** para verificar estilo y reglas estáticas en frontend y backend.
  3. **Verificación de tipos:** `npm run typecheck` con **TypeScript** en modo estricto.
  4. **Pruebas automatizadas:** `npm test` con **Vitest** para validar la lógica de dominio puro (cálculo de tarifas, concurrencia de cupos y vencimientos).
  5. **Compilación:** `npm run build` para comprobar que el bundle estático de Next.js y las funciones Lambda compilan sin errores.

## 2. Pipeline de Despliegue Continuo (`Deploy`)
- **Disparador:** Automático tras fusionar un Pull Request aprobado en la rama `main`.
- **Flujo de publicación:**
  1. Empaqueta y despliega la infraestructura serverless definida en `infra/template.yaml` mediante **AWS SAM** (`sam build` y `sam deploy`).
  2. Genera la exportación estática del frontend (`apps/web/out/`) y la sincroniza con el bucket de **Amazon S3 (Static Website Hosting)** asociado a `https://parkfacil.app`.

## 3. Reglas de Gobernanza en `main`
- **Protección de rama:** Están bloqueados los `push` directos sobre `main`; todo cambio entra obligatoriamente por rama `feature/*` o `docs/*` mediante Pull Request.
- **Revisión cruzada:** Todo PR exige al menos **1 aprobación de un colaborador distinto al autor** y todos los checks de `CI` en verde antes de habilitar el botón de fusión.
