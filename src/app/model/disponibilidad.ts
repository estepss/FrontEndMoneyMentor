  export class Disponibilidad {
    idDisponibilidad: number;
    fecha: string;       // Formato: "YYYY-MM-DD"
    horaInicio: string;  // Formato: "HH:mm" o "HH:mm:ss"
    horaFin: string;     // Formato: "HH:mm" o "HH:mm:ss"
    disponible: boolean;
    idAsesor: number;

    constructor() {
      this.fecha = '';
      this.horaInicio = '';
      this.horaFin = '';
      this.disponible = true;
      this.idAsesor = 0; // O el ID del asesor logueado
    }
}
