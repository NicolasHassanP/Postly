# Configuración del entorno E3 (VPS de producción, desde el 1 de octubre de 2026)

Copia fiel de `/opt/n8n/docker-compose.yml` y `/opt/n8n/Caddyfile` del servidor. **No contiene secretos**: todas las
claves se leen del `.env` del servidor (`${...}`), que no se versiona. Versiones fijadas en ese `.env`:
`N8N_IMAGE_TAG=2.15.1`, `GENERIC_TIMEZONE=America/Argentina/Buenos_Aires`.

Cambios respecto del despliegue del 1 de octubre:

- **6 de octubre de 2026:** `N8N_RUNNERS_HEARTBEAT_INTERVAL=180`. FFmpeg (HU13) corre de forma bloqueante en un nodo de
  código; con un video de 1080 × 1920 en 2 vCPU el recorte tarda más de los 30 s que el task runner de n8n tolera por
  defecto, y la ejecución se abortaba (ejecución 1244). Con el ajuste, la ejecución 1248 se completó (Anexo B.1).
  Los workflows no cambiaron: siguen siendo los de la etiqueta `defensa-v2` (`workflows/SHA256SUMS`).
