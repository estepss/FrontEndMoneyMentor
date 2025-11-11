import {Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import {AnalisisService} from '../../services/analisis-services';
@Component({
  selector: 'app-analisis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './analisis.html',
  styleUrls: ['./analisis.css']
})
export class Analisis{

  formTipo: FormGroup;
  formFecha: FormGroup;
  imgPorTipo: string | null = null;
  imgPorFecha: string | null = null;
  noDataTipo = false;
  noDataFecha = false;

  constructor(private fb: FormBuilder, private analisisService: AnalisisService) {
    this.formTipo = this.fb.group({tipo: ['', Validators.required]});
    this.formFecha = this.fb.group({fecha: ['', Validators.required]});
  }

  private toYMD(date: any): string {
    if (date instanceof Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return date;
  }

  mostrarPorTipo() {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      return;
    }

    const tipo = this.formTipo.value.tipo.toLowerCase();

    this.analisisService.obtenerGraficoPorTipo(tipo).subscribe({
      next: (res: any) => {
        if (res.status === 204) {
          this.noDataTipo = true;
          this.imgPorTipo = null;
          return;
        }

        this.noDataTipo = false;
        this.imgPorTipo = URL.createObjectURL(res.body as Blob);
      }
    });
  }

  mostrarPorFecha() {
    if (this.formFecha.invalid) {
      this.formFecha.markAllAsTouched();
      return;
    }

    const fecha = this.toYMD(this.formFecha.value.fecha);

    this.analisisService.obtenerGraficoPorFecha(fecha).subscribe({
      next: (res: any) => {
        if (res.status === 204) {
          this.noDataFecha = true;
          this.imgPorFecha = null;
          return;
        }

        this.noDataFecha = false;
        this.imgPorFecha = URL.createObjectURL(res.body as Blob);
      }
    });
  }

  tieneErrorTipo(): boolean {
    const control = this.formTipo.get('tipo');
    return !!(control && control.invalid && control.touched);
  }

  tieneErrorFecha(): boolean {
    const control = this.formFecha.get('fecha');
    return !!(control && control.invalid && control.touched);
  }

  descargarImagen(imagen: string | null) {
    if (!imagen) return;
    const link = document.createElement('a');
    link.href = imagen;
    link.download = 'reporte.png';
    link.click();
  }
}
