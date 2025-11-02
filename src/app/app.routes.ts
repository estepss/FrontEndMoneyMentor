import { Routes } from '@angular/router';
import {Inicio} from './inicio/inicio';
import {Calculadora} from './calculadora/calculadora';
import {Analisis} from './analisis/analisis';
import {Gestion} from './gestion/gestion';
import {Asesor} from './asesor/asesor';
import {Chat} from './chat/chat';
import {Perfil} from './perfil/perfil';

export const routes: Routes = [
// ejemplo de rutas o sea< direccionamiento a otras "pantallas"
  {path: '', component: Inicio}, // primera pagina que se mostrará
  {path: 'Calculadora', component: Calculadora}, //en esta en el path si se pone algo porque nos re dirigirá
  {path: 'Análisis', component: Analisis}, // lo mismo que con about
  {path: 'Gestión', component: Gestion},
  {path: 'Asesor', component: Asesor},
  {path: 'Chat', component: Chat},
  {path: 'Perfil', component: Perfil},
  {path: '**', redirectTo: ''}, //re dirige a home

];
