{21:33/VIE/29.12.2K
PASTILLA
  CELESTE=100p
  VERDE=COMPLETA ENERG÷A
  ROJA=CAMBIA CONTROLES
  BLANCO=VELOCIDAD
  VIOLETA=DISPARO EN µNGULO
  AMARILLA=LASER
  ROSA=ESCUDO}
Program Space_Ships_Adventure;
Uses crt,graph;
Type
    vector = array [1..5] of integer;
    vectdisp = array [1..5] of boolean;
    vectordisparos = array [1..4] of boolean;
    vectorPOSDIS = array [1..4] of integer;
{PARA MANEJO DE ARCHIVOS}
    TopFive = Record
       nom:string[8];
       pun:string[5];
       jug:char;
       efi:string[4]
    end;
    DataFile = File of TopFive;
    Top5 = array [1..7] of TopFive;
var
{PARA ARCHIVOS}
r: TopFive;
archivo: DataFile;
V: Top5;
SEGRABO:BOOLEAN;
  {PARA COPIAR LAS IMµGENES A MEMORIA}
  Size,Size2,SizeE: Word;
  P,Q,N,M,L,K: Pointer;   {P=JUG1 Q=JUG2 N=ENE1 M=ENE2 L=E3.1 K=E3.2}
key,auxt,auxt1,t,t1,t2:char;
{energy=energia de la nave final, nx y ny de nave final}
{total y matados (enemigos)}
eficiencia:real;
NPANT,choques,suma,rx,ry,energy,total,matados,NX,NY,Driver,Mode: Integer;
{eficiencia es ((matados-choques)/total)*100}
cantidadNaves,opcion,cantdisp,cantidadbalas,energiaINICIAL,velocidad,dificultad,energia,e,d,vidas,puntos,a,x,y: Integer;
auxY,auxX:vectorPOSDIS;
disparo:vectordisparos;
c,f,cd,fd:vector;
CONTROLA,estado:vectdisp;{CONTROLA ES PARA EL MOV DE ENE DE PANT2}
PUNT,PUNT1,STRAux,veloc,dificul:string;
CALCEFI1,VERCUADRO,UNOJUEGA,SALIR,dos,final:boolean;
PILL,PILLEFECT,PILLX,PILLY:INTEGER;{PASTILLAS}
  ESCUDO,ESCUDO1,LASER,LASER1,DISANG,DISANG1,EFECTO1,EFECTO2,UNOcambia,DOScambia:BOOLEAN;
  ESC,ESC1,ARRIBA1,DERECHA1,IZQUIERDA1,ARRIBA,DERECHA,IZQUIERDA,SPEED1,SPEED2,CUENTAefect1,CUENTAefect2:INTEGER;

{AHORA EL 2DO JUGADOR}
puntos1,matados1,choques1,energia1,vidas1,cantidadbalas1,x1,y1:Integer;
EFICIENCIA1:REAL;
disparo1:vectordisparos;
auxY1,auxX1:vectorPOSDIS;
CALCEFI2,DOSJUEGA:boolean;
label 1;

Function Valor(texto: string): integer;
var numero,num:integer; Begin Val(texto,numero,num); Valor:=numero end;

Function SIGUIENTE(E,CANTIDADNAVES:INTEGER):integer;
begin
if E=1 THEN SIGUIENTE:=CANTIDADNAVES
       ELSE SIGUIENTE:=E-1
end;

Procedure Tipear(t:string;columna,fila,velocidad,color,estilo:integer);
var x:integer;
begin
SetColor(color);
if estilo = 1 then
 for x:=1 to length(t) do begin
 OutTextXY(columna+(x*8), fila, t[x]);
 delay(velocidad) end
 else
 for x:=length(t) downto 1 do begin
 OutTextXY(columna+(x*8), fila, t[x]);
 delay(velocidad) end
end;

Procedure Pastilla(PILLX,PILLY,PILLEFECT:integer);
begin
CASE PILLEFECT OF
 1:PILLEFECT:=11;
 3:PILLEFECT:=12;
 4:PILLEFECT:=15;
 6:PILLEFECT:=14;
 7: PILLEFECT:=13
END;
SetColor(PILLEFECT);Arc(PILLX,PILLY,0,90,5);Arc(PILLX,PILLY,0,90,6);Arc(PILLX,PILLY,180,270,5);Arc(PILLX,PILLY,180,270,6);
SetColor(12);Circle(PILLX,PILLY,3);SetColor(4);Circle(PILLX,PILLY,2);SetColor(14);Circle(PILLX,PILLY,1)
end;

Procedure BORRARPastilla(PILLX,PILLY:integer);
begin
SetFillStyle(1,0);BAR(PILLX-6,PILLY-7,PILLX+6,PILLY+7)
end;

Procedure MOSTRARAyuda(VAR AUXT,KEY:CHAR);
Begin
AUXT:=' ';
SetFillStyle(6,8);SetColor(12);Bar3D(100,100,350,370,4,TopOn);
tipear('Lucas Capalbo Producciones',115,110,10,11,1);tipear('Space Ships Adventure',130,120,10,10,0);
Pastilla(170,150,1);OutTextXY(180,148,'100 Puntos');
Pastilla(170,170,2);OutTextXY(180,168,'Energ°a');
Pastilla(170,190,3);OutTextXY(180,188,'Cambio De Controles');
Pastilla(170,210,4);OutTextXY(180,208,'Velocidad');
Pastilla(170,230,5);OutTextXY(180,228,'Disparo En µngulo');
Pastilla(170,250,6);OutTextXY(180,248,'Laser');
Pastilla(170,270,7);OutTextXY(180,268,'Escudo x 5');
OutTextXY(120,290,'Pastillas: 5 Puntos');
OutTextXY(120,300,'Enemigos: 5 Puntos');
OutTextXY(120,310,'Monstruos: 50 Puntos');
OutTextXY(120,320,'Choque A Enemigo: 1 Punto');
OutTextXY(120,330,'Choque A Monstruo: 10 Puntos');
tipear('Septiembre de 2K, Argentina',110,350,10,12,1);tipear('Precione Escape Para Salir',115,360,10,11,0);
repeat key:=readkey until key=chr(27);
key:=' ';
SetFillStyle(1,0);SetColor(0);Bar3D(100,100,350,370,4,TopOn)
End;

Procedure Escribir(texto:string; x,y:integer);
begin SetColor(9);OutTextXY(x,y,texto); SetColor(4);OutTextXY(x+1,y,texto); SetColor(12);OutTextXY(x-1,y-1,texto); end;

Procedure Flecha(x,y,color:integer);
begin
SetColor(color); SetLineStyle(0,0,3);
Line(x,y,x+10,y);
Line(x,y,x,y+10);
Line(x+10,y,x+10,y-10);
Line(x,y+10,x+10,y+10);
Line(x+10,y+10,x+10,y+20);
Line(x+10,y+20,x+25,y+5);
Line(x+10,y-10,x+25,y+5)
end;

Procedure Nave1(VAR nx,ny:integer);
VAR COD:INTEGER;
begin
CASE NPANT OF
1:BEGIN
  SetColor(10);
  Line(nx-10,ny+10,nx+10,ny+10);
  Line(nx-15,ny,nx-10,ny+10);Line(nx+15,ny,nx+10,ny+10);
  Line(nx-15,ny,nx-18,ny+5);Line(nx+15,ny,nx+18,ny+5);
  Line(nx-18,ny+5,nx-30,ny+8);Line(nx+18,ny+5,nx+30,ny+8);
  Line(nx-30,ny+8,nx-60,ny+40);Line(nx+30,ny+8,nx+60,ny+40);
  Line(nx-53,ny+60,nx-30,ny+50);Line(nx+53,ny+60,nx+30,ny+50);
  Line(nx-30,ny+8,nx-30,ny+50);Line(nx+30,ny+8,nx+30,ny+50);
  Line(nx-30,ny+50,nx-20,ny+50);Line(nx+30,ny+50,nx+20,ny+50);
  SetColor(2);Line(nx-18,ny+5,nx-18,ny+30);Line(nx+18,ny+5,nx+18,ny+30);
  Line(nx-18,ny+30,nx-5,ny+30);Line(nx+18,ny+30,nx+5,ny+30);
  SetColor(14); Line(nx-60,ny+40,nx-53,ny+60);Line(nx+60,ny+40,nx+53,ny+60);
  Line(nx-59,ny+44,nx-59,ny+75);Line(nx+59,ny+44,nx+59,ny+75);
  Line(nx-59,ny+75,nx-53,ny+55);Line(nx+59,ny+75,nx+53,ny+55);
  SetColor(12);Ellipse(nx,ny+45,0,180,5,20);
  Ellipse(nx,ny+55,0,70,10,10);
  Ellipse(nx,ny+55,110,180,10,10);
  Ellipse(nx,ny+50,180,360,25,7);
  Ellipse(nx,ny+58,180,360,7,10);
  Ellipse(nx,ny+90,0,360,4,8);Ellipse(nx,ny+90,180,360,5,9);
  Line(nx-3,ny+67,nx-2,ny+82);Line(nx+3,ny+67,nx+2,ny+82);
  SetFillStyle(1,4);FloodFill(nx,ny+70,12);
  SetFillStyle(1,12);FloodFill(nx,ny+60,12)
  END;
2:BEGIN
  SetColor(11);
  Ellipse(nx,ny+55,160,17,20,32);
  Ellipse(nx,ny+55,150,25,12,24);
  SetColor(5);
  Line(nx-48,ny+18,nx-60,ny+72); Line(nx+48,ny+18,nx+60,ny+72);
  Line(nx-20,ny+40,nx-60,ny+72); Line(nx+20,ny+40,nx+60,ny+72);
  SetColor(12);
  Ellipse(nx,ny+5,0,180,60,35);
  Ellipse(nx,ny+5,0,180,60,30);Ellipse(nx,ny+5,0,180,60,20);Ellipse(nx,ny+5,0,180,60,10);
  Ellipse(nx,ny+5,0,180,50,35);Ellipse(nx,ny+5,0,180,40,35);Ellipse(nx,ny+5,0,180,30,35);
  Ellipse(nx,ny+5,0,180,30,35);Ellipse(nx,ny+5,0,180,20,35);Ellipse(nx,ny+5,0,180,10,35);
  Line(nx-60,ny+5,nx+60,ny+5); Line(nx-60,ny+5,nx-20,ny+44); Line(nx+60,ny+5,nx+20,ny+44); Line(nx-20,ny+44,nx+20,ny+44);
  SetColor(3);circle(nx,ny+60,3);circle(nx,ny+60,2);SetColor(11);circle(nx,ny+60,1)
 END;
3:BEGIN
  IF NX MOD 50>25 THEN
           BEGIN
           IF NX>30 THEN BEGIN DEC(NY,RANDOM(10)); COD:=1 END
           END
           ELSE
           BEGIN
           IF NY<400 THEN BEGIN INC(NY,RANDOM(10)); COD:=2 END
           END;
  SetColor(11);
  Ellipse(nx,ny+67,110,70,50,18); Ellipse(nx,ny+67,110,70,50,19);
  Ellipse(nx,ny+65,110,70,30,20); Ellipse(nx,ny+65,110,70,29,19);
  SetColor(12);Ellipse(nx,ny+40,0,360,10,40); SetColor(10);
  CASE COD OF
  1:BEGIN
    Line(nx-25,ny+55,nx-60,ny+30); Line(nx+25,ny+55,nx+60,ny+30);
    Line(nx-11,ny+40,nx-60,ny+30); Line(nx+11,ny+40,nx+60,ny+30);
    Line(nx-60,ny+30,nx-15,ny+10); Line(nx+60,ny+30,nx+15,ny+10);
    Line(nx-15,ny+10,nx-55,ny+35); Line(nx+15,ny+10,nx+55,ny+35)
    END;
  2:BEGIN
    Line(nx-25,ny+55,nx-60,ny+20); Line(nx+25,ny+55,nx+60,ny+20);
    Line(nx-11,ny+40,nx-60,ny+20); Line(nx+11,ny+40,nx+60,ny+20);
    Line(nx-60,ny+20,nx-15,ny-10); Line(nx+60,ny+20,nx+15,ny-10);
    Line(nx-15,ny-10,nx-55,ny+25); Line(nx+15,ny-10,nx+55,ny+25)
    END
  END
  END
