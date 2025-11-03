import { Routes } from '@angular/router';
import {Inicio} from './inicio/inicio';
import {Calculadora} from './calculadora/calculadora';
import {Analisis} from './analisis/analisis';
import {Gestion} from './gestion/gestion';
import {Asesor} from './asesor/asesor';
import {Chat} from './chat/chat';
import {Perfil} from './perfil/perfil';
// 1. IMPORTACIÓN NUEVA: Importamos el nuevo componente Tarjeta
import {Tarjeta} from './tarjeta/tarjeta';

export const routes: Routes = [
  {path: '', component: Inicio},
  {path: 'Calculadora', component: Calculadora},
  {path: 'Análisis', component: Analisis},
  {path: 'Gestión', component: Gestion},
  {path: 'Asesor', component: Asesor},
  {path: 'Chat', component: Chat},
  {path: 'Perfil', component: Perfil},
  // 2. RUTA NUEVA: Agregamos la ruta para Tarjeta
  {path: 'Tarjeta', component: Tarjeta},
  {path: '**', redirectTo: ''},
];
