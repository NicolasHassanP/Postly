# -*- coding: utf-8 -*-
"""
Extiende el conjunto del canal de imagen con casos difíciles — N3-10 del dictamen de
tercera instancia, y N3-02 en lo que toca a la procedencia.

El conjunto de veinte casos que produce `armar_casos_imagen.py` lo resolvió el modelo
sin un solo error (F1 = 1,00). Un conjunto que nadie falla no mide: mide el techo del
instrumento, no el del sistema. La tercera auditoría pidió por eso casos genuinamente
difíciles, y nombró cuatro formas: la cifra ocluida, el bajo contraste sobre fondo
texturado, el número aislado sin contexto y el símbolo monetario decorativo.

Se agregan nueve casos. Cinco son infractores que esconden el precio de maneras que la
lectura superficial pierde —ocluido por una calcomanía, en gris claro sobre textura, en
cuerpo diminuto sobre el borde, escrito en palabras sin un solo dígito, y con código de
moneda en vez de símbolo—. Tres son limpios que imitan la *forma* de una infracción sin
serlo: la etiqueta de góndola que no lleva monto, el número aislado sin unidad y la cinta
inferior —el formato típico del descuento— ocupada por un año. Esos tres existen para
provocar falsos positivos, que es lo que el conjunto anterior no podía producir.

El noveno caso es de otra naturaleza y es el más valioso: **R01 no está compuesto**. Es
una pieza auténtica, con «10% de descuento» y «PVP OFERTA SUGERIDO $52.470» impresos en
los píxeles, que circula por el canal de la marca hacia las consultoras. Hasta ahora la
clase positiva del conjunto era íntegramente sintética y el Anexo E lo declaraba como
límite; con R01 deja de serlo.

**Procedencia de las fotografías de base** (N3-02): las nueve piezas se componen sobre
material gráfico oficial de la marca —placas de campaña y bodegones de catálogo— que la
consultora recibe por el canal interno, no sobre fotografías tomadas por ella. Se declara
así, en estos mismos términos, en el Anexo E.6 y en `evidencia/LEEME.md`.

Esta segunda recolección la aportó una cuarta Consultora de Belleza Independiente, ajena al
estudio de campo y madre de uno de los dos autores, para no depender de los plazos de
respuesta de las tres participantes. La misma informante precisó que parte del material de
marca son originales que las propias consultoras editan —texto, color, descripciones— para
volverlos publicitarios, y parte son fotografías que ellas mismas toman de los productos en
físico; el conjunto reproduce la primera práctica y no incluye la segunda.

El script es aditivo a propósito: no regenera los casos V01–V20 ni toca sus veredictos,
porque cada uno costó una petición contra la cuota diaria del nivel gratuito. Anexa las
filas nuevas al manifiesto y al archivo de resultados parcial, de modo que
`run_compliance_vision.mjs` las tome en la próxima corrida y saltee las ya puntuadas.

Uso: python armar_casos_imagen_dificiles.py
"""
import csv
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).parent
NUEVAS = RAIZ / 'fotos jere'
DESTINO = RAIZ / 'evidencia' / 'casos_imagen'
DESTINO_C2 = RAIZ / 'evidencia' / 'casos_imagen_corrida2'
LADO = 1080

NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'

ROSA = (214, 51, 132)
ROSA_CLARO = (247, 205, 225)
BLANCO = (255, 255, 255)
NEGRO = (25, 25, 25)


def fuente(ruta, tam):
    return ImageFont.truetype(ruta, tam)


def base(nombre):
    """Recorte cuadrado centrado a 1080, igual que en el conjunto original."""
    im = Image.open(NUEVAS / nombre).convert('RGB')
    lado = min(im.size)
    izq, arr = (im.width - lado) // 2, (im.height - lado) // 2
    return im.crop((izq, arr, izq + lado, arr + lado)).resize((LADO, LADO), Image.LANCZOS)