END
end;

Procedure BORRARNave1(nx,ny:integer);
begin
SetColor(0); SetFillStyle(1,0);
CASE NPANT OF
 1: Bar(nx-60,ny,nx+60,ny+100);
 2,3: Bar(nx-60,ny-32,nx+60,ny+100)
END
end;

Procedure MostrarEnergia(energia,energiaINICIAL,JUGADOR:integer);
var e:integer;
begin
SetFillStyle(6,2);
IF JUGADOR=1 THEN
    BEGIN                                           {JUGADOR 1}
    for e:=1 to energia do
     begin
      SetColor(14);
      PieSlice(643-(e*20), 129, 20, 340, 8);
      SetColor(12);
      PieSlice(640-(e*20), 129, 110, 250, 5)
     end;
    SetFillStyle(1,1);
    if energia<>energiaINICIAL then
    for e:= 1 to energiaINICIAL-energia do
        PieSlice(643-(e*20),129,0,360,8)
    END
    ELSE                                            {JUGADOR 2}
    BEGIN
    for e:=1 to energia do
     begin
      SetColor(14);
      PieSlice(643-(e*20), 439, 20, 340, 8);
      SetColor(12);
      PieSlice(640-(e*20), 439, 110, 250, 5)
     end;
    SetFillStyle(1,1);
    if energia<>energiaINICIAL then
    for e:= 1 to energiaINICIAL-energia do
        PieSlice(643-(e*20),439,0,360,8)
    END
end;

Procedure EscribirPuntaje(puntos,JUGADOR:integer);
var puntaje:string;
begin
SetTextStyle(11,0,0);
IF JUGADOR=1 THEN
             BEGIN
              SetColor(1);
              outtextXY(590,40,'€€€€€');
              Str(puntos:5,puntaje);
              SetColor(14);
              outtextXY(590,40,puntaje)
             END
             ELSE
             BEGIN
              SetColor(1);
              outtextXY(590,350,'€€€€€');
              Str(puntos:5,puntaje);
              SetColor(14);
              outtextXY(590,350,puntaje)
             END
end;

Procedure BorrarJugador(x,y:integer; ESCUDO:BOOLEAN);
Begin
if x<400 then begin SetColor(0);SetFillStyle(1,0) end
         else begin SetColor(1);SetFillStyle(1,1) end;
IF ESCUDO THEN Bar(x-11,y-20,x+11,y+10)
          ELSE Bar(x-10,y-20,x+10,y+5);
end;

Procedure DibujarJugador(x,y,jugador:integer);
Begin
if jugador=1 then SetColor(12) else SetColor(11);
Line(x-2,y,x,y-20);Line(x+2,y,x,y-20);
if y mod 2=0 then SetColor(14) else SetColor(12);
Ellipse(x-5,y,180,0,3,5);Ellipse(x+5,y,180,0,3,5);
if y mod 2=0 then SetColor(12) else SetColor(14);
Ellipse(x-5,y,180,0,1,5);Ellipse(x+5,y,180,0,1,5);
if jugador=1 then SetColor(14) else SetColor(13);
Arc(x, y, 0, 180, 8);
Arc(x, y, 0, 180, 6);
if jugador=1 then SetColor(11) else SetColor(12);
Line(x,y-20,x+10,y);Line(x,y-20,x-10,y);Line(x-10,y,x+10,y);
Line(x-10,y-2,x-10,y-9);Line(x-8,y-2,x-10,y-9);
Line(x+10,y-2,x+10,y-9);Line(x+8,y-2,x+10,y-9)
end;

Procedure Disparar(auxX,auxY:integer; LASER:BOOLEAN);
Begin
IF (NOT LASER) THEN
  BEGIN
  line(auxX-5,auxY,auxX-5,auxY-7);line(auxX+5,auxY,auxX+5,auxY-7);
  Arc(auxX-5,auxY,0,180,3);
  Arc(auxX+5,auxY,0,180,3)
  END
  ELSE
  BEGIN
  IF GETCOLOR=0 THEN
        BEGIN
          SetFillStyle(1,0);
          Bar(auxX-8,auxY-7,auxX+8,auxY)
        END
        ELSE
        IF GETCOLOR=15 THEN
         BEGIN
         SETCOLOR(2);
          line(auxX-3,auxY,auxX-3,auxY-7);line(auxX+3,auxY,auxX+3,auxY-7);
          line(auxX-7,auxY,auxX-7,auxY-7);line(auxX+7,auxY,auxX+7,auxY-7);
          line(auxX-4,auxY,auxX-4,auxY-7);line(auxX+4,auxY,auxX+4,auxY-7);
          line(auxX-6,auxY,auxX-6,auxY-7);line(auxX+6,auxY,auxX+6,auxY-7);
         SETCOLOR(10);
         line(auxX-5,auxY,auxX-5,auxY-7);line(auxX+5,auxY,auxX+5,auxY-7)
         END
         ELSE
         IF GETCOLOR=12 THEN
          BEGIN
          SETCOLOR(4);
          line(auxX-3,auxY,auxX-3,auxY-7);line(auxX+3,auxY,auxX+3,auxY-7);
          line(auxX-4,auxY,auxX-4,auxY-7);line(auxX+4,auxY,auxX+4,auxY-7);
          line(auxX-6,auxY,auxX-6,auxY-7);line(auxX+6,auxY,auxX+6,auxY-7);
          line(auxX-7,auxY,auxX-7,auxY-7);line(auxX+7,auxY,auxX+7,auxY-7);
          SETCOLOR(12);
          line(auxX-5,auxY,auxX-5,auxY-7);line(auxX+5,auxY,auxX+5,auxY-7)
          END
  END;
end;

Procedure QuitarVida(var a,energia,vidas,x,y:integer; energiaINICIAL,JUGADOR:integer; DOS:boolean);
var t:char;
begin
IF (DISANG)AND(Jugador=1) THEN
   BEGIN
   SETFILLSTYLE(1,0);
   BAR(DERECHA-2,ARRIBA-2,DERECHA+2,ARRIBA+2);
   BAR(IZQUIERDA-2,ARRIBA-2,IZQUIERDA+2,ARRIBA+2);
   DISANG:=FALSE;ARRIBA:=-10;DERECHA:=-10;IZQUIERDA:=-10
   END;
IF (DISANG1)AND(Jugador=2) THEN
   BEGIN
   SETFILLSTYLE(1,0);
   BAR(DERECHA1-2,ARRIBA1-2,DERECHA1+2,ARRIBA1+2);
   BAR(IZQUIERDA1-2,ARRIBA1-2,IZQUIERDA1+2,ARRIBA1+2);
   DISANG1:=FALSE;ARRIBA1:=-10;DERECHA1:=-10;IZQUIERDA1:=-10
   END;
IF (LASER)AND(JUGADOR=1) THEN LASER:=FALSE;
IF (LASER1)AND(JUGADOR=2) THEN LASER1:=FALSE;
IF JUGADOR=1 THEN
             BorrarJugador(650-(30*(vidas)),90,FALSE)
             ELSE
             BorrarJugador(650-(30*(vidas)),400,FALSE);
Dec(vidas);
BorrarJugador(x,y,TRUE);
If NPANT=2 then Nave1(nx,ny); {SI EN PANT2 CHOCAxARRIBA, QUEDA 1 CUADRADO NEG}
IF VIDAS=0 THEN
            energia:=0
            ELSE
            energia:=energiaINICIAL;
SetColor(12);
MostrarEnergia(energia,energiaINICIAL,JUGADOR);
IF VIDAS<>0 THEN {MIENTRAS NO HAYA PERDIDO, DIBUJA LA NAVE EN LA POS ORIGINAL}
 BEGIN
 y:=443;
 if not DOS then                                 {SI JUEGA UNO SOLO}
           x:=200
           ELSE
           if jugador=1 then
                        x:=300                     {JUGADOR 1 DE 2}
                        ELSE
                        x:=100;                    {JUGADOR 2 DE 2}
 DibujarJugador(x,y,JUGADOR)
 END;
 SETFILLSTYLE(1,1);
if vidas=0 then
           IF JUGADOR=1 THEN
                        begin
                        UNOJUEGA:=FALSE;
                        IF EFECTO1 THEN BEGIN CUENTAefect1:=0; EFECTO1:=FALSE; BAR(414,129,516,133) END;
                        IF UNOcambia THEN UNOcambia:=FALSE;
                        IF SPEED1=3 THEN SPEED1:=0;
                        tipear(': GAME OVER :',460,85,0,11,1)
                        end
                        ELSE
                        begin
                        DOSJUEGA:=FALSE;
                        IF EFECTO2 THEN BEGIN CUENTAefect2:=0; EFECTO2:=FALSE; BAR(414,439,516,443)END;
                        IF DOScambia THEN DOScambia:=FALSE;
                        IF SPEED2=3 THEN SPEED2:=0;
                        tipear(': GAME OVER :',460,395,0,11,1)
                        end
           else
           begin
           tipear('Una Vida Menos',460,145,10,15,1);
           tipear('Dispare Para Continuar',425,153,25,11,1);
           t:='0';
           repeat t:=readkey until (t=' ')OR(t=chr(9));
           SetColor(1);
           OutTextXY(460,145,'€€€€€€€€€€€€€€€');
           OutTextXY(425,153,'€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€')
           end
end;

Procedure BorrarEnemigo(c,f:vector);
var e:integer;
Begin
SetColor(0);SetFillStyle(1,0);
For e:=1 to cantidadNAVES do
    Bar(c[e]-15,f[e]-5,c[e]+15,f[e]+23);
end;

Procedure Dibujar1Enemigo(c,f,CODIGO:integer);
Begin
IF CODIGO=1 THEN
 BEGIN
 SetColor(2);
 Ellipse(c,f,150,30,5,10);
 Ellipse(c,f,150,30,4,9);
 Ellipse(c,f,150,30,3,8);
 SetColor(11);
 Ellipse(c,f+20,0,360,2,3);
 SetColor(8);
 Ellipse(c-9,f+3,0,360,2,3);
 Ellipse(c+9,f+3,0,360,2,3);
 Ellipse(c-9,f+3,0,360,1,2);
 Ellipse(c+9,f+3,0,360,1,2);
 SetColor(10);
 Line(c+2,f,c,f+20);Line(c-2,f,c,f+20);
 Line(c-10,f-5,c+10,f-5);
 Line(c+10,f-5,c+15,f+3);Line(c-10,f-5,c-15,f+3);
 Line(c-14,f+3,c-11,f+15);Line(c-11,f+15,c-4,f+5);
 Line(c+14,f+3,c+11,f+15);Line(c+11,f+15,c+4,f+5);
 SetColor(14);
 Line(c-15,f+3,c-12,f+15);Line(c-12,f+15,c-5,f+5);
 Line(c+15,f+3,c+12,f+15);Line(c+12,f+15,c+5,f+5)
