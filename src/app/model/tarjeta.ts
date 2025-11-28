export class Tarjeta {
  idTarjeta: number;
  nombreTarjeta: string;
  numeroTarjeta: string;
  mesExpiracion: number;
  anioExpiracion: number;
  cvc: string;


  idCliente: number;

  constructor() {
    this.nombreTarjeta = '';
    this.numeroTarjeta = '';
    this.mesExpiracion = 0;
    this.anioExpiracion = 0;
    this.cvc = '';
    this.idCliente = 0;
  }
}
