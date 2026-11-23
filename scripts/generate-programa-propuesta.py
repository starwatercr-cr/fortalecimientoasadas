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

W, H, TOTAL = 960, 540, 9
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
    txt(c, 875, 31, f"{n:02d} / {TOTAL:02d}", 10, TEAL if dark else MUTED)


def heading(c, eyebrow, title):
    txt(c, 58, 467, eyebrow.upper(), 13, HexColor("#087A83"), True)
    txt(c, 58, 409, title, 36, INK, True)


def rule(c, y, x1=58, x2=902):
    c.setStrokeColor(HexColor("#CADFE2"))
    c.setLineWidth(1)
    c.line(x1, y, x2, y)


c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1)
c.setTitle("Gestión ordenada para ASADAS | Star Water")
c.setAuthor("Star Water")

# Cover
base(c, 1, True)
photo = ImageReader(str(ROOT / "public/assets/agua-starwater.jpg"))
c.drawImage(photo, 390, 0, width=570, height=540, preserveAspectRatio=False)
c.setFillColor(NAVY)
c.rect(0, 0, 470, 531, fill=1, stroke=0)
c.saveState()
c.setFillAlpha(0.73)
c.setFillColor(NAVY)
c.rect(420, 0, 540, 531, fill=1, stroke=0)
c.restoreState()
c.drawImage(str(ROOT / "public/assets/logo.png"), 58, 426, width=226, height=64, mask="auto")
txt(c, 58, 330, "Una ASADA que", 42, WHITE, True)
txt(c, 58, 269, "funciona con orden", 42, WHITE, True)
lines(c, 59, 155, ["Cómo organizar la administración, el control", "del acueducto y las decisiones de la Junta."], 17, 29, WHITE)
c.showPage()

# Roles and responsibilities
base(c, 2)
heading(c, "Organización", "Cómo debe funcionar una ASADA")
for y, label, detail in [
    (345, "Junta Directiva", "Define prioridades, aprueba acuerdos y supervisa resultados."),
    (265, "Administración", "Ejecuta acuerdos, ordena expedientes y coordina al equipo."),
    (185, "Operación y apoyo contable", "Registran datos técnicos y financieros para decidir con evidencia."),
]:
    txt(c, 58, y, label, 21, INK, True)
    txt(c, 58, y - 30, detail, 16, MUTED)
    rule(c, y - 53)
txt(c, 58, 83, "Cada decisión debe tener responsable, fecha y seguimiento.", 17, HexColor("#087A83"), True)
c.showPage()

# Six management areas
base(c, 3)
heading(c, "Mapa de gestión", "Seis frentes bajo control")
areas = [
    (58, 340, "Presupuesto", "Ingresos, gastos, inversiones y ejecución."),
    (58, 239, "Operación", "Bitácoras, mantenimiento, activos y averías."),
    (58, 138, "Informes", "Resultados y pendientes para Junta y Asamblea."),
    (493, 340, "Calidad del agua", "Análisis, cloro residual y acciones de mejora."),
    (493, 239, "Fuentes y caudales", "Aforos, producción y balance de la demanda."),
    (493, 138, "Información regulatoria", "Datos y evidencias para AyA y ARESEP."),
]
for x, y, label, detail in areas:
    txt(c, x, y, label, 19, HexColor("#087A83"), True)
    txt(c, x, y - 31, detail, 13.5, INK)
c.showPage()

# Budget, accounting and reports
base(c, 4)
heading(c, "Administración y finanzas", "Del presupuesto al informe")
for y, label, detail in [
    (346, "Planificar", "Preparar presupuesto, inversiones y metas de trabajo."),
    (266, "Controlar", "Comparar lo presupuestado con ingresos y gastos reales."),
    (186, "Rendir cuentas", "Revisar estados financieros con el contador e informar a la Junta."),
]:
    txt(c, 58, y, label, 21, INK, True)
    txt(c, 58, y - 30, detail, 16, MUTED)
    rule(c, y - 53)
txt(c, 58, 83, "Así los acuerdos se basan en información actualizada.", 17, HexColor("#087A83"), True)
c.showPage()