def centrado(d, caja, texto, ft, color):
    x0, y0, x1, y1 = caja
    b = d.textbbox((0, 0), texto, font=ft)
    d.text((x0 + (x1 - x0 - (b[2] - b[0])) / 2 - b[0],
            y0 + (y1 - y0 - (b[3] - b[1])) / 2 - b[1]), texto, font=ft, fill=color)


# ───────────────────────────────────────── formas difíciles de incrustación
def ocluido_por_calcomania(im, texto):
    """Precio tapado en parte por un sticker decorativo.

    Las placas reales de la marca llevan calcomanías —estrellas, corazones, bolsas— y es
    frecuente que una quede encima de la cifra. El modelo tiene que reconstruir el monto
    con un dígito escondido.
    """
    d = ImageDraw.Draw(im)
    ft = fuente(NEGRITA, 96)
    b = d.textbbox((0, 0), texto, font=ft)
    an, al = b[2] - b[0], b[3] - b[1]
    x, y = (LADO - an) / 2 - b[0], 470
    d.text((x, y - b[1]), texto, font=ft, fill=NEGRO)
    # corazón de dos círculos y un triángulo, encima del dígito del medio
    cx, cy, r = x + an * 0.52, y + al * 0.45, 62
    d.ellipse([cx - r, cy - r * 1.05, cx, cy + r * 0.15], fill=ROSA)
    d.ellipse([cx, cy - r * 1.05, cx + r, cy + r * 0.15], fill=ROSA)
    d.polygon([(cx - r * 0.98, cy - r * 0.05), (cx + r * 0.98, cy - r * 0.05),
               (cx, cy + r * 1.15)], fill=ROSA)
    return im


