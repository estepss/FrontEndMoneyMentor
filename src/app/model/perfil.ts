import {Credenciales} from './credenciales';

export type Rol = 'CLIENTE' | 'ASESOR';

export class Perfil {
  idPerfil: number = 0;
  dni: string;
  nombres: string;
  email: string;
  password: string;
  telefono: string;
  sobreMi: string;
  rol: Rol;
  idUser: Credenciales;
}