# Water, operations and quality
base(c, 5)
heading(c, "Operación y calidad", "Datos que protegen el servicio")
for y, label, detail in [
    (347, "Controles operativos", "Registrar cloración, producción, incidentes y mantenimiento."),
    (269, "Análisis de agua y aforos", "Conservar resultados, medir fuentes y revisar tendencias."),
    (191, "Sello Regulatorio de Calidad", "Preparar evidencias según los lineamientos de ARESEP."),
]:
    txt(c, 58, y, label, 20, INK, True)
    txt(c, 58, y - 29, detail, 16, MUTED)
    rule(c, y - 51)
txt(c, 58, 82, "La frecuencia y los requisitos se revisan según el sistema y la norma vigente.", 12, MUTED)
txt(c, 58, 61, "Fuentes: Reglamento de ASADAS (42582-S-MINAE) y ARESEP, Sello Regulatorio 2026.", 10, MUTED)
c.linkURL("https://aresep.go.cr/agua-potable-informacion-regulatoria/sello-de-calidad-del-agua/", (58, 54, 902, 73), relative=0)
c.showPage()

# How Starlen supports the ASADA
base(c, 6)
heading(c, "Mi acompañamiento", "Cómo les puedo ayudar")
for y, label, detail in [
    (347, "Diagnóstico de la situación", "Reviso documentos, pendientes y datos disponibles de la ASADA."),
    (269, "Plan de trabajo", "Ordeno prioridades con responsables, plazos y entregables."),
    (191, "Seguimiento práctico", "Coordino con operación y contador; preparo información para Junta."),
]:
    txt(c, 58, y, label, 20, INK, True)
    txt(c, 58, y - 29, detail, 16, MUTED)
    rule(c, y - 51)
txt(c, 58, 83, "La Junta conserva sus decisiones y conoce el avance de cada tema.", 16, HexColor("#087A83"), True)
c.showPage()

# Resource mobilization
base(c, 7)
heading(c, "Proyectos", "Gestión de recursos")
txt(c, 58, 347, "Primero, un proyecto bien sustentado", 22, INK, True)
lines(c, 58, 306, [
    "Definimos la necesidad y su prioridad para el acueducto.",
    "Preparamos presupuesto, cronograma y respaldo técnico disponible.",
    "Organizamos el expediente para presentarlo ante organizaciones.",
], 17, 37)
rule(c, 171)
lines(c, 58, 135, [
    "Acompaño la gestión ante AyA, municipalidades u otras entidades",
    "según los requisitos y las oportunidades de cada proyecto.",
], 16, 28, MUTED)
c.showPage()

# Working system
base(c, 8)
heading(c, "Método de administración", "Una forma de gestionar")
txt(c, 58, 341, "Acuerdo   /   Responsable   /   Fecha   /   Evidencia   /   Resultado", 19, HexColor("#087A83"), True)
rule(c, 309)
for y, label, detail in [
    (273, "Registro compartido", "Acuerdos, expedientes y datos en un solo lugar de consulta."),
    (195, "Rutina de seguimiento", "Revisar pendientes y coordinar el trabajo con el equipo."),
    (117, "Informe para la Junta", "Mostrar avances, alertas y decisiones que requieren acuerdo."),
]:
    txt(c, 58, y, label, 20, INK, True)
    txt(c, 58, y - 29, detail, 16, MUTED)
    if y > 117:
        rule(c, y - 51)
c.showPage()

# Modalities and CTA
base(c, 9, True)
txt(c, 58, 465, "DOS MODALIDADES DE APOYO", 14, TEAL, True)
txt(c, 58, 405, "Avancemos con su ASADA", 36, WHITE, True)
txt(c, 58, 319, "Asesoría", 25, TEAL, True)
txt(c, 496, 319, "Administración", 25, TEAL, True)
lines(c, 58, 274, ["Una visita al mes", "Orientación y seguimiento", "de las prioridades"], 18, 34, WHITE)
lines(c, 496, 274, ["Una visita semanal", "Gestión de tareas acordadas", "e informes para la Junta"], 18, 34, WHITE)
c.setStrokeColor(HexColor("#42707B"))
c.line(58, 137, 902, 137)
txt(c, 58, 97, "Starlen Hidalgo Castro  ·  Star Water", 18, WHITE, True)
txt(c, 58, 66, "info@starwater.cr     WhatsApp: 7300-6172", 15, TEAL)
c.showPage()
c.save()
print(OUTPUT)