END;
IF CODIGO=2 THEN
BEGIN
 SetColor(12);
 Ellipse(c,f+5,0,180,15,10);
 Line(c-15,f+5,c-5,f+12);
 Line(c+15,f+5,c+5,f+12);
 Line(c-5,f+11,c+5,f+11);
 SetColor(3);
 Ellipse(c,f+15,160,15,5,8);
 Ellipse(c,f+15,145,25,3,6);
 SetColor(5);
 Line(c-12,f+8,c-15,f+18); Line(c+12,f+8,c+15,f+18);
 Line(c-5,f+10,c-15,f+18); Line(c+5,f+10,c+15,f+18);
 SetFillStyle(9,4);
 FloodFill(c,f,12);
 SetColor(3);circle(c,f+15,3);circle(c,f+15,2);
 SetColor(11);circle(c,f+15,1)
END;
IF CODIGO=3 THEN
 BEGIN
 SetColor(11);
 Ellipse(c,f+17,0,360,15,5);
 Circle(c,f+19,4);
 SetColor(10);
 Line(c-7,f+15,c-15,f+8);
 Line(c-15,f+8,c-7,f+3);
  Line(c-15,f+8,c+7,f+15);
  Line(c+15,f+8,c-7,f+15);
 Line(c+7,f+15,c+15,f+8);
 Line(c+15,f+8,c+7,f+3);
  SetColor(11);circle(C,F+20,3);
  SetColor(6);Line(C-1,F+20,C-1,F+13);circle(C,F+20,2);Line(C+1,F+20,C+1,F+13);
  SetColor(12);Line(C,F+20,C,F+10);
   SETFILLSTYLE(1,12);FLOODFILL(C-8,F+12,10);FLOODFILL(C+8,F+12,10)
 END;
IF CODIGO=4 THEN
 BEGIN
 SetColor(11);
 Ellipse(c,f+17,0,360,15,5);
 Circle(c,f+19,4);
 SetColor(10);
 Line(c-7,f+15,c-15,f+5);
 Line(c-15,f+5,c-7,f-5);
  Line(c-15,f+5,c+7,f+15);
  Line(c+15,f+5,c-7,f+15);
 Line(c+7,f+15,c+15,f+5);
 Line(c+15,f+5,c+7,f-5);
  SetColor(11);circle(C,F+20,3);
  SetColor(6);Line(C-1,F+20,C-1,F+13);circle(C,F+20,2);Line(C+1,F+20,C+1,F+13);
  SetColor(12);Line(C,F+20,C,F+10);
   SETFILLSTYLE(1,12);FLOODFILL(C-8,F+12,10);FLOODFILL(C+8,F+12,10)
 END
end;

Procedure DibujarEnemigo(c,f:vector; N: Pointer);
var e:integer;
Begin
For e:=1 to cantidadNaves do
    IF NPANT<>3 THEN
     PutImage(c[e]-15, f[e]-5, N^, ORPut)   {AGREGA LAS NAVES POR SI COINCIDEN}
                ELSE
   IF (F[E] MOD 18>12) THEN PutImage(c[e]-15, f[e]-5, K^, ORPut)
                                ELSE PutImage(c[e]-15, f[e]-5, L^, ORPut)
end;

Procedure DesDisparaEnemigo(e:integer; var cd,fd:vector);
begin SetColor(0);SetFillStyle(1,0);
 case NPANT of
  1:Bar(cd[e]-3,fd[e]-3,cd[e]+3,fd[e]+3);
  2,3:Bar(cd[e]-3,fd[e]-10,cd[e]+3,fd[e]+3)
 end
end;

Procedure DisparaEnemigo(x,e:integer; var estado:vectdisp; var cd,fd:vector);
begin
{INICIO MOVIMIENTO DE BALAS}
if NPANT=1 then Inc(fd[e],2);{VERTICAL}
if (NPANT=2)OR(NPANT=3) then
 begin
 if (FINAL)and(NPANT<>3) then Inc(fd[e],5)
   else
 Inc(fd[e],3)
 end;
IF (NPANT=1)OR(NPANT=3) THEN                {HORIZONTAL}
 BEGIN
 if DOSJuega then
  begin
    if UNOJuega then
      begin
       if (e mod 2 = 0) then x:=x1
      end
    else
      x:=x1
  end;
 if random(2)=1 then
   if cd[e]>x then cd[e]:=cd[e]-random(7) else cd[e]:=cd[e]+random(7)
 else
   if cd[e]<x then cd[e]:=cd[e]-random(4) else cd[e]:=cd[e]+random(4);
 END;
{FIN MOVIMIENTO DE BALAS}
if cd[e]>396 then cd[e]:=396;
CASE NPANT OF
 1:BEGIN
   SetColor(12);circle(cd[e],fd[e],3);circle(cd[e],fd[e],2);
   SetColor(14);circle(cd[e],fd[e],1);
   END;
 2:BEGIN
   SetColor(10);circle(cd[e],fd[e],3);Line(cd[e]-1,fd[e],cd[e]-1,fd[e]-7);
   circle(cd[e],fd[e],2);Line(cd[e]+1,fd[e],cd[e]+1,fd[e]-7);
   SetColor(14);Line(cd[e],fd[e],cd[e],fd[e]-10)
   END;
 3:BEGIN
   SetColor(11);circle(cd[e],fd[e],3);circle(cd[e],fd[e],2);
   SetColor(1);Line(cd[e]-1,fd[e],cd[e]-1,fd[e]-7);
   Line(cd[e]+1,fd[e],cd[e]+1,fd[e]-7);
   SetColor(12);Line(cd[e],fd[e],cd[e],fd[e]-10)
   END
END;
if fd[e]>479 then estado[e]:=false
end;

Procedure BORRARdispang(ARRIBA,DERECHA,IZQUIERDA:integer);
begin
SetFillStyle(1,0);
BAR(DERECHA-2,ARRIBA-2,DERECHA+2,ARRIBA+2);
BAR(IZQUIERDA-2,ARRIBA-2,IZQUIERDA+2,ARRIBA+2);
end;

Procedure borrarDISPLASER(cantdisp:integer; var disparo: vectordisparos; auxY,auxX:vectorPOSDIS; LASER:BOOLEAN);
var d:integer;
begin
SetColor(0);
IF LASER THEN
For d:=1 to cantdisp do
 if (disparo[d])and(auxY[d]>=1) then
  begin
   Disparar(auxX[d],auxY[d],TRUE);
   if auxY[d]<7 then disparo[d]:=false
  end
end;

Procedure EXPLOCION(VAR SUMA,A,RX,RY,NX,NY:INTEGER);
BEGIN
a:=0;       {INICIO EXPLOSION QUE NO BORRA NADA DEL COSTADO}
IF NX>300 THEN NX:=300;
repeat
SetColor(0);
Circle(rx+nx,ry+ny,5+suma);
Circle(nx+rx-3,ny+ry+3,30-suma);
Circle(nx+rx+6,ny+ry+5,suma div 3);
Circle(nx+rx-(suma+5),ny+ry,(suma*2) div 3);
if suma=30 then BEGIN suma:=1; a:=a+1 end;
rx:=random(60);
Inc(suma);
SetColor(12);Circle(nx+rx,ny+ry,5+suma);
SetColor(4);Circle(nx+rx-3,ny+ry+3,30-suma);
SetColor(6);Circle(nx+rx+6,ny+ry+5,suma div 3);
SetColor(14);Circle(nx+rx-(suma+5),ny+ry,(suma*2) div 3);
delay(30)
until a=3;                                   {FIN EXPLOSION}
ny:=-110;     {POSICION DE NAVE FINAL PARA LA OTRA PANTALLA}
nx:=150
END;

Procedure COPIARNaves(VAR N,M,L,K:Pointer);
Var SizeE:integer;
Begin
ClearDevice;
                                 {COPIA LA IMµGEN EN UNA UBICACI‡N DE MEMORIA}
SetBkColor(0);                                                             {I}
SetLineStyle(0,0,1);                                                       {I}
{ENEMIGO 1}
 Dibujar1Enemigo(15,5,1);                                                  {I}
 SizeE:=ImageSize(0, 0, 30, 28);                                           {I}
 GetMem(N, SizeE);                                                         {I}
 GetImage(0, 0, 30, 28, N^);                                               {I}
{ENEMIGO 2}
 Dibujar1Enemigo(47,5,2);                                                  {I}
 SizeE:=ImageSize(32, 0, 62, 28);                                          {I}
 GetMem(M, SizeE);                                                         {I}
 GetImage(32, 0, 62, 28, M^);                                              {I}
{ENEMIGO 3.1}
 Dibujar1Enemigo(79,5,3);                                                  {I}
 SizeE:=ImageSize(64, 0, 94, 28);                                          {I}
 GetMem(L, SizeE);                                                         {I}
 GetImage(64, 0, 94, 28, L^);                                              {I}
{ENEMIGO 3.2}
 Dibujar1Enemigo(111,5,4);                                                 {I}
 SizeE:=ImageSize(96, 0, 126, 28);                                         {I}
 GetMem(K, SizeE);                                                         {I}
 GetImage(96, 0, 126, 28, K^);                                             {I}
ClearDevice                                                        {HASTA ACµ}
end;

Procedure CUADRO(VAR UNOJUEGA,DOSJUEGA,VERCUADRO,SALIR,CALCEFI1,CALCEFI2,DOS:BOOLEAN; VAR NPANT,PILLefect,PILLX,PILLY,matados,
choques,total,matados1,choques1:INTEGER; VAR eficiencia,eficiencia1:REAL);
VAR KEY:CHAR;
BEGIN
  {CUADRO DE EFICIENCIA}
  if ((NOT UNOJUEGA)AND(NOT DOSJUEGA))OR(VERCUADRO) then
    begin                                                   {PASA DE PANTALLA}
     if (not UNOJUEGA)and(NOT DOSJUEGA) then SALIR:=TRUE;
     if PILLefect<>0 THEN {SI PASA DE PANTALLA BORRA LA PASTILLA}
        BEGIN
         PILLefect:=0;
         BORRARPastilla(PILLX,PILLY);
         PILLX:=-10;
         PILLY:=-10
        END;
     IF CALCEFI1 THEN
        BEGIN
        eficiencia:=((matados-choques)/total)*100;
        IF EFICIENCIA<0 THEN EFICIENCIA:=0;
        IF (not UNOJUEGA) THEN CALCEFI1:=FALSE
        END;
     SetColor(12);SetFillStyle(10,4);
     IF (NOT DOS) THEN                                {SI HAY UN S‡LO JUGADOR}
     BEGIN
     Bar3D(50,50,350,350,4,TopOn);Line(51,325,350,325);
     Dibujar1Enemigo(160,90,NPANT);
     SetColor(11);
     SetTextStyle(3,0,5); OutTextXY(200,70,'x');
     Str(matados:2,STRAux);Escribir(STRAux,230,70);
     Str(choques:2,STRAux);STRAux:=Concat(STRAux,' Choques');Escribir(STRAux,80,130);
     OutTextXY(75,200,': EFICIENCIA :');
     SetTextStyle(10, 0, 4);
     Str(eficiencia:0:0,STRAux);
     STRAux:=Concat(STRAux,'%');
     Escribir(STRAux,160,240);
     SetTextStyle(11,0,1);
     tipear('Precione ENTER Para Continuar',80,335,40,11,1);
     repeat key:=readkey until key=chr(13);
     SetColor(0);SetFillStyle(1,0);Bar(0,0,399,480)
     END
     ELSE                                               {SI HAY DOS JUGADORES}
     BEGIN
     IF CALCEFI2 THEN
        BEGIN
        eficiencia1:=((matados1-choques1)/total)*100;
        IF EFICIENCIA1<0 THEN EFICIENCIA1:=0;
        IF (not DOSJUEGA) THEN CALCEFI2:=FALSE
        END;
     Bar3D(50,10,350,470,4,TopOn);Line(51,445,350,445);Line(51,230,350,230);
     Dibujar1Enemigo(160,40,NPANT);Dibujar1Enemigo(160,240,NPANT);
     SetColor(11);
     SetTextStyle(3,0,5); OutTextXY(200,20,'x'); OutTextXY(200,220,'x');
     Str(matados:2,STRAux);Escribir(STRAux,230,20);
     Str(matados1:2,STRAux);Escribir(STRAux,230,220);
     Str(choques:2,STRAux);STRAux:=Concat(STRAux,' Choques');Escribir(STRAux,80,70);
     Str(choques1:2,STRAux);STRAux:=Concat(STRAux,' Choques');Escribir(STRAux,80,270);
     OutTextXY(75,120,': EFICIENCIA :');
     OutTextXY(75,320,': EFICIENCIA :');
     SetTextStyle(10, 0, 4);
     Str(eficiencia:0:0,STRAux); STRAux:=Concat(STRAux,'%');Escribir(STRAux,160,160);
     Str(eficiencia1:0:0,STRAux); STRAux:=Concat(STRAux,'%');Escribir(STRAux,160,360);
     SetTextStyle(11,0,1);
     tipear('Precione ENTER Para Continuar',80,455,40,11,1);
     repeat key:=readkey until key=chr(13);
     SetColor(0);SetFillStyle(1,0);Bar(0,0,399,480)
     END;
