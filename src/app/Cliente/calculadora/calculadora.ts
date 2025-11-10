import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CalculadoraService} from '../../services/calculadora-service';


interface CalculoResultado {
  capitalCuota: number;
  interesCuota: number;
  cuota: number;
  capitalTotal: number;
  interesTotal: number;
  total: number;
}

@Component({
  selector: 'app-calculadora',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css'

})
export class Calculadora {
  calcForm: FormGroup; //representa ujn grupo de formularios el formgroup

  private fb: FormBuilder = inject(FormBuilder); //como es private solo se usa aqui

  private calculadoraService = inject(CalculadoraService) //inyecto el servicio

  resultados: Partial<CalculoResultado> = {}; // ✅ seguro para el template con "?."

  constructor()
  {
    this.calcForm = this.fb.group({
      //aquí es lo que ingresará
      monto:['', Validators.required], //el 0 es la inicializacion
      cuotas: ['', Validators.required],
      tasa: ['', Validators.required],
    });
  }

  //el calculo
  enviarDatos() {
    if (this.calcForm.invalid) return;

    const monto = Number(this.calcForm.value.monto);
    const cuotas = Number(this.calcForm.value.cuotas);
    const tasa = Number(this.calcForm.value.tasa);

    this.calculadoraService.calculo(monto, cuotas, tasa).subscribe({
      next: (res: CalculoResultado) => {
        console.log('Respuesta del backend:', res);
        this.resultados = res; // mostrarás los resultados en tu HTML
      },
      error: (err) => {
        console.error('Error al calcular:', err);
      }
    });
  }

}
