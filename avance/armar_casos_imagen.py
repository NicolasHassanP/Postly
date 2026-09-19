# -*- coding: utf-8 -*-
"""
Compone el conjunto controlado del canal de imagen (HU8) — N-04 del dictamen.

El conjunto anterior tenía cuatro casos, los mismos reutilizados en las dos
configuraciones, y sobre esa base el §6.2 apoyaba su recomendación de arquitectura. Aquí
se construyen veinte: diez infractores que cubren las formas reales en que un precio
queda incrustado en los píxeles —placa superior, etiqueta adhesiva, marca de agua
diagonal, precio pequeño en una esquina, precio periférico rotado sobre el borde, cinta
inferior de descuento, lista de tarifas, texto manuscrito, monto sin símbolo de moneda y
combinación de envío gratis con precio— y diez limpios que concentran justamente lo que
puede confundirse con un precio: números técnicos, porcentajes de concentración, años,
volúmenes y separadores de miles.

La base fotográfica es el material gráfico que las tres consultoras aportaron para el
estudio de campo (carpeta «pub consultoras»). Corresponde precisar qué es: en su mayoría
se trata de material oficial de la marca —arte de catálogo y placas de campaña— que la
consultora recibe por el canal interno y reenvía, no de fotografías tomadas por ella.
Las placas promocionales con precio las compusieron los autores, porque ninguna de las
piezas aportadas traía el precio incrustado en los píxeles: sus infracciones reales
estaban todas en el texto. Ambas cosas —la procedencia del material de base y el carácter
compuesto de la clase positiva— se declaran explícitamente en el Anexo E.6.

La extensión con casos difíciles y con la primera pieza real con precio incrustado vive
en `armar_casos_imagen_dificiles.py` (N3-10). Este script NO debe reejecutarse tal cual:
reescribe el manifiesto desde cero y dejaría afuera los casos que aquel agrega.

Uso: python armar_casos_imagen.py
"""
import csv
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).parent
BASES = RAIZ / 'pub consultoras'
DESTINO = RAIZ / 'evidencia' / 'casos_imagen'
LADO = 1080

NEGRITA = 'C:/Windows/Fonts/segoeuib.ttf'
REGULAR = 'C:/Windows/Fonts/segoeui.ttf'
MANO = 'C:/Windows/Fonts/segoesc.ttf'      # Segoe Script, para el caso manuscrito

ROJO = (200, 30, 45)
ROSA = (214, 51, 132)
BLANCO = (255, 255, 255)
NEGRO = (25, 25, 25)


def fuente(ruta, tam):
    return ImageFont.truetype(ruta, tam)


def base(nombre):
    im = Image.open(BASES / nombre).convert('RGB')
    lado = min(im.size)
    izq, arr = (im.width - lado) // 2, (im.height - lado) // 2
    return im.crop((izq, arr, izq + lado, arr + lado)).resize((LADO, LADO), Image.LANCZOS)


def centrado(d, caja, texto, ft, color):
    x0, y0, x1, y1 = caja
    b = d.textbbox((0, 0), texto, font=ft)
    d.text((x0 + (x1 - x0 - (b[2] - b[0])) / 2 - b[0],
            y0 + (y1 - y0 - (b[3] - b[1])) / 2 - b[1]), texto, font=ft, fill=color)


# ───────────────────────────────────────────────── formas de incrustación
def placa_superior(im, texto):
    """Banda promocional a todo el ancho, como las placas de feed."""
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, LADO, 150], fill=ROJO)
    centrado(d, (0, 0, LADO, 150), texto, fuente(NEGRITA, 82), BLANCO)
    return im


def etiqueta_adhesiva(im, texto):
    """Círculo tipo sticker de góndola, arriba a la derecha."""
    d = ImageDraw.Draw(im)
    cx, cy, r = LADO - 200, 200, 135
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLANCO, outline=ROJO, width=10)
    centrado(d, (cx - r, cy - r, cx + r, cy + r), texto, fuente(NEGRITA, 62), ROJO)
    return im