IF VERCUADRO THEN BEGIN VERCUADRO:=FALSE; IF NPANT=3 THEN NPANT:=1 ELSE Inc(NPANT) END;
    end
END;


Procedure CrearArchivo(var archivo: DataFile; var v: Top5; bool:boolean);
var lcl:integer;
begin
 ReWrite(archivo); {Lo crea por si no existe}
 for lcl:=1 to 5 do
  BEGIN
  with r do
   BEGIN
    nom:='LuK@sCL';
    pun:='50   ';
    jug:='1';
    efi:='80% '
   END;
 WRITE(archivo,r);
 if bool then v[lcl]:=r {LO PASA AL VECTOR}
 END;
end;

Procedure Ranking5;
var lcl, player, num: integer;
    archivo: DataFile;
    r: TopFive;
Begin
ClearDevice;
SetBkColor(0);
SetColor(1);Rectangle(70,180,610,405);SetFillStyle(1,1);FloodFill(0,0,1);
SetColor(4);SetTextStyle(11,0,1);OutTextXY(109,186,'Nombre             Puntaje        Jugador   Eficiencia');
SetColor(12);SetTextStyle(11,0,1);OutTextXY(110,185,'Nombre             Puntaje        Jugador   Eficiencia');
 SetTextStyle(4, 0, 8);
 SetColor(9);OutTextXY(33,2,'Space');SetColor(15);OutTextXY(30,4,'Space');SetColor(11);OutTextXY(31,4,'Space');
 SetTextStyle(4, 0, 7);
 SetColor(9);OutTextXY(77,60,'Ships');SetColor(15);OutTextXY(78,61,'Ships');SetColor(11);OutTextXY(79,61,'Ships');
 SetTextStyle(4, 0, 7);
 SetColor(15);SetTextStyle(2, 1, 6);OutTextXY(225,44,'Adventure!');
 SetTextStyle(10, 0, 7);
 SetColor(12);OutTextXY(255,10,'Ranking');
 SetFillStyle(6,4);
 FloodFill(267,60,12);{R}
 FloodFill(350,90,12);{A}
 FloodFill(380,90,12);{N}
 FloodFill(427,90,12);{K}
 FloodFill(490,90,12);FloodFill(490,60,12);{I}
 FloodFill(517,90,12);{N}
 FloodFill(570,90,12);{G}
 SetColor(4);OutTextXY(256,10,'Ranking');SetColor(9);OutTextXY(255,12,'Ranking');
 SetColor(12);OutTextXY(254,10,'Ranking');SetColor(4);OutTextXY(256,9,'Ranking');SetColor(9);OutTextXY(256,11,'Ranking');
 SetTextStyle(2, 0, 6);tipear('Lucas Capalbo',370,125,0,11,1);
 SetTextStyle(5, 0, 1);tipear('Producciones',395,130,0,12,1);
{CUADRO TIPO STARFLEET TERMINAL}
SetColor(10);Line(0,170,600,170);Line(0,180,610,180);Arc(600,180,0,90,10);
Line(0,415,600,415);Line(0,405,610,405);Arc(600,405,270,360,10);
SetFillStyle(1,2);FloodFill(1,171,10); FloodFill(1,406,10);
SetColor(10);Rectangle(550,184,610,401); Rectangle(0,184,70,401);
SetFillStyle(7,2);FloodFill(551,189,10);
SetFillStyle(7,3);FloodFill(1,189,10);

Assign(archivo,'ssa.lcl');
{$I-} {DESACTIVA ERRORES POR E/S}
Reset(archivo);
If IOResult<>0 then CrearArchivo(archivo,v,false);         {error de apertura}
Seek(archivo,0);
SetTextStyle(10, 0, 2);
For lcl:= 1 to 5 do
BEGIN
 Read(archivo,r);
 Escribir(r.nom,90,190+(40*(lcl-1)));
 Escribir(r.pun,260,190+(40*(lcl-1)));
 DibujarJugador(410,225+(40*(lcl-1)), Valor(r.jug));
 if r.efi<>'100%' then Escribir(r.efi,470,190+(40*(lcl-1)))
                  else Escribir(r.efi,450,190+(40*(lcl-1)))
END;
repeat if keypressed then t:=readkey until (t=chr(27))OR(t=chr(13))OR(t=' ')OR(t=chr(9))
End;

Procedure GRABARranking(puntos,puntos1:integer; var archivo: DataFile);
begin
SetTextStyle(11, 0, 2);
if (puntos>=50)OR(puntos1>=50) then
BEGIN
 SEGRABO:=FALSE;
 assign(archivo,'ssa.lcl');
 {$I-} {DESACTIVA ERRORES POR E/S}
 Reset(archivo);
If IOResult<>0 then CrearArchivo(archivo,v,true)           {error de apertura}
                ELSE  {SI NO HUBO PROBLEMAS}
                BEGIN {SE PASAN LOS DATOS AL VECTOR}
                 SEEK(ARCHIVO,0);
                 for x:=1 to 5 do
                  begin read(archivo,r); v[x]:=r end
                END;

 {$I+} {REACTIVA LAS INTERRUPCIONES}
 {SE FIJA QUIEN GRABA E INGRESA LOS DATOS AL VECTOR}
 IF Valor(V[5].pun) < PUNTOS THEN
   BEGIN
    SEGRABO:=TRUE;
    Str(PUNTOS,PUNT);
    SetFillStyle(2,1);Bar(180,175,370,225);
    SetColor(12);
    Rectangle(180,175,370,225);
    tipear('Jugador 1: ',200,195,10,12,1);
    STRAux:='';
    x:=0;
   while x<>8 do
   begin
    repeat t:=readkey until (t=chr(13))OR(t=chr(8))OR((t>=' ')AND(t<='z'));{let,LET,0a9 y car.sp.}
    if t=chr(13) then break;
    if (t=chr(8))AND(x<>0) then
                begin
                 Delete(STRAux,x,1);
                 Bar(280+(8*x),195,288+(8*x),220);
                 Dec(x)
                end
                else
                if t<>chr(8) then
                 begin
                 Inc(x);
                 STRAux:=Concat(STRAux,t);
                 OutTextXY(280+(8*x),195,t)
                 end
   end;
    t:='-';
    V[6].nom:=STRAux;
    V[6].pun:=punt;
    V[6].jug:='1';
    Str(eficiencia:0:0,STRAux); STRAux:=Concat(STRAux,'%');
    V[6].efi:=STRAux
   END;
 IF DOS THEN
 BEGIN
  IF Valor(V[5].pun) < PUNTOS1 THEN
   BEGIN
    SEGRABO:=TRUE;
    Str(PUNTOS1,PUNT1);
    SetFillStyle(2,1);Bar(180,225,370,275);
    SetColor(12);
    Rectangle(180,225,370,275);
    tipear('Jugador 2: ',200,245,10,12,1);
    STRAux:='';
    x:=0;
   while x<>8 do
   begin
    repeat t:=readkey until (t=chr(13))OR(t=chr(8))OR((t>=' ')AND(t<='z'));{let,LET,0a9 y car.sp.}
    if t=chr(13) then break;
    if (t=chr(8))AND(x<>0) then
                begin
                 Delete(STRAux,x,1);
                 Bar(280+(8*x),245,288+(8*x),270);
                 Dec(x)
                end
                else
                if t<>chr(8) then
                 begin
                 Inc(x);
                 STRAux:=Concat(STRAux,t);
                 OutTextXY(280+(8*x),245,t)
                 end
   end;
    t:='-';
    V[7].nom:=STRAux;
    V[7].pun:=punt1;
    V[7].jug:='2';
    Str(eficiencia1:0:0,STRAux); STRAux:=Concat(STRAux,'%');
    V[7].efi:=STRAux
   END
 END;
 {SE ORDENA EL VECTOR}
 for x:=1 to 6 do for y:=1 to 7-x do if Valor(v[y].pun) < Valor(v[y+1].pun) then begin r:=v[y]; v[y]:=v[y+1]; v[y+1]:=r end;
 {SE GRABA EL ARCHIVO}
 SEEK(ARCHIVO,0);
 FOR X:=1 TO 5 DO WRITE(archivo,V[x]);         {GRABO LOS MEJORES 5 JUGADORES}
Close(archivo);
{SE MUESTRA EL RANKING}
IF SEGRABO THEN Ranking5
END
end;


Begin
{INICIO DE LA UNIDAD GRµFICA}
Driver := Detect;
InitGraph(Driver, Mode,' ');

1:
ClearDevice;
SetBkColor(1);
SetTextStyle(2, 0, 6);tipear('Lucas Capalbo',460,435,0,11,1);
SetTextStyle(5, 0, 1);tipear('Producciones',495,440,0,12,1);
SetTextStyle(4, 0, 10);
SetColor(9);OutTextXY(103,-12,'Space');SetColor(15);OutTextXY(100,-10,'Space');SetColor(11);OutTextXY(101,-10,'Space');
SetColor(9);OutTextXY(130,86,'Ships');SetColor(15);OutTextXY(131,87,'Ships');SetColor(11);OutTextXY(132,87,'Ships');
SetColor(15);SetTextStyle(2, 1, 10);OutTextXY(430,20,'Adventure!');
      SetTextStyle(2, 0, 6);
      tipear('Edici¢n Especial Para:',210,5,0,11,1);
      tipear('    Lucas Capalbo Lavezzo',180,20,0,11,1);
