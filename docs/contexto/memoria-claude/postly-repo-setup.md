---
name: postly-repo-setup
description: "Repo Postly en GitHub (privado), estructura, sanitización de token Meta y skills n8n"
metadata: 
  node_type: memory
  type: project
  originSessionId: 75b3d179-6c35-423c-88e9-068d5ba0fea8
---

Repo `NicolasHassanP/Postly` (GitHub, **privado**) inicializado el 2026-06-25 desde `C:\dev\Tesis`. No usaban git antes (se pasaban archivos por Google Drive).

**Estructura:** `workflows/` (JSON de n8n), `code-nodes/`, `data/` (exports de Google Sheets), `docs/` (la tesis), `assets/`, `.claude/skills/`.

**Token de Meta:** estaba hardcodeado (prefijo `EAA`) en los 2 workflows. Se **redactó** → ahora `{{ $env.META_ACCESS_TOKEN }}`. El valor real quedó en `.env` local (gitignored). **Pendiente: rotar ese token** cuando se monte el flujo OAuth nuevo. Ver [[postly-critical-path]].

**Skills:** se instalaron las 15 skills de `czlonkowski/n8n-skills` en `.claude/skills/` (van versionadas en el repo, así el compañero las tiene al clonar). Incluye `n8n-self-hosting`, que es la que aplica al próximo paso (deploy VPS).

**DB:** la "base de datos" es un Google Sheets (hojas `Hoja 1` y `Usuarios`). No se puede leer por link directo (auth Google); sí leo el export local `docs/Postly_DB.xlsx` o un CSV publicado.