def marca_de_agua(im, texto):
    """Texto grande, rotado y semitransparente, cruzando la imagen."""
    capa = Image.new('RGBA', (LADO, LADO), (0, 0, 0, 0))
    ImageDraw.Draw(capa).text((90, LADO // 2 - 90), texto, font=fuente(NEGRITA, 140),
                              fill=(255, 255, 255, 135))
    capa = capa.rotate(22, resample=Image.BICUBIC, center=(LADO // 2, LADO // 2))
    im.paste(Image.alpha_composite(im.convert('RGBA'), capa).convert('RGB'), (0, 0))
    return im


def esquina_chica(im, texto):
    """Precio pequeño en la esquina inferior derecha, como lo pondría una consultora."""
    d = ImageDraw.Draw(im)
    ft = fuente(NEGRITA, 40)
    b = d.textbbox((0, 0), texto, font=ft)
    an, al = b[2] - b[0] + 34, b[3] - b[1] + 24
    x0, y0 = LADO - an - 30, LADO - al - 30
    d.rectangle([x0, y0, x0 + an, y0 + al], fill=BLANCO)
    centrado(d, (x0, y0, x0 + an, y0 + al), texto, ft, NEGRO)
    return im


def periferico_rotado(im, texto):
    """Precio en el borde izquierdo, girado 90°: el caso más difícil de leer."""
    ft = fuente(NEGRITA, 46)
    tmp = Image.new('RGBA', (560, 70), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text((0, 0), texto, font=ft, fill=(30, 30, 30, 255))
    tmp = tmp.rotate(90, expand=True)
    im.paste(tmp, (12, 240), tmp)
    return im


def cinta_inferior(im, texto):
    """Cinta de descuento al pie, el formato más común en placas de venta directa."""
    d = ImageDraw.Draw(im)
    d.rectangle([0, LADO - 130, LADO, LADO], fill=ROSA)
    centrado(d, (0, LADO - 130, LADO, LADO), texto, fuente(NEGRITA, 74), BLANCO)
    return im


def lista_de_precios(im, lineas):
    """Recuadro con varias tarifas, como una lista de precios fotografiada."""
    d = ImageDraw.Draw(im)
    ft = fuente(REGULAR, 44)
    alto = 40 + 62 * len(lineas)
    d.rectangle([70, 300, LADO - 70, 300 + alto], fill=(255, 255, 255), outline=NEGRO, width=4)
    for i, linea in enumerate(lineas):
        d.text((105, 322 + 62 * i), linea, font=ft, fill=NEGRO)
    return im


def manuscrito(im, texto):
    """Texto sobre la foto con tipografía manuscrita, ligeramente girado."""
    capa = Image.new('RGBA', (LADO, LADO), (0, 0, 0, 0))
    ImageDraw.Draw(capa).text((140, 700), texto, font=fuente(MANO, 96),
                              fill=(20, 20, 20, 255))
    capa = capa.rotate(-7, resample=Image.BICUBIC, center=(LADO // 2, LADO // 2))
    im.paste(capa, (0, 0), capa)
    return im


def texto_libre(im, texto, y, tam=52, color=NEGRO, fondo=None):
    """Sobreimpresión sobria, para los casos limpios con números técnicos."""
    d = ImageDraw.Draw(im)
    ft = fuente(REGULAR, tam)
    b = d.textbbox((0, 0), texto, font=ft)
    an, al = b[2] - b[0], b[3] - b[1]
    x = (LADO - an) / 2 - b[0]
    if fondo:
        d.rectangle([x - 26, y - 16, x + an + 26, y + al + 20], fill=fondo)
    d.text((x, y - b[1]), texto, font=ft, fill=color)
    return im


# ─────────────────────────────────────────────────────────── los 20 casos
CASOS = [
    # id, foto base, clase, qué forma de incrustación prueba, constructor
    ('V01', 'c2pub1/1.jpg', 'INFRACTOR', 'Placa promocional superior a todo el ancho',
     lambda im: placa_superior(im, '¡OFERTA! $1990')),
    ('V02', 'c2pub2/2.jpg', 'INFRACTOR', 'Etiqueta adhesiva circular con el monto',
     lambda im: etiqueta_adhesiva(im, '$2500')),
    ('V03', 'c2pub3/3.jpg', 'INFRACTOR', 'Marca de agua diagonal semitransparente',
     lambda im: marca_de_agua(im, 'PROMO 2x1')),
    ('V04', 'c2pub4/4.jpg', 'INFRACTOR', 'Precio pequeño en la esquina inferior',
     lambda im: esquina_chica(im, '$3.200')),
    ('V05', 'c2pub5/5.jpg', 'INFRACTOR', 'Precio periférico rotado sobre el borde',
     lambda im: periferico_rotado(im, 'Precio: $4.100 - consultame')),
    ('V06', 'c3pub1/1.jpg', 'INFRACTOR', 'Cinta inferior de descuento porcentual',
     lambda im: cinta_inferior(im, '30% OFF')),
    ('V07', 'c3pub2/2.jpg', 'INFRACTOR', 'Lista de tarifas en recuadro',
     lambda im: lista_de_precios(im, ['Limpiador 4 en 1 .... $14.800',
                                      'Hidratante dia ...... $19.800',
                                      'Contorno de ojos .... $23.500'])),
    ('V08', 'c3pub3/3.jpg', 'INFRACTOR', 'Texto manuscrito sobre la foto',
     lambda im: manuscrito(im, '2 x $5000')),
    ('V09', 'c3pub4/4.jpg', 'INFRACTOR', 'Monto sin símbolo de moneda, con la palabra',
     lambda im: placa_superior(im, '4500 pesos')),
    ('V10', 'c3pub5/5.jpg', 'INFRACTOR', 'Envío gratis combinado con el monto',
     lambda im: cinta_inferior(im, 'ENVÍO GRATIS · $1.890')),

    ('V11', 'c1pub3/3.jpg', 'LIMPIO', 'Foto de producto sin ninguna sobreimpresión',
     lambda im: im),
    ('V12', 'c1pub4/4.jpg', 'LIMPIO', 'Factor de protección solar (número técnico)',
     lambda im: texto_libre(im, 'FPS 30', 120, 72, NEGRO, BLANCO)),
    ('V13', 'c1pub5/5.jpg', 'LIMPIO', 'Volumen del envase en mililitros',
     lambda im: texto_libre(im, 'Contenido neto 50 ml', 950, 48, NEGRO, BLANCO)),
    ('V14', 'c2pub1/1.jpg', 'LIMPIO', 'Duración del efecto expresada en horas',
     lambda im: texto_libre(im, '24 h de hidratación', 120, 60, NEGRO, BLANCO)),
    ('V15', 'c2pub2/2.jpg', 'LIMPIO', 'Porcentaje de concentración de un activo',
     lambda im: texto_libre(im, '2% de ácido salicílico', 120, 58, NEGRO, BLANCO)),
    ('V16', 'c2pub3/3.jpg', 'LIMPIO', 'Año como número de cuatro cifras',
     lambda im: texto_libre(im, 'Nuevo tono 2025', 120, 64, NEGRO, BLANCO)),
    ('V17', 'c2pub4/4.jpg', 'LIMPIO', 'Numeración de pasos de una rutina',
     lambda im: texto_libre(im, 'Paso 1 de 3', 120, 64, NEGRO, BLANCO)),
    ('V18', 'c2pub5/5.jpg', 'LIMPIO', 'Separador de miles que no es un precio',
     lambda im: texto_libre(im, '+10.000 consultoras confían', 950, 48, NEGRO, BLANCO)),
    ('V19', 'c3pub1/1.jpg', 'LIMPIO', 'Porcentaje que no es un descuento',
     lambda im: texto_libre(im, 'Vitamina C 10%', 120, 64, NEGRO, BLANCO)),
    ('V20', 'c3pub2/2.jpg', 'LIMPIO', 'Nombre de línea de producto, sin ninguna cifra',
     lambda im: texto_libre(im, 'TimeWise Repair Volu-Firm', 950, 46, NEGRO, BLANCO)),
]


def main():
    random.seed(20260914)
    DESTINO.mkdir(parents=True, exist_ok=True)
    filas = [['ID', 'Canal', 'Clase_real', 'Archivo', 'Forma_de_incrustacion',
              'Resultado_esperado', 'Resultado_obtenido', 'Detalle_modelo', 'Veredicto']]
    for cid, foto, clase, forma, construir in CASOS:
        im = construir(base(foto))
        nombre = f'{cid}.jpg'
        im.save(DESTINO / nombre, quality=92)
        filas.append([cid, 'Imagen', clase, nombre, forma,
                      'Bloquear' if clase == 'INFRACTOR' else 'Publicar', '', '', ''])
        print(f'  {cid}  {clase:<9} {foto:<16} {forma}')

    manifiesto = DESTINO / 'Casos_Compliance_Imagen.csv'
    with manifiesto.open('w', encoding='utf-8', newline='') as fh:
        csv.writer(fh, lineterminator='\n').writerows(filas)
    print(f'\n{len(CASOS)} casos en {DESTINO}')
    print(f'manifiesto: {manifiesto.name}')


if __name__ == '__main__':
    main()
