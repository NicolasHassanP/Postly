# Protocolo de cronometraje — hipótesis del 70% (Anexo E)

**Objetivo.** Medir la reducción del tiempo operativo de posteo del proceso manual (As-Is) frente al proceso con Postly (To-Be), para contrastar la hipótesis del §4.2 y operacionalizar la variable (a) del §3.5.4.

**Hipótesis (§4.2).** El uso de Postly reduce el tiempo operativo neto de posteo en **más de un 70 %** respecto del proceso manual.

## Tarea estándar (idéntica en ambas condiciones)
Crear y publicar **una** publicación de feed de **imagen única** en **Instagram y Facebook**, para un producto Mary Kay dado, cumpliendo las normas de la marca (sin precio en el copy/imagen, con la firma de identidad).

## Las dos condiciones
**Condición Manual (As-Is)** — el participante, sin Postly:
1. Selecciona/ubica la imagen del producto.
2. La edita/adapta al formato de feed (recorte/resolución).
3. Redacta el copy desde cero.
4. Verifica manualmente el cumplimiento (quita cualquier precio, agrega la firma).
5. Publica en Instagram y luego en Facebook (subir + pegar copy + publicar en cada red).

**Condición Postly (To-Be)** — el participante, con el bot:
1. Envía la foto del producto al bot de Telegram.
2. Elige uno de los 3 copys generados (puede editarlo).
3. Toca **Publicar** (el sistema publica en IG y FB automáticamente).

## Regla del cronómetro
- **Inicio:** con la **foto del producto ya en mano** (misma foto para ambas condiciones), en el instante en que el participante está por empezar. En la condición Postly, esto es **antes de tocar "Nueva publicación"**; en la condición Manual, antes de empezar a editar/redactar.
- **Fin:** cuando la publicación está confirmada en **ambas** redes (Instagram y Facebook).
- **La búsqueda/selección de la imagen NO se cronometra** en ninguna condición: ambas parten de la misma foto ya provista, para no inflar artificialmente el proceso manual.
- Registrar el tiempo en formato **mm:ss** (ej. `18:30`).

## Control de sesgos (ver §3.5.5, amenazas a la validez)
- **Efecto aprendizaje / orden:** cada participante hace 5 publicaciones distintas; el **orden** de las condiciones se contrabalancea (ver columna `Orden` de la planilla): en unas se hace Manual→Postly y en otras Postly→Manual, alternando entre publicaciones y participantes.
- **Productos equivalentes:** usar 5 productos de complejidad comparable por participante; no repetir el mismo producto en ambas condiciones de la misma publicación (usar productos distintos o equivalentes para evitar que el participante "memorice" el copy).
- **Estandarización:** mismo dispositivo y conexión por participante, sin interrupciones, misma definición de "publicación terminada".
- **Evaluadores:** preferentemente Consultoras de Belleza Independientes reales; declarar explícitamente el tipo de participante (columna `Tipo`) y toda desviación.

## Registro
Completar `Cronometraje_70pct.csv` (una fila por publicación): `Tipo`, `Producto`, `Manual_mmss`, `Postly_mmss`, `Observaciones`. Luego:

```
node run_cronometraje.mjs
```

El script calcula la reducción por publicación, las medias por participante y global, contrasta el 70 % y corre una prueba t pareada (Manual vs Postly).

## Consentimiento
Informar a cada participante el objetivo académico de la medición y obtener su consentimiento verbal; no se registran datos personales más allá de un identificador (P1, P2, P3).
