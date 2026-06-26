---
name: postly-repo-setup
description: "Repo Postly en GitHub (privado), estructura, sanitización de token Meta y skills n8n"
metadata:
  node_type: memory
  type: project
---

Repo `NicolasHassanP/Postly` (GitHub, **privado**), inicializado el 2026-06-25 desde `C:\dev\Tesis`. Se trabaja directo sobre `main` (proyecto solo, sin PRs). No usaban git antes (se pasaban archivos por Google Drive).

**Estructura:** `workflows/` (JSON de n8n), `code-nodes/`, `data/` (exports de Google Sheets), `docs/` (la tesis + `docs/contexto/` con este handoff), `assets/`, `.claude/skills/`.

**Token de Meta:** NO se hardcodea. La publicación usa el **token por-usuaria** guardado en la hoja Usuarios (vía OAuth/HU2). `META_ACCESS_TOKEN` en `.env` queda como utilidad/fallback. El valor real nunca va a git (`.env` gitignored).

**Skills:** se instalaron las skills de `czlonkowski/n8n-skills` en `.claude/skills/` (van versionadas en el repo, así el compañero las tiene al clonar). Incluye `n8n-self-hosting`, la que aplica al próximo paso grande (deploy VPS).

**DB:** la "base de datos" es un Google Sheets `Postly_DB` (id 1b85sqw...), hojas `Hoja 1` (posts, gid=0) y `Usuarios` (credenciales por-usuaria, gid=600115356). No se lee por link directo (auth Google); sí el export local `docs/Postly_DB.xlsx`.

Ver [[postly-critical-path]].
