import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Tarjeta } from '../../model/tarjeta';
import { TarjetaService } from '../../services/tarjeta-service';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css'
})
export class TarjetaComponent implements OnInit {

  private tarjetaService = inject(TarjetaService);
  private fb = inject(FormBuilder);

  tarjetasAgregadas: Tarjeta[] = [];
  vistaActual: 'agregar' | 'lista' = 'agregar';
  idClienteLogueado: number = 0;

  tarjetaForm: FormGroup;

  meses: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  anios: number[] = this.generarAniosExpiracion();
  mesesNombres: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };

  constructor() {
    this.tarjetaForm = this.initForm();
  }

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.idClienteLogueado = parseInt(storedId, 10);
      this.cargarTarjetas();
    }
  }

  // --- INICIALIZACIÓN DEL FORMULARIO ---
  initForm(): FormGroup {
    return this.fb.group({
      nombreTarjeta: ['', [Validators.required]],
      // CAMBIO: Usamos un validador personalizado en lugar del pattern estricto
      numeroTarjeta: ['', [Validators.required, this.validarNumeroTarjeta]],
      mesExpiracion: [new Date().getMonth() + 1, [Validators.required]],
      anioExpiracion: [new Date().getFullYear(), [Validators.required]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    }, { validators: this.fechaExpiracionValidator });
  }

  /**
   * Validador personalizado: Permite espacios, pero valida que haya 13-19 dígitos.
   */
  validarNumeroTarjeta(control: AbstractControl): ValidationErrors | null {
    const valor = control.value || '';
    // "Juntamos" los números quitando espacios para validar
    const sinEspacios = valor.replace(/\s/g, '');

    // Verificar que solo sean números
    if (!/^\d+$/.test(sinEspacios)) {
      return { pattern: true };
    }
    // Verificar longitud
    if (sinEspacios.length < 13 || sinEspacios.length > 19) {
      return { pattern: true };
    }
    return null; // Válido
  }

  /**
   * Validador de fecha de expiración
   */
  fechaExpiracionValidator(group: AbstractControl): ValidationErrors | null {
    const mes = group.get('mesExpiracion')?.value;
    const anio = group.get('anioExpiracion')?.value;
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;

    if (anio < anioActual || (anio == anioActual && mes < mesActual)) {
      return { fechaPasada: true };
    }
    return null;
  }

  // --- LÓGICA CRUD ---

  cargarTarjetas(): void {
    if (this.idClienteLogueado === 0) return;
    this.tarjetaService.listPorCliente(this.idClienteLogueado).subscribe({
      next: (tarjetas) => this.tarjetasAgregadas = tarjetas,
      error: (err) => console.error('Error al cargar tarjetas:', err)
    });
  }

  agregarTarjeta(): void {
    if (this.idClienteLogueado === 0) {
      alert('Error de sesión.');
      return;
    }

    if (this.tarjetaForm.invalid) {
      this.tarjetaForm.markAllAsTouched();
      return;
    }

    const formValue = this.tarjetaForm.value;
    const nuevaTarjeta: Tarjeta = new Tarjeta();

    nuevaTarjeta.nombreTarjeta = formValue.nombreTarjeta;
    // IMPORTANTE: Limpiamos los espacios antes de enviar al backend
    nuevaTarjeta.numeroTarjeta = formValue.numeroTarjeta.replace(/\s/g, '');
    nuevaTarjeta.mesExpiracion = Number(formValue.mesExpiracion);
    nuevaTarjeta.anioExpiracion = Number(formValue.anioExpiracion);
    nuevaTarjeta.cvc = formValue.cvc;
    nuevaTarjeta.idCliente = this.idClienteLogueado;

    this.tarjetaService.insert(nuevaTarjeta).subscribe({
      next: () => {
        alert('Tarjeta agregada correctamente');
        this.cargarTarjetas();
        this.vistaActual = 'lista';
        this.resetearFormulario();
      },
      error: (err) => alert('Error al guardar: ' + (err.error?.message || 'Intente nuevamente'))
    });
  }

  eliminarTarjeta(index: number): void {
    const tarjeta = this.tarjetasAgregadas[index];
    if (!tarjeta.idTarjeta) return;

    if(confirm('¿Eliminar esta tarjeta?')) {
      this.tarjetaService.delete(tarjeta.idTarjeta).subscribe({
        next: () => this.tarjetasAgregadas.splice(index, 1)
      });
    }
  }

  mostrarLista(): void {
    this.vistaActual = 'lista';
    this.cargarTarjetas();
  }

  mostrarAgregar(): void {
    this.vistaActual = 'agregar';
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.tarjetaForm.reset({
      nombreTarjeta: '',
      numeroTarjeta: '',
      mesExpiracion: new Date().getMonth() + 1,
      anioExpiracion: new Date().getFullYear(),
      cvc: ''
    });
  }

  getNombreMes(mes: number): string {
    return this.mesesNombres[mes] || mes.toString();
  }

  generarAniosExpiracion(): number[] {
    const actual = new Date().getFullYear();
    return Array.from({length: 6}, (_, i) => actual + i);
  }

  get f() { return this.tarjetaForm.controls; }
}
