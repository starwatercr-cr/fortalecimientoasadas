from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/presentacion-negativa-disponibilidad-agua-star-water.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
W,H=960,540
navy=HexColor('#0b3440'); deep=HexColor('#082c38'); teal=HexColor('#20b9b3'); mint=HexColor('#76dfd5'); ink=HexColor('#123744'); muted=HexColor('#516a72'); pale=HexColor('#edf6f7'); white=HexColor('#ffffff')
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('Negativas de disponibilidad de agua | Star Water')
c.setAuthor('Star Water')
c.setSubject('Ruta de revisión y gestión administrativa de una negativa de disponibilidad de agua')

def txt(x,y,s,size=20,color=ink,bold=False):
 c.setFont('DejaVu-Bold' if bold else 'DejaVu',size);c.setFillColor(color);c.drawString(x,y,s)
def wrap(s,maxw,size=18,bold=False):
 font='DejaVu-Bold' if bold else 'DejaVu';lines=[]
 for para in s.split('\n'):
  cur=''
  for word in para.split():
   next=(cur+' '+word).strip()
   if pdfmetrics.stringWidth(next,font,size)>maxw and cur:lines.append(cur);cur=word
   else:cur=next
  lines.append(cur)
 return lines

def para(x,y,s,maxw,size=18,leading=29,color=ink,bold=False):
 for line in wrap(s,maxw,size,bold):
  txt(x,y,line,size,color,bold);y-=leading
 return y

def base(n,topic):
 c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(navy);c.rect(0,H-12,W,12,fill=1,stroke=0)
 txt(56,H-52,'STAR WATER',13,navy,True)
 txt(56,30,'GESTIÓN DE DISPONIBILIDAD DE AGUA',9,muted,True)
 txt(W-91,30,f'{n:02d} / 06',9,muted,True)
 txt(56,H-108,topic,32,ink,True)
 c.setStrokeColor(teal);c.setLineWidth(3);c.line(56,H-124,150,H-124)

def tag(x,y,num,title,body,width=255):
 txt(x,y,num,14,teal,True)
 txt(x,y-40,title,20,ink,True)
 para(x,y-77,body,width,16,25,muted)

def finish():c.showPage()

# Cover
c.setFillColor(deep);c.rect(0,0,W,H,fill=1,stroke=0)
img=Image.open(ROOT/'public/assets/agua-starwater.jpg')
# crop to right panel, preserving aspect
ratio=440/540; iw,ih=img.size;cw=int(ih*ratio);left=(iw-cw)//2
img=img.crop((left,0,left+cw,ih))
cover=ROOT/'tmp/negativas-cover-crop.jpg'
cover.parent.mkdir(parents=True,exist_ok=True)
img.resize((660,810)).save(cover,quality=82,optimize=True)
c.drawImage(str(cover),520,0,width=440,height=540)
c.setFillColor(Color(0.02,0.18,0.23,alpha=.22));c.rect(520,0,440,540,fill=1,stroke=0)
c.setFillAlpha(1)
c.drawImage(str(ROOT/'public/assets/logo.png'),58,435,width=225,height=64,mask='auto')
txt(58,342,'NEGATIVAS DE',33,white,True)
txt(58,294,'DISPONIBILIDAD',33,white,True)
txt(58,246,'DE AGUA',33,white,True)
para(58,177,'Ruta de revisión y gestión administrativa para su caso.',410,19,29,mint)
txt(58,52,'Presentación informativa  |  Costa Rica',11,white)
finish()

base(2,'Primero: comprender la negativa')
para(56,365,'Una respuesta negativa debe revisarse por escrito. Su fundamento define qué información falta y qué gestión corresponde.',830,21,34,ink)
tag(58,267,'01','Operador','Identificamos si respondió una ASADA, AyA o una municipalidad.',240)
tag(353,267,'02','Expediente','Reunimos solicitud, plano, respuesta, fecha de notificación y antecedentes.',240)
tag(648,267,'03','Motivo técnico','Precisamos si el problema es fuente, demanda, red, presión o una condición legal.',250)
finish()