SetColor(12);
Rectangle(1, 1, 639, 479);Rectangle(3, 3, 637, 477);                 {640x480}
SetTextStyle(10, 0, 3);
Escribir('Jugar',200,250);
Escribir('Velocidad',200,300);
Escribir('Dificultad',200,350);
Escribir('Salir',200,400);
STRAux:='Uno';
veloc:='Normal';
dificul:='Media';
dos:=false;
velocidad:=8;
dificultad:=50;
Escribir(STRAux,400,250);
Escribir(veloc,400,300);
Escribir(dificul,400,350);
y:=275;
t:='-';
repeat
Flecha(160,y,1);
Case t of
     chr(72),'8','w','W': if y=275 then y:=425 else y:=y-50;
     chr(80),'2','s','S': if y=425 then y:=275 else y:=y+50;
     chr(75),'4','a','A': begin
                          if y=275 then
                                   begin
                                   if STRAux='Uno' then STRAux:='Dos'
                                   else
                                   if STRAux='Dos' then STRAux:='Uno';
                                   SetFillStyle(1,1); Bar(399,250,550,300)
                                   end;
                          if y=325 then
                                   begin
                                   Case velocidad of
                                     8: begin velocidad:=10; veloc:='Lento' end;
                                     10: begin velocidad:=6; veloc:='R†pido' end;
                                     6: begin velocidad:=8; veloc:='Normal' end
                                   end;
                                   SetFillStyle(1,1); Bar(400,300,550,350);
                                   end;
                          if y=375 then
                                   begin
                                   Case dificultad of
                                     50: begin dificultad:=100; dificul:='F†cil' end;
                                     100: begin dificultad:=4; dificul:='Dif°cil' end;
                                     4: begin dificultad:=50; dificul:='Media' end
                                   end;
                                   SetFillStyle(1,1); Bar(400,350,550,400);
                                   end;
                          end;
     chr(77),'6','d','D': begin
                          if y=275 then
                                   begin
                                   if STRAux='Uno' then STRAux:='Dos'
                                   else
                                   if STRAux='Dos' then STRAux:='Uno';
                                   SetFillStyle(1,1); Bar(399,250,550,300)
                                   end;
                          if y=325 then
                                   begin
                                   Case velocidad of
                                     8: begin velocidad:=6; veloc:='R†pido' end;
                                     10: begin velocidad:=8; veloc:='Normal' end;
                                     6: begin velocidad:=10; veloc:='Lento' end
                                   end;
                                   SetFillStyle(1,1); Bar(400,300,550,350);
                                   end;
                          if y=375 then
                                   begin
                                   Case dificultad of
                                     50: begin dificultad:=4; dificul:='Dif°cil' end;
                                     100: begin dificultad:=50; dificul:='Media' end;
                                     4: begin dificultad:=100; dificul:='F†cil' end
                                   end;
                                   SetFillStyle(1,1); Bar(400,350,550,400);
                                   end;

                          end;
     chr(27): begin
              RestoreCRTMode; clrscr; Writeln('Space Ships Adventure! Lucas Capalbo Producciones.'); Writeln; exit
              end
end;
Case y of
     275: begin
          Escribir(STRAux,400,250);
          opcion:=1
          end;
     325: begin
          Escribir(veloc,400,300);
          opcion:=2
          end;
     375: begin
          Escribir(dificul,400,350);
          opcion:=3
          end;
     425: opcion:=4
end;
Flecha(160,y,12);
t:=readkey
until ((t=chr(13))OR(t=' '))AND((opcion=1)OR(opcion=4));

if opcion=4 then begin
                 RestoreCRTMode; clrscr; Writeln('Space Ships Adventure! Lucas Capalbo Producciones.'); exit
                 end;

{SE COPIAN LAS NAVES}
COPIARNaves(N,M,L,K);

if STRAux='Uno' then dos:=false;
if STRAux='Dos' then dos:=true;
IF DOS THEN
       BEGIN
       UNOJUEGA:=TRUE;
       DOSJUEGA:=TRUE
       END
       ELSE
       BEGIN
       UNOJUEGA:=TRUE;
       DOSJUEGA:=FALSE
       END;
VERCUADRO:=FALSE;
SetTextStyle(11, 0, 2);
SetColor(12);
Rectangle(400, 0, 639, 479);                                         {640x480}
Rectangle(402, 2, 637, 477);
SetFillStyle(1,1); FloodFill(403,3,12);
                           {UBICACION DEL T÷TULO, SEGUN CANTIDAD DE JUGADORES}
IF NOT DOS THEN
 BEGIN
 SetTextStyle(4, 0, 8);
 SetColor(9);OutTextXY(423,268,'Space');SetColor(15);OutTextXY(420,270,'Space');SetColor(11);OutTextXY(421,270,'Space');
 SetTextStyle(4, 0, 7);
 SetColor(9);OutTextXY(447,326,'Ships');SetColor(15);OutTextXY(448,327,'Ships');SetColor(11);OutTextXY(449,327,'Ships');
 SetTextStyle(4, 0, 7);
 SetColor(15);SetTextStyle(2, 1, 6);OutTextXY(605,310,'Adventure!');
 SetTextStyle(2, 0, 6);tipear('Lucas Capalbo',460,435,0,11,1);
 SetTextStyle(5, 0, 1);tipear('Producciones',495,440,0,12,1);
 END
 ELSE
 BEGIN
 SetTextStyle(4, 0, 8);
 SetColor(9);OutTextXY(423,148,'Space');SetColor(15);OutTextXY(420,150,'Space');SetColor(11);OutTextXY(421,150,'Space');
 SetTextStyle(4, 0, 7);
 SetColor(9);OutTextXY(447,206,'Ships');SetColor(15);OutTextXY(448,207,'Ships');SetColor(11);OutTextXY(449,207,'Ships');
 SetTextStyle(4, 0, 7);
 SetColor(15);SetTextStyle(2, 1, 6);OutTextXY(605,190,'Adventure!');
 SetTextStyle(2, 0, 6);tipear('Lucas Capalbo',460,285,0,11,1);
 SetTextStyle(5, 0, 1);tipear('Producciones',495,290,0,12,1);
 END;
{JUGADOR 1, ESTADO DE VARIABLES}               {AREA DE JUEGO: 0, 0, 400, 480}
SetTextStyle(11, 0, 2);
tipear('Puntaje',569,24,0,4,1);tipear('Puntaje',570,25,0,12,1);
tipear('Vidas',584,54,0,4,1);tipear('Vidas',585,55,0,12,1);
tipear('Energ°a',569,104,0,4,1);tipear('Energ°a',570,105,0,12,1);
SetColor(14);Line(403,35,636,35);Line(403,65,636,65);Line(403,115,636,115);
{JUGADOR 2, ESTADO DE VARIABLES}
IF DOS THEN
       BEGIN
       tipear('Puntaje',569,334,0,4,1);tipear('Puntaje',570,335,0,12,1);
       tipear('Vidas',584,364,0,4,1);tipear('Vidas',585,365,0,12,1);
       tipear('Energ°a',569,414,0,4,1);tipear('Energ°a',570,415,0,12,1);
       SetColor(14);Line(403,345,636,345);Line(403,375,636,375);Line(403,425,636,425)
       END;
total:=0;
energy:=0; {ENERGIA NAVE FINAL}
cantidadNAVES:=2;
for x:= 1 to 5 do
  begin
   estado[x]:=false;{SI ESTA EN TRUE DISPARA, SINO DISPARA SEGUN LA DIFICULTAD}
   c[x]:=random(380);                            {UBICACION INICIAL ENEMIGOS}
   f[x]:=random(90)*(-1)
  end;
for x:= 1 to 4 do
    begin
    cantidadbalas:=0;
    disparo[x]:=false;
    auxX[x]:=700;       {SACA DE PANTALLA AL DISPARO PARA QUE NO MUERAN SOLAS}
    auxY[x]:=-20
    end;
Case dificultad of
     100: begin
          energiaINICIAL:=4;
          vidas:=4;
          PILL:=8                          {PARA QUE APAREZCAN LAS PASTILLAS}
          end;
     50: begin
         energiaINICIAL:=3;
         vidas:=4;
         PILL:=12
         end;
     4: begin
        energiaINICIAL:=4;
        vidas:=3;
        PILL:=18
        end
end;
for x:= 1 to vidas do                             {DIBUJA LAS VIDAS JUGADOR 1}
   DibujarJugador(650-(30*x),90,1);
energia:=energiaINICIAL;
energia1:=energiaINICIAL;
if dos then
       begin
       for x:= 1 to 4 do
        begin
         cantidadbalas1:=0;
         disparo1[x]:=false;
         auxX1[x]:=700;
         auxY1[x]:=-20
        end;
       puntos1:=0;
       EscribirPuntaje(puntos1,2);
       cantdisp:=1;
       choques1:=0;
       matados1:=0;
       vidas1:=vidas;
       for x:= 1 to vidas1 do                     {DIBUJA LAS VIDAS JUGADOR 2}
          DibujarJugador(650-(30*x),400,2);
       x:=300;
       y:=443;
       x1:=100;                                    {POSICION INICIAL JUGADORES}
       y1:=443
       end
       ELSE
       begin
       x:=200;                                      {POSICION INICIAL JUGADOR}
       y:=443
       end;
MATADOS:=0;
puntos:=0;
EscribirPuntaje(puntos,1);
DibujarJugador(x,y,1);
                               {COPIA LA IMµGEN EN UNA UBICACI‡N DE MEMORIA P}
Size:=ImageSize(x-10, y-20, x+10, y+5);
GetMem(P, Size);
GetImage(x-10, y-20, x+10, y+5, P^);
                                                                   {HASTA ACµ}
MostrarEnergia(energia,energiaINICIAL,1);
IF DOS THEN
   BEGIN
   DibujarJugador(x1,y1,2);
   MostrarEnergia(energia1,energiaINICIAL,2);
                               {COPIA LA IMµGEN EN UNA UBICACI‡N DE MEMORIA Q}
   Size2:=ImageSize(x1-10, y1-20, x1+10, y1+5);
   GetMem(Q, Size2);
   GetImage(x1-10, y1-20, x1+10, y1+5, Q^)
                                                                   {HASTA ACµ}
   END;
DibujarEnemigo(c,f,N);
cantdisp:=1;
choques:=0;
final:=false;
nx:=200;
ny:=-110;
                                                  {COORDENADAS DE LA PASTILLA}
                                          PILLX:=-10;PILLY:=-10;PILLEFECT:=0;
                                           UNOcambia:=FALSE;DOScambia:=FALSE;
                                               EFECTO1:=FALSE;EFECTO2:=FALSE;
                                             CUENTAefect1:=0;CUENTAefect2:=0;
                                                         SPEED1:=0;SPEED2:=0;
                       DISANG:=FALSE;ARRIBA:=-10;DERECHA:=-10;IZQUIERDA:=-10;
                   DISANG1:=FALSE;ARRIBA1:=-10;DERECHA1:=-10;IZQUIERDA1:=-10;
                                                  LASER:=FALSE;LASER1:=FALSE;
                                 ESCUDO:=FALSE;ESCUDO1:=FALSE;ESC:=0;ESC1:=0;

Tipear('Precione Una Tecla Para Comenzar',50,200,20,12,1);
t:=readkey;
Tipear('Precione Una Tecla Para Comenzar',50,200,10,0,0);
CALCEFI1:=TRUE;
CALCEFI2:=TRUE;
NPANT:=1;

