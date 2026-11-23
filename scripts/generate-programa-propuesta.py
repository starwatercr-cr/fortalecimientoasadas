"""Generate the public ASADA service presentation PDF."""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/presentacion-asesoria-administracion-asadas.pdf"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
pdfmetrics.registerFont(TTFont("DejaVu", str(FONT_DIR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONT_DIR / "DejaVuSans-Bold.ttf")))

W, H = 960, 540
NAVY = HexColor("#0B3541")
INK = HexColor("#113342")
TEAL = HexColor("#54D2C9")
PALE = HexColor("#EDF6F7")
MUTED = HexColor("#486879")
WHITE = HexColor("#FFFFFF")


def txt(c, x, y, s, size=20, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("DejaVu-Bold" if bold else "DejaVu", size)
    c.drawString(x, y, s)


def lines(c, x, y, items, size=17, leading=29, color=INK):
    for line in items:
        txt(c, x, y, line, size, color)
        y -= leading
    return y


def base(c, n, dark=False):
    c.setFillColor(NAVY if dark else WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, H - 9, W, 9, fill=1, stroke=0)
    txt(c, 58, 31, "STAR WATER  /  GESTIÓN PARA ASADAS", 10, TEAL if dark else MUTED, True)
    txt(c, 875, 31, f"{n:02d} / 05", 10, TEAL if dark else MUTED)


def heading(c, eyebrow, title):
    txt(c, 58, 467, eyebrow.upper(), 13, HexColor("#087A83"), True)
    txt(c, 58, 409, title, 36, INK, True)


def rule(c, y, x1=58, x2=902):
    c.setStrokeColor(HexColor("#CADFE2"))
    c.setLineWidth(1)
    c.line(x1, y, x2, y)


c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
c.setTitle("Asesoría y administración para ASADAS | Star Water")
c.setAuthor("Star Water")

# Cover
base(c, 1, True)
photo = ImageReader(str(ROOT / "public/assets/agua-starwater.jpg"))
c.drawImage(photo, 390, 0, width=570, height=540, preserveAspectRatio=False)
c.setFillColor(NAVY)
c.rect(0, 0, 470, 531, fill=1, stroke=0)
c.saveState()
c.setFillAlpha(0.82)
c.setFillColor(NAVY)
c.rect(420, 0, 540, 531, fill=1, stroke=0)
c.restoreState()
c.drawImage(str(ROOT / "public/assets/logo.png"), 58, 426, width=226, height=64, mask="auto")
txt(c, 58, 337, "Asesoría y", 42, WHITE, True)
txt(c, 58, 277, "administración", 42, WHITE, True)
txt(c, 58, 217, "para ASADAS", 42, WHITE, True)
lines(c, 59, 156, ["Dos modalidades para ordenar la gestión", "y apoyar las decisiones de la Junta."], 17, 29, WHITE)
c.showPage()

# Advisory
base(c, 2)
heading(c, "Modalidad 01", "Asesoría mensual")
txt(c, 58, 319, "₡150.000", 43, HexColor("#087A83"), True)
txt(c, 304, 323, "por mes", 17, MUTED)
rule(c, 296)
txt(c, 58, 251, "Una visita mensual", 22, INK, True)
lines(c, 58, 210, [
    "Revisamos las prioridades con la Junta y la administración.",
    "Orientamos la planificación, los procesos y las decisiones.",
    "Damos seguimiento a los acuerdos y temas por resolver.",
], 17, 34)
txt(c, 58, 72, "El plan de trabajo se acuerda con cada ASADA.", 15, MUTED)
c.showPage()

# Administration
base(c, 3)
heading(c, "Modalidad 02", "Administración de la ASADA")
txt(c, 58, 321, "₡250.000", 43, HexColor("#087A83"), True)
txt(c, 304, 325, "por mes", 17, MUTED)
rule(c, 298)
txt(c, 58, 251, "Una visita semanal", 22, INK, True)
lines(c, 58, 209, [
    "Asumimos las tareas administrativas acordadas con la Junta.",
    "Ordenamos pendientes, responsables y fechas de entrega.",
    "Preparamos la información para que la Junta pueda decidir.",
], 17, 34)
txt(c, 58, 71, "La Junta define autorizaciones y canales de coordinación.", 15, MUTED)
c.showPage()

# Workstreams
base(c, 4)
heading(c, "Alcance de la administración", "Trabajo que llevamos en orden")
items = [
    ("01", "Presupuesto", "Elaboración y seguimiento de ingresos y gastos."),
    ("02", "Planificación", "Prioridades, cronograma y control de acuerdos."),
    ("03", "Estados financieros", "Control y coordinación de información con el contador."),
    ("04", "Informes a la Junta", "Avances, pendientes y datos para la toma de decisiones."),
    ("05", "Gestión general", "Organización de los procesos administrativos acordados."),
]
y = 354
for index, (number, label, detail) in enumerate(items):
    txt(c, 58, y, number, 14, HexColor("#087A83"), True)
    txt(c, 111, y, label, 19, INK, True)
    txt(c, 111, y - 26, detail, 14, MUTED)
    if index < len(items) - 1:
        rule(c, y - 49)
    y -= 69
c.showPage()

# Comparison and CTA
base(c, 5, True)
txt(c, 58, 464, "DOS FORMAS DE TRABAJAR CON SU ASADA", 14, TEAL, True)
txt(c, 58, 404, "Elija el apoyo que necesita", 35, WHITE, True)
txt(c, 58, 323, "Asesoría", 25, TEAL, True)
txt(c, 496, 323, "Administración", 25, TEAL, True)
lines(c, 58, 277, ["₡150.000 al mes", "Una visita mensual", "Orientación y seguimiento"], 19, 37, WHITE)
lines(c, 496, 277, ["₡250.000 al mes", "Una visita semanal", "Gestión administrativa acordada"], 19, 37, WHITE)
c.setStrokeColor(HexColor("#42707B"))
c.line(58, 135, 902, 135)
txt(c, 58, 97, "Conversemos sobre el alcance de su ASADA", 18, WHITE, True)
txt(c, 58, 66, "info@starwater.cr     WhatsApp: 7300-6172", 15, TEAL)
c.showPage()
c.save()
print(OUTPUT)