base(3,'Vía administrativa según operador')
# Thin column separators
c.setStrokeColor(HexColor('#cce2e5'));c.setLineWidth(1);c.line(342,112,342,385);c.line(650,112,650,385)
tag(58,366,'ASADA','Junta Directiva','Presentamos la petición o revisión ante la ASADA. Si existe un acto impugnable, valoramos revocatoria ante su Junta Directiva. La apelación técnica u operativa puede corresponder a AyA.',245)
tag(367,366,'AyA','Unidad competente','Solicitamos el expediente y el criterio que sustenta la negativa. Valoramos los recursos administrativos ante los órganos que correspondan.',245)
tag(675,366,'MUNICIPALIDAD','Órgano municipal','Pedimos la motivación y aplicamos la ruta de recursos municipales según la autoridad que emitió la decisión.',230)
para(58,93,'Revisamos recursos y plazos desde la notificación para agotar la vía que corresponda.',835,14,20,navy,True)
txt(58,62,'Fuentes: Reglamento de ASADAS, arts. 100-103 (AyA); LGAP y Código Municipal (PGR).',10,muted)
finish()

base(4,'Evidencia para revisar la capacidad')
para(56,366,'Los documentos se solicitan o elaboran según la causa de la negativa. Pedimos información verificable y contrastamos oferta con demanda.',835,21,33,ink)
for y,num,title,body in [
 (268,'01','Aforos','Caudales medidos en las fuentes y su variación en época seca o lluviosa.'),
 (198,'02','Balance hídrico','Oferta disponible frente a consumo actual y demanda proyectada.'),
 (128,'03','Estudio técnico','Capacidad hidráulica de la red, presión, almacenamiento y alternativas de mejora.')]:
 txt(58,y,num,16,teal,True);txt(112,y,title,20,ink,True);para(358,y,body,530,16,24,muted)
finish()

base(5,'Plazo orientativo y resultado')
txt(56,368,'Hasta 6 meses',37,navy,True)
para(56,326,'Estimación de trabajo para un caso que requiere obtener información, revisar el criterio técnico y dar seguimiento. El tiempo real depende del operador, la documentación y las respuestas.',825,19,30,ink)
c.setStrokeColor(teal);c.setLineWidth(5);c.line(72,176,880,176)
for x,label,sub in [(72,'Inicio','Expediente'),(339,'Meses 1–2','Información técnica'),(608,'Meses 3–4','Gestiones y recursos'),(880,'Meses 5–6','Seguimiento')]:
 c.setFillColor(teal);c.circle(x,176,8,fill=1,stroke=0)
 width=180
 if x==880:x=770
 txt(x,132,label,17,navy,True);para(x,105,sub,width,13,19,muted)
para(56,56,'El trámite puede concluir con disponibilidad, una condición para otorgarla o la negativa motivada. No se garantiza un resultado favorable.',840,11,16,muted)
finish()

# Last slide
c.setFillColor(deep);c.rect(0,0,W,H,fill=1,stroke=0)
c.drawImage(str(ROOT/'public/assets/logo.png'),56,435,width=225,height=64,mask='auto')
txt(56,365,'Inversión del servicio',31,white,True)
txt(56,274,'₡32.100',57,mint,True)
txt(56,218,'50 % al iniciar',21,white,True)
txt(360,218,'50 % al finalizar el proceso',18,white,True)
txt(56,180,'₡16.050',19,mint,True)
txt(360,180,'₡16.050',19,mint,True)
c.setStrokeColor(HexColor('#386a74'));c.setLineWidth(1);c.line(56,143,904,143)
txt(56,104,'SINPE Móvil 7300-6172',23,white,True)
txt(56,70,'A nombre de Star Water',16,mint)
para(617,105,'Incluye revisión del caso y gestión administrativa. Aforos, estudios técnicos, obras o tasas se presupuestan por separado si el caso los requiere.',285,12,19,white)
finish();c.save();print(OUT,OUT.stat().st_size)