while NOT(SALIR) do
begin
  BorrarEnemigo(c,f);
{---JUGADOR 1 - NAVES ENEMIGAS MUEREN, MUEVEN Y CUENTA LA CANTIDAD ---------}
  For d:=1 to cantdisp do
  For e:=1 to cantidadNAVES do
   if not final then
   begin
    {MATAR ENEMIGO}
    IF UNOJUEGA THEN {si lo mata las balas o el disparo para loscostados}
    if (((auxY[d]<f[e]+20)and(auxY[d]>f[e]-6))AND((auxX[d]>c[e]-16)and(auxX[d]<c[e]+16)))OR
    (DISANG AND ( ((ARRIBA<f[e]+20)and(ARRIBA>f[e]-6)) AND (((DERECHA>c[e]-16)and(DERECHA<c[e]+16))
    OR ((IZQUIERDA>c[e]-16)and(IZQUIERDA<c[e]+16))) )) then
    begin
    IF PILLEFECT=0 THEN                                {PASTILLAS}
      IF RANDOM(PILL)=3 THEN
         BEGIN
          PILLX:=C[E];
          PILLY:=F[E];
          PASTILLA(PILLX,PILLY,PILLEFECT);
          PILLEFECT:=random(8)
         END;
    SetFillStyle(1,0);Bar(c[e]-10,f[e]-10,c[e]+10,f[e]+10);
    f[e]:=-80;
    c[e]:=random(380);
    Inc(puntos,5);
    Inc(total);
    Inc(matados);
    IF (NOT LASER) THEN
       BEGIN
       disparo[d]:=false;
       SetColor(0);
       Disparar(auxX[d],auxY[d],LASER);
       auxX[d]:=700;{SACA DE PANTALLA AL DISPARO PARA QUE NO MUERAN SOLAS}
       auxY[d]:=-20
       END;
    EscribirPuntaje(puntos,1)
    end;                                                     {FIN IF UNOJUEGA}
    {ENEMIGO SE MUEVE}
    IF D=1 THEN BEGIN
    CASE NPANT OF
     1:if random(2)=1 then
              begin
              if c[e] > x then c[e]:=c[e]-random(3)
              else c[e]:=c[e]+random(3);
              end
              else
              if c[e] < x then c[e]:=c[e]-random(3)
              else c[e]:=c[e]+random(3);
     2: begin
        if (f[e] mod 150=0) then controla[e]:=not controla[e];
        if controla[e] then Inc(c[e]) else Dec(c[e]);
        end;
     3: IF F[E] MOD 18=0 THEN Inc(F[E],19) ELSE IF (RANDOM(2)=1) THEN INC(F[E])
    END;
    if c[e]<30 then c[e]:=30;
    if c[e]>380 then c[e]:=380;
    IF NPANT<>3 THEN f[e]:=f[e]+1;
    if f[e]>480 then begin
                     Inc(total);
                     f[e]:=-50;
                     c[e]:=random(440)
                     end;
    if (estado[e]=false)AND(random(dificultad)=3) then
                    begin
                    estado[e]:=true;
                    fd[e]:=f[e];
                    cd[e]:=c[e]
                    end;
    if estado[e]=true then
     begin
       DesDisparaEnemigo(e,cd,fd);
{if random(100)=0 then npant:=random(2)+2;{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}
       DisparaEnemigo(x,e,estado,cd,fd);
       if estado[e]=false then DesDisparaEnemigo(e,cd,fd)
     end
   END;
    if (total MOD 50 = 0)AND(total<>0) then
                   begin
                   final:=true;
                   IF DOS THEN
                          BEGIN
                          SETCOLOR(1); SETFILLSTYLE(1,1); BAR(403,150,630,330)
                          END;
                   SetColor(12);SetFillStyle(6,12);PieSlice(530,230,energy,360,60)
                   end
   end;
{------------------ FIN JUGADOR 1, NAVES ENEMIGAS ---------------------------}
{--------------------- JUGADOR 2, NAVES ENEMIGAS  ---------------------------}
IF DOS THEN
BEGIN
  For d:=1 to cantdisp do
  For e:=1 to cantidadNAVES do
   if not final then
   begin
    {MATAR ENEMIGO}
    if (((auxY1[d]<f[e]+20)and(auxY1[d]>f[e]-6))AND((auxX1[d]>c[e]-16)and(auxX1[d]<c[e]+16))) OR
    (DISANG1 AND ( ((ARRIBA1<f[e]+20)and(ARRIBA1>f[e]-6)) AND (((DERECHA1>c[e]-16)and(DERECHA1<c[e]+16))
    OR ((IZQUIERDA1>c[e]-16)and(IZQUIERDA1<c[e]+16))) )) then
    begin                                                         {SI LO MATA}
    IF PILLEFECT=0 THEN                                {PASTILLAS}
      IF RANDOM(PILL)=3 THEN
         BEGIN
          PILLX:=C[E];
          PILLY:=F[E];
          PASTILLA(PILLX,PILLY,PILLEFECT);
          PILLEFECT:=random(8)
         END;
    SetFillStyle(1,0);Bar(c[e]-10,f[e]-10,c[e]+10,f[e]+10);
    f[e]:=-80;
    c[e]:=random(380);
    Inc(puntos1,5);
    Inc(total);
    Inc(matados1);
    IF (NOT LASER1) THEN
       BEGIN
       disparo1[d]:=false;
       SetColor(0);
       Disparar(auxX1[d],auxY1[d],LASER1);
       auxX1[d]:=700;{SACA DE PANTALLA AL DISPARO1 PARA QUE NO MUERAN SOLAS}
       auxY1[d]:=-20
       END;
    EscribirPuntaje(puntos1,2)
    end
   end
END;
{---------------------- FIN JUGADOR 2 NAVES ENEMIGAS ------------------------}
{----------------------------------------------------------------------------}
{----------------------- JUGADOR 1 Y 2, NAVE FINAL --------------------------}
if final then
 Begin
{if random(100)=0 then npant:=random(2)+2;{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}
   BORRARNave1(nx,ny);
   CASE NPANT OF                                       {MOVIMIENTO NAVE FINAL}
    1:if (random(2)=0)AND(nx<320) then nx:=nx+random(5)
                else if nx>80 then nx:=nx-random(5);
    2,3:BEGIN
        if ((nx mod 330<=1)or(NX<70))or((NX MOD 35=1)AND(RANDOM(2)=1)) then controla[1]:=not controla[1];
        if controla[1] then Inc(nx,4-NPANT) else Dec(nx,4-NPANT)
        END
   END;
   if ny<100 then ny:=ny+random(5)
             else ny:=ny-random(5);

   for d:=1 to cantdisp do {<<<<<<<<<<<<<<<<<<<<<<<JUGADOR 1 PEGA AL MONSTRUO}
   if (((auxY[d]<ny+100)and(auxY[d]>ny))AND((auxX[d]>nx-25)and(auxX[d]<nx+25)))
   OR (DISANG AND ( ((ARRIBA<ny+100)and(ARRIBA>ny)) AND (((DERECHA>nx-25)and(DERECHA<nx+25))
    OR ((IZQUIERDA>nx-25)and(IZQUIERDA<nx+25))) ))          {disp cost j1}
                         OR{<<<<<<<<<<<<<<<<<<<<<<<JUGADOR 2 PEGA AL MONSTRUO}
   (((auxY1[d]<ny+100)and(auxY1[d]>ny))AND((auxX1[d]>nx-25)and(auxX1[d]<nx+25)))
   OR (DISANG1 AND ( ((ARRIBA1<ny+100)and(ARRIBA1>ny)) AND (((DERECHA1>nx-25)and(DERECHA1<nx+25))
    OR ((IZQUIERDA1>nx-25)and(IZQUIERDA1<nx+25))) ))          {disp cost j2}
   then
    Begin
    SetColor(1);SetFillStyle(1,1);PieSlice(530,230,energy,360,60);
    if NPANT = 1 then Inc(energy,15);
    if (NPANT=2)OR(NPANT=3) then Inc(energy,10);
   if (DISANG AND ( ((ARRIBA<ny+100)and(ARRIBA>ny)) AND (((DERECHA>nx-25)and(DERECHA<nx+25))
   OR ((IZQUIERDA>nx-25)and(IZQUIERDA<nx+25))) )) THEN {fue un disp de costad}
            begin
             Inc(energy,20);
             BORRARdispang(ARRIBA,DERECHA,IZQUIERDA);
             arriba:=-10;
             derecha:=-10;
             izquierda:=-10
            end;
   if (DISANG1 AND ( ((ARRIBA1<ny+100)and(ARRIBA1>ny)) AND (((DERECHA1>nx-25)and(DERECHA1<nx+25))
   OR ((IZQUIERDA1>nx-25)and(IZQUIERDA1<nx+25))) )) THEN {fue un disp de costad}
            begin
             Inc(energy,20);
             BORRARdispang(ARRIBA1,DERECHA1,IZQUIERDA1);
             arriba1:=-10;
             derecha1:=-10;
             izquierda1:=-10
            end;
    if energy<360 then
               begin
               CASE NPANT OF
                1: begin SetColor(12);SetFillStyle(6,12) end;
                2: begin SetColor(11);SetFillStyle(6,3) end;
                3: begin SetColor(10);SetFillStyle(6,2) end
               END;
               PieSlice(530,230,energy,360,60)
               end;
    if energy>=360 then
                  begin
                  FINAL:=FALSE;
                   IF DOS THEN     {SI SE JUEGA DE A 2 SE RESTAURA EL NOMBRE}
                      BEGIN
                      SETCOLOR(1); SETFILLSTYLE(1,1); BAR(403,150,630,330);
                      SetTextStyle(4, 0, 8);
                      SetColor(9);OutTextXY(423,148,'Space');
                      SetColor(15);OutTextXY(420,150,'Space');
                      SetColor(11);OutTextXY(421,150,'Space');
                      SetTextStyle(4, 0, 7);
                      SetColor(9);OutTextXY(447,206,'Ships');
                      SetColor(15);OutTextXY(448,207,'Ships');
                      SetColor(11);OutTextXY(449,207,'Ships');
                      SetColor(15);SetTextStyle(2, 1, 6);OutTextXY(605,190,'Adventure!');
                      SetTextStyle(2, 0, 6);tipear('Lucas Capalbo',460,285,0,11,1);
                      SetTextStyle(5, 0, 1);tipear('Producciones',495,290,0,12,1)
                      END;
                  Inc(total);
                  rx:=0;ry:=0;
                  SetColor(0);
                  IF UNOJUEGA THEN
                              BEGIN
                              DibujarJugador(x,y,1);
                              Disparar(auxX[d],auxY[d],LASER);
                              Inc(puntos,50);
                              Inc(matados);
                              EscribirPuntaje(puntos,1)
                              END;
                  IF DOSJUEGA THEN
                         BEGIN
                         DibujarJugador(x1,y1,2);
                         Disparar(auxX1[d],auxY1[d],LASER1);
                         Inc(matados1);
                         Inc(puntos1,50);
                         EscribirPuntaje(puntos1,2)
                         END;
                  For e:=1 to 5 do
                      if estado[e]=true then DesDisparaEnemigo(e,cd,fd);
                  EXPLOCION(SUMA,A,RX,RY,NX,NY);       {EXPLOTA LA NAVE FINAL}
                  VERCUADRO:=TRUE;              {MUESTRA CUADRO DE EFICIENCIA}
                  energy:=0
                  end;
    SetColor(0);
    IF UNOJUEGA THEN
           BEGIN
           disparo[d]:=false;
           Disparar(auxX[d],auxY[d],TRUE);
           auxX[d]:=700;
           auxY[d]:=-20
           END;
    IF DOSJUEGA THEN
           BEGIN
           disparo1[d]:=false;
           Disparar(auxX1[d],auxY1[d],TRUE);
           auxX1[d]:=700;
           auxY[d]:=-20
           END
    end;                                                {{{{{{{{{{}
   for e:=1 to 5 do                                      {DISPAROS NAVE FINAL}
     Begin
       if (NOT estado[e])AND(random(dificultad+3)=3) then
                    begin
                    estado[e]:=true;
                    if (e=2)OR(e=4) then cd[e]:=nx-60
                                    else cd[e]:=nx+60;
                    fd[e]:=ny+80
                    end;
       if estado[e] then
          begin
           DesDisparaEnemigo(e,cd,fd);
           DisparaEnemigo(x,e,estado,cd,fd);
           if estado[e]=false then DesDisparaEnemigo(e,cd,fd)
          end;
   if estado[e] then                          {BALAS NAVE FINAL SACAN ENERGIA}
   BEGIN                                                        {AL JUGADOR 1}
   IF UNOJUEGA THEN
   if (((cd[e]>x-13)AND(cd[e]<x+13))AND((fd[e]>y-20)AND(fd[e]<y+5))) then
      begin
      estado[e]:=false;
      DesDisparaEnemigo(e,cd,fd);
      IF ESCUDO THEN
      BEGIN Inc(ESC); IF ESC=5 THEN BEGIN BORRARJUGADOR(X,Y,TRUE); ESC:=0; ESCUDO:=FALSE END END
      ELSE
      BEGIN
      Dec(energia);
      MostrarEnergia(energia,energiaINICIAL,1);
      IF NPANT=3 THEN BEGIN BORRARJUGADOR(x,y,TRUE); IF Y<450 THEN Inc(Y,30) END;
      if energia=0 then
                 begin
                  QuitarVida(a,energia,vidas,x,y,energiaINICIAL,1,DOS);
                  BorrarJugador(x,y,ESCUDO);
{---////////----} borrarDISPLASER(cantdisp,disparo,auxY,auxX,TRUE);
                  if vidas=0 then
                       begin {MUESTRA AL CUADRO SI EL 2 NO JUEGA +}
                       UNOJUEGA:=false;
                       IF (NOT DOSJUEGA) THEN VERCUADRO:=TRUE
                       end
                 end
       end;
      end;
    IF DOSJUEGA THEN                                            {AL JUGADOR 2}
    if (((cd[e]>x1-13)AND(cd[e]<x1+13))AND((fd[e]>y1-20)AND(fd[e]<y1+5))) then
      begin
      estado[e]:=false;
      DesDisparaEnemigo(e,cd,fd);
      IF ESCUDO1 THEN
      BEGIN Inc(ESC1); IF ESC1=5 THEN BEGIN BORRARJUGADOR(X1,Y1,TRUE); ESC1:=0; ESCUDO1:=FALSE END END
      ELSE
      Begin
      Dec(energia1);
      MostrarEnergia(energia1,energiaINICIAL,2);
      IF NPANT=3 THEN BEGIN BORRARJUGADOR(x1,y1,TRUE); IF Y1<455 THEN Inc(Y1,15) END;
      if energia1=0 then
                 begin
                  QuitarVida(a,energia1,vidas1,x1,y1,energiaINICIAL,2,DOS);
                  BorrarJugador(x1,y1,ESCUDO1);
{---////////----} borrarDISPLASER(cantdisp,disparo1,auxY1,auxX1,TRUE);
                  if vidas1=0 then
                       begin {MUESTRA AL CUADRO SI EL 1 NO JUEGA +}
                       DOSJUEGA:=false;
                       IF (NOT UNOJUEGA) THEN VERCUADRO:=TRUE
                       end
                 end       end
      End
     END;
{}                                                         IF (VERCUADRO) THEN
{}                                                                       BEGIN
{}                                                          for e:= 1 to 5 do
{}                                                                     begin
{}                                                         estado[e]:=false;
{}                                                        c[e]:=random(380);
{}                                                     f[e]:=random(200)*(-1)
{}                                                                       end
{}                                                                         END
END;
{@@@@@@}
   Nave1(nx,ny);
   IF UNOJUEGA THEN
   if (((x-10)<(nx+60))AND((x+10)>(nx-60)))AND(((y+5)>(ny))AND((y-20)<(ny+100))) then
      begin
      Inc(puntos,10);                     {SI CHOCA NAVE FINAL GANA 15 PUNTOS}
      EscribirPuntaje(puntos,1);
      Inc(choques);
      Nave1(nx,ny);
      SetColor(0);
      For d:=1 to cantdisp do
     if (disparo[d]) and not(auxY[d]<1) then             {BORRAR AL DISPARO 1}
           begin
            Disparar(auxX[d],auxY[d],LASER);
            if auxY[d]<7 then disparo[d]:=false
           end;
      QuitarVida(a,energia,vidas,x,y,energiaINICIAL,1,DOS);
      BorrarJugador(x,y,ESCUDO)
      end;

   IF DOSJUEGA THEN
   if (((x1-10)<(nx+60))AND((x1+10)>(nx-60)))AND(((y1+5)>(ny))AND((y1-20)<(ny+100))) then
      begin
      Inc(puntos1,10);                     {SI CHOCA NAVE FINAL GANA 15 PUNTOS}
      EscribirPuntaje(puntos1,2);
      Inc(choques1);
      Nave1(nx,ny);
      SetColor(0);
      For d:=1 to cantdisp do
      if (disparo1[d]) and not(auxY1[d]<1) then          {BORRAR AL DISPARO 2}
           begin
            Disparar(auxX1[d],auxY1[d],LASER1);
            if auxY1[d]<7 then disparo1[d]:=false
           end;
      QuitarVida(a,energia1,vidas1,x1,y1,energiaINICIAL,2,DOS);
      BorrarJugador(x1,y1,ESCUDO1)
      end
   END;                                                        {FIN DEL FINAL}

  if not final then
     CASE NPANT OF
      1: DibujarEnemigo(c,f,N);
      2: DibujarEnemigo(c,f,M);
      3: DibujarEnemigo(c,f,L)
     END;
  SetColor(0);
  For d:=1 to cantdisp do
  if (disparo[d]) and not(auxY[d]<1) then                  {BORRAR AL DISPARO}
           begin
            Disparar(auxX[d],auxY[d],LASER);
            if auxY[d]<7 then disparo[d]:=false
           end;
  if DOSJUEGA then
     For d:=1 to cantdisp do
     if (disparo1[d]) and not(auxY1[d]<1) then           {BORRAR AL DISPARO 2}
           begin
            Disparar(auxX1[d],auxY1[d],LASER1);
            if auxY1[d]<7 then disparo1[d]:=false
           end;
  if UNOJUEGA then BorrarJugador(x,y,ESCUDO);
  if DOSJUEGA then BorrarJugador(x1,y1,ESCUDO1);
{SI SE MATA LA NAVE ANTES QUE APAREZCA EN LA PARTE VISIBLE DE LA PANTALLA}
IF (PILLEFECT<>0)AND((PILLX<0)or(PILLY<0)) THEN PILLEFECT:=0;
{HASTA ACA}
  IF PILLEFECT<>0 THEN                                             {PASTILLAS}
         BEGIN
          BORRARPastilla(PILLX,PILLY);
          Inc(PILLY);
          If PILLY>480 then begin PILLY:=-10; PILLY:=-10; PILLEFECT:=0 END;
          IF (UNOJUEGA)AND(((PILLX>x-20)AND(PILLX<x+20)) AND ((PILLY>y-25)AND(PILLY<y+10))) THEN
             BEGIN
             Case PILLEFECT of
              1: INC(PUNTOS,100);
              2: BEGIN energia:=energiaINICIAL; MostrarEnergia(energia,energiaINICIAL,1) end;
              3: BEGIN EFECTO1:=TRUE; UNOcambia:=TRUE; CUENTAefect1:=0 END;
              4: BEGIN EFECTO1:=TRUE; CUENTAefect1:=0; SPEED1:=3 END;
              5: DISANG:=TRUE;
              6: LASER:=TRUE;
              7: BEGIN ESCUDO:=TRUE; ESC:=0 END
             end;
             Inc(puntos,5); {GANA 5 PUNTOS}
             EscribirPuntaje(puntos,1);
             BORRARPastilla(PILLX,PILLY);
             PILLEFECT:=0;
             PILLX:=-10;
             PILLY:=-10
             END;
          IF (DOSJUEGA)AND(((PILLX>x1-20)AND(PILLX<x1+20)) AND ((PILLY>y1-25)AND(PILLY<y1+10))) THEN
             BEGIN
             Case PILLEFECT of
              1: INC(PUNTOS1,100);
              2: Begin energia1:=energiaINICIAL; MostrarEnergia(energia1,energiaINICIAL,2) end;
              3: BEGIN EFECTO2:=TRUE; DOScambia:=TRUE; CUENTAefect2:=0 END;
              4: BEGIN EFECTO2:=TRUE; CUENTAefect2:=0; SPEED2:=3 END;
              5: DISANG1:=TRUE;
              6: LASER1:=TRUE;
              7: BEGIN ESCUDO1:=TRUE; ESC1:=0 END
             end;
             Inc(puntos1,5); {GANA 5 PUNTOS}
             EscribirPuntaje(puntos1,2);
             BORRARPastilla(PILLX,PILLY);
             PILLEFECT:=0;
             PILLX:=-10;
             PILLY:=-10
             END;
          PASTILLA(PILLX,PILLY,PILLEFECT)
         END;
  if (auxt=chr(72))OR(auxt=chr(80))OR(auxt=chr(75))OR(auxt=chr(77))OR(auxt='8')OR(auxt='2')OR(auxt='4')OR(auxt='6')
     then t1:=auxt;
  IF UNOJUEGA THEN
  case auxt of
     chr(72),'8': if y<21 then y:=20 else y:=y-2-SPEED1;
     chr(80),'2': if y>470 then y:=471 else y:=y+2+SPEED1;
     chr(75),'4': if x<12 then x:=11 else x:=x-2-SPEED1;
     chr(77),'6': if x>383 then x:=388 else x:=x+2+SPEED1;
     ' ': begin
           cantidadbalas:=cantidadbalas+1;
           if cantidadbalas = (1+cantdisp) then cantidadbalas:=1;
          if (DISANG)AND(((IZQUIERDA=-10)AND(DERECHA=-10))OR(ARRIBA=-10)) then
            begin  {por el disparo para los costados}
             BORRARdispang(ARRIBA,DERECHA,IZQUIERDA);
             DERECHA:=x;
             IZQUIERDA:=x;
             ARRIBA:=y
            end;
           disparo[cantidadbalas]:=true;
           auxY[cantidadbalas]:=y;
           auxX[cantidadbalas]:=x
          end
  end;
  IF AUXT=chr(59) THEN MOSTRARAyuda(AUXT,KEY);                         {AYUDA}
  if DOSJUEGA then
    begin
    if (auxt1='w')OR(auxt1='W')OR(auxt1='s')OR(auxt1='S')OR(auxt1='a')OR(auxt1='A')OR(auxt1='d')OR(auxt1='D')
       then t2:=auxt1;
    case auxt1 of
     'w','W': if y1<21 then y1:=20 else y1:=y1-2-SPEED2;
     's','S': if y1>470 then y1:=471 else y1:=y1+2+SPEED2;
     'a','A': if x1<12 then x1:=11 else x1:=x1-2-SPEED2;
     'd','D': if x1>383 then x1:=388 else x1:=x1+2+SPEED2;
     chr(9): begin                                 {JUGADOR 2 DISPARA CON TAB}
              cantidadbalas1:=cantidadbalas1+1;
              if cantidadbalas1 = (1+cantdisp) then cantidadbalas1:=1;
          if (DISANG1)AND(((IZQUIERDA1=-10)AND(DERECHA1=-10))OR(ARRIBA1=-10)) then
               begin  {por el disparo para los costados}
                BORRARdispang(ARRIBA1,DERECHA1,IZQUIERDA1);
                DERECHA1:=x1;
                IZQUIERDA1:=x1;
                ARRIBA1:=y1
               end;
              disparo1[cantidadbalas1]:=true;
              auxY1[cantidadbalas1]:=y1;
              auxX1[cantidadbalas1]:=x1
             end
    end
    end;
  IF UNOJUEGA THEN
              BEGIN
              auxt:=t1;
              PutImage(x-10, y-20, P^, NormalPut); {DIBUJA LA NAVE}
              IF ESCUDO THEN BEGIN IF ESC=4 THEN SETCOLOR(10) ELSE SETCOLOR(12); ELLIPSE(X,Y-5,0,360,11,15) END
              END;
  if DOSJUEGA then begin
              auxt1:=t2;
              PutImage(x1-10, y1-20, Q^, ORPut);{AGREGA LA NAVExSI COINCIDEN}
              IF ESCUDO1 THEN BEGIN IF ESC1=4 THEN SETCOLOR(10) ELSE SETCOLOR(12); ELLIPSE(X1,Y1-5,0,360,11,15) END
              end;
{HAY UN DISPARO, A TOTAL=10 HAY 2, A 30, 3 Y A 40, 4}
  Case TOTAL of
       1: cantidadNAVES:=3;
      10: cantdisp:=2;
      20: cantidadNAVES:=4;
      30: begin cantidadNAVES:=5; cantdisp:=3 end;
      40: cantdisp:=4
  end;
{DISPARO PARA EL COSTADO (efecto 5)}
IF DISANG THEN
 BEGIN
 BORRARdispang(ARRIBA,DERECHA,IZQUIERDA);
  IF (DERECHA>389)or(DERECHA=-10) THEN DERECHA:=-10 ELSE DERECHA:=DERECHA+3;
  IF IZQUIERDA<6 THEN IZQUIERDA:=-10 ELSE IZQUIERDA:=IZQUIERDA-3;
  IF ARRIBA<4 THEN ARRIBA:=-10
   ELSE
   BEGIN
    ARRIBA:=ARRIBA-3;
    SETCOLOR(10); SETFILLSTYLE(1,10);
    IF (DERECHA<>-10) THEN BEGIN CIRCLE(DERECHA,ARRIBA,2); FLOODFILL(DERECHA,ARRIBA,10) END;
    IF (IZQUIERDA<>-10) THEN BEGIN CIRCLE(IZQUIERDA,ARRIBA,2); FLOODFILL(IZQUIERDA,ARRIBA,10) END
   END
 END;
IF DISANG1 THEN
 BEGIN
 BORRARdispang(ARRIBA1,DERECHA1,IZQUIERDA1);
  IF (DERECHA1>389)or(DERECHA1=-10) THEN DERECHA1:=-10 ELSE DERECHA1:=DERECHA1+3;
  IF IZQUIERDA1<6 THEN IZQUIERDA1:=-10 ELSE IZQUIERDA1:=IZQUIERDA1-3;
  IF ARRIBA1<4 THEN ARRIBA1:=-10
   ELSE
   BEGIN
    ARRIBA1:=ARRIBA1-3;
    SETCOLOR(10); SETFILLSTYLE(1,10);
    IF (DERECHA1<>-10) THEN BEGIN CIRCLE(DERECHA1,ARRIBA1,2); FLOODFILL(DERECHA1,ARRIBA1,10) END;
    IF (IZQUIERDA1<>-10) THEN BEGIN CIRCLE(IZQUIERDA1,ARRIBA1,2); FLOODFILL(IZQUIERDA1,ARRIBA1,10) END
   END
 END;
{FIN disparo}
  if not final then
  for e:=1 to cantidadNAVES do
  begin
   {BALAS SACAN ENERG÷A}
   if estado[e]=true then
   BEGIN
    IF UNOJUEGA THEN
    if ( ((cd[e]>x-13)AND(cd[e]<x+13)) AND ((fd[e]>y-20)AND(fd[e]<y+5)) ) then
      begin
      estado[e]:=false;
      DesDisparaEnemigo(e,cd,fd);
      IF ESCUDO THEN
      BEGIN Inc(ESC); IF ESC=5 THEN BEGIN BORRARJUGADOR(X,Y,TRUE); ESC:=0; ESCUDO:=FALSE END END
      ELSE
      BEGIN
      Dec(energia);
      MostrarEnergia(energia,energiaINICIAL,1);
      IF NPANT=3 THEN BEGIN BORRARJUGADOR(x,y,TRUE); IF Y<450 THEN Inc(Y,30) END;
      if energia=0 then
                 begin
                  QuitarVida(a,energia,vidas,x,y,energiaINICIAL,1,DOS);
                  BorrarJugador(x,y,ESCUDO);
{---////////----} borrarDISPLASER(cantdisp,disparo,auxY,auxX,TRUE);
                  if vidas=0 then
                       begin {MUESTRA AL CUADRO SI EL 2 NO JUEGA +}
                       UNOJUEGA:=false;
                       IF (NOT DOSJUEGA) THEN VERCUADRO:=TRUE
                       end
                 end
      end
      END;

    IF DOSJUEGA THEN
    if ( ((cd[e]>x1-13)AND(cd[e]<x1+13)) AND ((fd[e]>y1-20)AND(fd[e]<y1+5)) ) then
      begin
      estado[e]:=false;
      DesDisparaEnemigo(e,cd,fd);
      IF ESCUDO1 THEN
       BEGIN Inc(ESC1); IF ESC1=5 THEN BEGIN BORRARJUGADOR(X1,Y1,TRUE); ESC1:=0; ESCUDO1:=FALSE END END
      ELSE
       BEGIN
       Dec(energia1);
       MostrarEnergia(energia1,energiaINICIAL,2);
       IF NPANT=3 THEN BEGIN BORRARJUGADOR(x1,y1,TRUE); IF Y1<455 THEN Inc(Y1,15) END;
      if energia1=0 then
                 begin
                  QuitarVida(a,energia1,vidas1,x1,y1,energiaINICIAL,2,DOS);
                  BorrarJugador(x1,y1,ESCUDO1);
{---////////----} borrarDISPLASER(cantdisp,disparo1,auxY1,auxX1,TRUE);
                  if vidas1=0 then
                       begin {MUESTRA AL CUADRO SI EL 1 NO JUEGA +}
                       DOSJUEGA:=false;
                       IF (NOT UNOJUEGA) THEN VERCUADRO:=TRUE
                       end
                 end
       end
     END
  END;
   {CHOCAR MATA AL JUGADOR 1}
   IF UNOJUEGA THEN
   if (((x-10)<(c[e]+15))AND((x+10)>(c[e]-15)))AND(((y+5)>(f[e]-5))AND((y-20)<(f[e]+40))) then
      begin
      BorrarEnemigo(c,f);
      Inc(choques);Inc(matados);Inc(total); Inc(puntos); {SI CHOCA GANA 1 PUNTO}
      EscribirPuntaje(puntos,1);
      f[e]:=-100;
      c[e]:=random(380);
      CASE NPANT OF
       1: DibujarEnemigo(c,f,N);
       2: DibujarEnemigo(c,f,M);
       3: DibujarEnemigo(c,f,L)
      END;
      QuitarVida(a,energia,vidas,x,y,energiaINICIAL,1,DOS)
      end;
   {CHOCAR MATA AL JUGADOR 2}
   IF DOSJUEGA THEN
   if (((x1-10)<(c[e]+15))AND((x1+10)>(c[e]-15)))AND(((y1+5)>(f[e]-5))AND((y1-20)<(f[e]+40))) then
      begin
      BorrarEnemigo(c,f);
      Inc(choques1);
      Inc(matados1);
      Inc(total);
      Inc(puntos1,1);                                  {SI CHOCA GANA 1 PUNTO}
      EscribirPuntaje(puntos1,2);
      f[e]:=-100;
      c[e]:=random(380);
      CASE NPANT OF
       1: DibujarEnemigo(c,f,N);
       2: DibujarEnemigo(c,f,M);
       3: DibujarEnemigo(c,f,L)
      END;
      QuitarVida(a,energia1,vidas1,x1,y1,energiaINICIAL,2,DOS)
      end
  end;{END DEL PARA}
  if UNOJUEGA then
     For d:=1 to cantdisp do
  if (disparo[d]) and not(auxY[d]<6) then                 {DIBUJAR EL DISPARO}
           begin
            auxY[d]:=auxY[d]-5;
            SetColor(15);
            Disparar(auxX[d],auxY[d],LASER)
           end;
  if DOSJUEGA then                              {DIBUJAR EL DISPARO JUGADOR 2}
     For d:=1 to cantdisp do
     if (disparo1[d]) and not(auxY1[d]<6) then
           begin
            auxY1[d]:=auxY1[d]-5;
            SetColor(12);
            Disparar(auxX1[d],auxY1[d],LASER1)
           end;
  if t=chr(27) then
             begin
              tipear('Seguro Desea Salir?',400,10,10,12,1);
              t:='-';
              while (t<>'s')AND(t<>'S')AND(t<>chr(27))AND(t<>'n')AND(t<>'N')AND(t<>' ') do t:=readkey;
              SetColor(1);
              outtextxy(405,10,'€€€€€€€€€€€€€€€€€€€€');
              if (t='s')or(t='S')or(t=chr(27)) then goto 1;
             end;
  delay(velocidad);
{DURACION EFECTO}
     IF EFECTO1 THEN
      BEGIN
       IF CUENTAefect1=0 THEN BEGIN SETCOLOR(11); RECTANGLE(414,129,516,133) END;
       Inc(CUENTAefect1);
       SETFILLSTYLE(1,1);BAR(415,130,515,132);
       IF CUENTAefect1<>800 THEN
          BEGIN SETFILLSTYLE(1,12);BAR(415,130,515-(CUENTAefect1 DIV 8),132) END
          ELSE
          BEGIN
           SETFILLSTYLE(1,1); BAR(414,129,516,133);
           CUENTAefect1:=0; EFECTO1:=FALSE;
           IF UNOcambia THEN UNOcambia:=FALSE;
           IF SPEED1=3 THEN SPEED1:=0
          END;
      END;
     IF EFECTO2 THEN
      BEGIN
       IF CUENTAefect2=0 THEN BEGIN SETCOLOR(11); RECTANGLE(414,439,516,443) END;
       Inc(CUENTAefect2);
       SETFILLSTYLE(1,1);BAR(415,440,515,442);
       IF CUENTAefect2<>800 THEN
          BEGIN SETFILLSTYLE(1,12);BAR(415,440,515-(CUENTAefect2 DIV 8),442) END
          ELSE
          BEGIN
           SETFILLSTYLE(1,1); BAR(414,439,516,443);
           CUENTAefect2:=0; EFECTO2:=FALSE;
           IF DOSCAMBIA THEN DOScambia:=FALSE;
           IF SPEED2=3 THEN SPEED2:=0
          END;
      END;
  if keypressed then begin t:=readkey;
{CAMBIO DE CONTROLES POR PASTILLA}
   IF UNOcambia THEN
       CASE t OF
        chr(72),'8': t:=chr(80);
        chr(80),'2': t:=chr(72);
        chr(75),'4': t:=chr(77);
        chr(77),'6': t:=chr(75)
       END;
   IF DOScambia THEN
       CASE t OF
        'w','W': t:='S';
        's','S': t:='W';
        'a','A': t:='D';
        'd','D': t:='A'
       END;
{HASTA ACµ}
   if (t=' ')OR(t=chr(72))OR(t=chr(80))OR(t=chr(75))OR(t=chr(77))OR(t='8')OR(t='2')OR(t='4')OR(t='6')OR(t=chr(27))OR(t=chr(59))
   then auxt:=t;
if DOSJUEGA then
   if (t=chr(9))OR(t='w')OR(t='W')OR(t='s')OR(t='S')OR(t='a')OR(t='A')OR(t='d')OR(t='D')
   then auxt1:=t
                     end;
{MUESTRA CUADRO DE EFICIENCIA}
CUADRO(UNOJUEGA,DOSJUEGA,VERCUADRO,SALIR,CALCEFI1,CALCEFI2,DOS, NPANT,PILLefect,PILLX,PILLY,matados,choques,total,
matados1,choques1,eficiencia,eficiencia1)
end;

FINAL:=FALSE;
UNOJUEGA:=TRUE;
IF DOS THEN DOSJUEGA:=TRUE ELSE DOSJUEGA:=FALSE;
GRABARranking(puntos,puntos1,archivo);
SALIR:=FALSE;
a:=0;
Goto 1;
CloseGraph;
end.
 /--------------------------------------------------------------------------\
-////////////////    Lucas Capalbo Lavezzo Producciones.     ////////////////-
-//////////////// humorweb@yahoo.com  lucasc@humorweb.com.ar ////////////////-
-////////////////     Pergamino, Buenos Aires, Argentina     ////////////////-
-////////////////             Diciembre De 2K                ////////////////-
 \--------------------------------------------------------------------------/