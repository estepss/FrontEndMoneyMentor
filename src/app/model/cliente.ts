import {Perfil} from './perfil';

export class Cliente {
  idCliente:number;
  dni : string;
  nombre: string;
  password: string;
  email: string;
  telefono: string;
  sobreMi: string;
  idPerfil: Perfil;
}
