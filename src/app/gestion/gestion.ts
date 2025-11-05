import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInput, MatInputModule} from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {MatNativeDateModule, MatOption} from '@angular/material/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatHint, MatFormField, MatLabel} from '@angular/material/form-field';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DatePipe} from '@angular/common';
import {GestionService} from '../services/gestion-service';
import {GestionFinanciera} from '../model/gestion-financiera';
import {MatSelect, MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-gestion',
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatFormField,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatButton,
    MatHint,//add
    MatInputModule,//add
    MatDatepickerModule, // add
    MatNativeDateModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    DatePipe,
    MatHeaderRow,
    MatRow,
    MatSort,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    RouterLink,
    MatSelectModule,
    MatSelect,
    MatOption,
    // add
  ],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css'
})
export class Gestion {
  gestionForm: FormGroup;
  private fb = inject(FormBuilder);
  private gestionService = inject(GestionService);
  private router = inject(Router);

  constructor() {
    this.gestionForm = this.fb.group({
      idGestion: [''],
      titulo: ['', [Validators.required, Validators.maxLength(60)]],
      tipo: ['', Validators.required],                     // 'Ingreso' | 'Egreso'
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],                     // Date
      idCliente:[1]
    });
  }

  onSubmit() {
    if (this.gestionForm.invalid) {

      this.gestionForm.markAllAsTouched();
      return;
    }

    const mov: GestionFinanciera = this.gestionForm.value;
    this.gestionService.insert(mov).subscribe({
      next: () => {
        // navega al listado o limpia el form, como prefieras
        this.router.navigate(['Gestión']); // ajusta ruta si tu listado es otra
        // this.gestionForm.reset(); // alternativa si te quedas en la misma vista
      },
      error: (e) => console.error('Error al registrar gestión:', e)
    });
  }

  //lista
  listar: GestionFinanciera[];
  //nombre de columnas
  displayedColumns: string[] = ['idGestion', 'titulo', 'tipo','monto', 'fecha'];
  //proviene de la clase
  dataSource: MatTableDataSource<GestionFinanciera> = new MatTableDataSource<GestionFinanciera>();

  //cuando carga
  ngOnInit() {
    console.log('Component ngOnInit llamando al API Get');
    this.gestionService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        console.log("API List trae:", data);
        this.dataSource._updateChangeSubscription();
      },
    })
  }


}
