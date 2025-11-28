import { Routes } from '@angular/router';
import {Inicio} from './Cliente/inicio/inicio';
import {Calculadora} from './Cliente/calculadora/calculadora';
import {Analisis} from './Cliente/analisis/analisis';
import {Gestion} from './Cliente/gestion/gestion';
import {AsesorComponent} from './Cliente/asesor/asesor';
import {ChatComponent} from './Cliente/chat/chat';
import {TarjetaComponent} from './Cliente/tarjeta/tarjeta';
import {Landing} from './landing/landing';
import {Acceso} from './acceso/acceso';
import {MainLayout} from './Cliente/main-layout/main-layout';
import {PerfilComponent} from './Cliente/perfil/perfil';
import {LayoutAsesor} from './Asesor/layout-asesor/layout-asesor';
import {InicioAsesor} from './Asesor/inicio-asesor/inicio-asesor';
import {ChatAsesor} from './Asesor/chat-asesor/chat-asesor';
import {PerfilAsesor} from './Asesor/perfil-asesor/perfil-asesor';
import {Clientes} from './Asesor/clientes/clientes';
import {CalendarioAsesorComponent} from './Asesor/calendario-asesor/calendario-asesor';
import {ChatDetalleComponent} from './Cliente/chat/chat-detalle';
import {ChatAsesorDetalle} from './Asesor/chat-asesor/chat-asesor-detalle';
import {ChatIa} from './Cliente/chat-ia/chat-ia';
import {NoticiasFinancieras} from './Cliente/noticias-financieras/noticias-financieras';

export const routes: Routes = [
  //Landing
  {path: '', component: Landing},
  {path: 'Acceso', component: Acceso},

  {
    path: '',
    component: MainLayout, // layout con barra
    children: [
      // ejemplo de rutas o sea< direccionamiento a otras "pantallas"
      {path: 'Inicio', component: Inicio}, // primera pagina que se mostrará
      {path: 'Calculadora', component: Calculadora}, //en esta en el path si se pone algo porque nos re dirigirá
      {path: 'Análisis', component: Analisis}, // lo mismo que con about
      {path: 'Gestión', component: Gestion},
      {path: 'Asesor', component:  AsesorComponent},
      {path: 'Chat', component: ChatComponent},
      { path: 'Chat/Detalle/:id', component: ChatDetalleComponent },
      {path: 'Perfil', component: PerfilComponent},
      {path: 'Tarjeta', component: TarjetaComponent},
      {path: 'ChatIA', component: ChatIa},
      {path: 'Noticias', component: NoticiasFinancieras},
    ],
  },
  {
    path: '',
    component: LayoutAsesor,
    children: [
      { path: 'InicioAsesor', component: InicioAsesor },
      { path: 'Clientes', component: Clientes },
      { path: 'ChatAsesor', component: ChatAsesor },
      { path: 'ChatAsesor/Detalle/:id', component: ChatAsesorDetalle },
      { path: 'CalendarioAsesor', component: CalendarioAsesorComponent },
      { path: 'PerfilAsesor', component: PerfilAsesor },
    ],
  },
  {path: '**', redirectTo: ''}, //re dirige a home

];

