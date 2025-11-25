import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CalculadoraService} from '../../services/calculadora-service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

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
  styleUrl: './calculadora.css',
  animations: [
    // Fade + slide de toda la página
    trigger('pageFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
      ]
    )]
})
export class Calculadora {
  calcForm: FormGroup; //representa ujn grupo de formularios el formgroup

  private fb: FormBuilder = inject(FormBuilder); //como es private solo se usa aqui

  private calculadoraService = inject(CalculadoraService) //inyecto el servicio

  resultados: Partial<CalculoResultado> = {}; // seguro para el template con "?."

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