def bajo_contraste(im, texto):
    """Precio en gris muy claro sobre un fondo texturado, casi fundido con la foto."""
    capa = Image.new('RGBA', (LADO, LADO), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    ft = fuente(NEGRITA, 104)
    b = d.textbbox((0, 0), texto, font=ft)
    d.text(((LADO - (b[2] - b[0])) / 2 - b[0], 640 - b[1]), texto, font=ft,
           fill=(236, 236, 236, 132))
    im.paste(Image.alpha_composite(im.convert('RGBA'), capa).convert('RGB'), (0, 0))
    return im


def diminuto_al_borde(im, texto):
    """Precio en cuerpo 22 sobre 1080 de alto: ~2 % de la altura, pegado al margen."""
    d = ImageDraw.Draw(im)
    ft = fuente(REGULAR, 22)
    b = d.textbbox((0, 0), texto, font=ft)
    d.text((LADO - (b[2] - b[0]) - 26, LADO - (b[3] - b[1]) - 24), texto, font=ft,
           fill=(60, 60, 60))
    return im


def monto_en_palabras(im, texto):
    """El monto escrito con letras: no hay un solo dígito que capturar."""
    d = ImageDraw.Draw(im)
    d.rectangle([0, LADO - 150, LADO, LADO], fill=BLANCO)
    centrado(d, (0, LADO - 150, LADO, LADO), texto, fuente(NEGRITA, 58), NEGRO)
    return im


def codigo_de_moneda(im, texto):
    """Importe con código de moneda (ARS) en vez del símbolo, en tipografía decorativa."""
    d = ImageDraw.Draw(im)
    ft = fuente(NEGRITA, 88)
    b = d.textbbox((0, 0), texto, font=ft)
    an, al = b[2] - b[0], b[3] - b[1]
    x, y = (LADO - an) / 2 - b[0], 300
    d.rounded_rectangle([x - 40, y - 28, x + an + 40, y + al + 34], radius=18,
                        fill=ROSA_CLARO)
    d.text((x, y - b[1]), texto, font=ft, fill=ROSA)
    return im


def etiqueta_sin_monto(im, texto):
    """La forma gráfica de una etiqueta de precio, ocupada por el nombre del producto.

    Va al pie, sobre zona limpia: si la etiqueta se superpone al titular de la placa la
    pieza parece un error de composición y deja de medir lo que queremos medir.
    """
    d = ImageDraw.Draw(im)
    ft = fuente(NEGRITA, 38)
    b = d.textbbox((0, 0), texto, font=ft)
    an, al = b[2] - b[0], b[3] - b[1]
    x0, y0 = 55, 935
    x1, y1 = x0 + an + 100, y0 + al + 48
    # cuerpo de la etiqueta más la punta triangular y el ojal, como un colgante de góndola
    d.polygon([(x0, y0), (x1 - 70, y0), (x1, (y0 + y1) / 2), (x1 - 70, y1), (x0, y1)],
              fill=ROSA_CLARO, outline=ROSA, width=5)
    d.ellipse([x1 - 88, (y0 + y1) / 2 - 11, x1 - 66, (y0 + y1) / 2 + 11], fill=BLANCO,
              outline=ROSA, width=3)
    d.text((x0 + 32, y0 + 24 - b[1]), texto, font=ft, fill=ROSA)
    return im


def numero_aislado(im, texto):
    """Una cifra grande, sola, sin unidad ni símbolo que la califique.

    Se apoya sobre la masa oscura de la foto y lleva sombra: en blanco sobre fondo claro
    la cifra desaparece, y un caso que no se ve no mide nada.
    """
    d = ImageDraw.Draw(im)
    ft = fuente(NEGRITA, 210)
    centrado(d, (4, 704, LADO + 4, 904), texto, ft, (40, 10, 18))
    centrado(d, (0, 700, LADO, 900), texto, ft, BLANCO)
    return im


def cinta_con_anio(im, texto):
    """La cinta inferior del descuento (V06, V10), ocupada por un año."""
    d = ImageDraw.Draw(im)
    d.rectangle([0, LADO - 130, LADO, LADO], fill=ROSA)
    centrado(d, (0, LADO - 130, LADO, LADO), texto, fuente(NEGRITA, 74), BLANCO)
    return im


# ───────────────────────────────────────────────────── los nueve casos nuevos
# id, foto base, clase, qué forma prueba, constructor
COMPUESTOS = [
    ('V21', 'WhatsApp Image 2026-09-16 at 3.51.21 PM (3).jpeg', 'INFRACTOR',
     'Cifra parcialmente ocluida por una calcomania decorativa',
     lambda im: ocluido_por_calcomania(im, '$12.900')),
    ('V22', 'WhatsApp Image 2026-09-16 at 3.51.21 PM.jpeg', 'INFRACTOR',
     'Precio de muy bajo contraste sobre fondo texturado',
     lambda im: bajo_contraste(im, '$8.750')),
    ('V23', 'WhatsApp Image 2026-09-16 at 3.51.21 PM (1).jpeg', 'INFRACTOR',
     'Precio en cuerpo diminuto (2% de la altura) sobre el margen',
     lambda im: diminuto_al_borde(im, 'Precio sugerido $6.400')),
    ('V24', 'WhatsApp Image 2026-09-16 at 3.51.20 PM (4).jpeg', 'INFRACTOR',
     'Monto escrito en palabras, sin ningun digito',
     lambda im: monto_en_palabras(im, 'Treinta mil pesos, consultame')),
    ('V25', 'WhatsApp Image 2026-09-16 at 3.51.21 PM (2).jpeg', 'INFRACTOR',
     'Codigo de moneda (ARS) en lugar del simbolo, en tipografia decorativa',
     lambda im: codigo_de_moneda(im, 'ARS 30.000')),

    ('V26', 'WhatsApp Image 2026-09-16 at 3.51.20 PM.jpeg', 'LIMPIO',
     'Etiqueta de gondola sin monto: la forma de un precio, sin precio',
     lambda im: etiqueta_sin_monto(im, 'TimeWise')),
    ('V27', 'WhatsApp Image 2026-09-16 at 3.51.21 PM (1).jpeg', 'LIMPIO',
     'Numero aislado grande, sin unidad ni simbolo de moneda',
     lambda im: numero_aislado(im, '30')),
    ('V28', 'WhatsApp Image 2026-09-16 at 3.51.20 PM (3).jpeg', 'LIMPIO',
     'Cinta inferior (formato del descuento) ocupada por un anio',
     lambda im: cinta_con_anio(im, 'Desde 1963')),
]

# El caso real, que no se compone: se copia tal cual llegó.
REAL = ('R01', 'WhatsApp Image 2026-09-16 at 3.51.22 PM (4).jpeg', 'INFRACTOR',
        'PIEZA REAL no compuesta: 10% de descuento y PVP $52.470 impresos en la pieza')

COLUMNAS = ['ID', 'Canal', 'Clase_real', 'Archivo', 'Forma_de_incrustacion',
            'Resultado_esperado', 'Resultado_obtenido', 'Detalle_modelo', 'Veredicto']


def leer(ruta):
    with ruta.open(encoding='utf-8') as fh:
        return list(csv.reader(fh))


def escribir(ruta, filas):
    with ruta.open('w', encoding='utf-8', newline='') as fh:
        csv.writer(fh, lineterminator='\n').writerows(filas)


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    DESTINO_C2.mkdir(parents=True, exist_ok=True)

    nuevas = []
    for cid, foto, clase, forma, construir in COMPUESTOS:
        im = construir(base(foto))
        im.save(DESTINO / f'{cid}.jpg', quality=92)
        nuevas.append([cid, 'Imagen', clase, f'{cid}.jpg', forma,
                       'Bloquear' if clase == 'INFRACTOR' else 'Publicar', '', '', ''])
        print(f'  {cid}  {clase:<9} {forma}')

    # R01: la pieza auténtica. No se recorta ni se reencuadra —alterarla sería componerla—;
    # sólo se lleva a JPEG con el lado mayor en 1080, que es lo que hace Telegram igual.
    cid, foto, clase, forma = REAL
    im = Image.open(NUEVAS / foto).convert('RGB')
    escala = LADO / max(im.size)
    if escala < 1:
        im = im.resize((round(im.width * escala), round(im.height * escala)), Image.LANCZOS)
    im.save(DESTINO / f'{cid}.jpg', quality=92)
    nuevas.append([cid, 'Imagen', clase, f'{cid}.jpg', forma, 'Bloquear', '', '', ''])
    print(f'  {cid}  {clase:<9} {forma}')

    ids_nuevos = {f[0] for f in nuevas}

    # ── manifiesto y resultados: se anexa, nunca se reescribe lo ya puntuado
    for nombre in ('Casos_Compliance_Imagen.csv', 'Casos_Compliance_Imagen_resultados.csv'):
        ruta = DESTINO / nombre
        if not ruta.exists():
            continue
        filas = leer(ruta)
        filas = [f for f in filas if not (f and f[0] in ids_nuevos)]   # idempotencia
        escribir(ruta, filas + nuevas)
        print(f'  + {len(nuevas)} filas anexadas a {nombre} ({len(filas) - 1} ya estaban)')

    # ── corrida 2: mismos casos difíciles, planilla propia, para medir variabilidad
    # entre corridas sin volver a pagar los veinte casos originales.
    for fila in nuevas:
        shutil.copyfile(DESTINO / fila[3], DESTINO_C2 / fila[3])
    escribir(DESTINO_C2 / 'Casos_Compliance_Imagen.csv', [COLUMNAS] + nuevas)
    obsoleto = DESTINO_C2 / 'Casos_Compliance_Imagen_resultados.csv'
    if obsoleto.exists():
        obsoleto.unlink()
    print(f'\n{len(nuevas)} casos nuevos en {DESTINO}')
    print(f'copia para la segunda corrida en {DESTINO_C2}')


if __name__ == '__main__':
    main()
