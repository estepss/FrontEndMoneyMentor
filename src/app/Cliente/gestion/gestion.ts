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
import {GestionService} from '../../services/gestion-service';
import {GestionFinanciera} from '../../model/gestion-financiera';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {Cliente} from '../../model/cliente';
import {interval, switchMap} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';

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
  styleUrl: './gestion.css',
  animations: [
    trigger('tileEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ])
  ]
})
export class Gestion {
  gestionForm: FormGroup;
  private fb = inject(FormBuilder);
  private gestionService = inject(GestionService);
  private router = inject(Router);
  Cliente : Cliente = new Cliente();
  //id
  constructor() {
    this.gestionForm = this.fb.group({
      idGestion: [''],
      titulo: ['', [Validators.required, Validators.maxLength(60)]],
      tipo: ['', Validators.required],                     // 'Ingreso' | 'Egreso'
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],                     // Date
    });
  }

  onSubmit() {
    if (!this.gestionForm.invalid) {
      const idCliente = Number(localStorage.getItem('idCliente'));//obtengo el numero
      const gestionFinanciera: GestionFinanciera = new GestionFinanciera();
      gestionFinanciera.idGestion = this.gestionForm.controls['idGestion'].value;
      gestionFinanciera.titulo = this.gestionForm.controls['titulo'].value;
      gestionFinanciera.tipo = this.gestionForm.controls['tipo'].value;
      gestionFinanciera.monto = this.gestionForm.controls['monto'].value;
      gestionFinanciera.fecha = this.gestionForm.controls['fecha'].value;
      gestionFinanciera.cliente = this.Cliente;
      //
      gestionFinanciera.cliente.idCliente = idCliente; //id
      console.log("Gestion enviado", gestionFinanciera);
      this.gestionService.insert(gestionFinanciera).subscribe({
        next: (data: any) => {
          console.log("Se registró", data);
          alert("Gestion registrada");
          this.router.navigate(['/Gestión']);
          this.cargarTabla()
        }
      })
    }
  }

  //lista
  listar: GestionFinanciera[];
  //nombre de columnas
  displayedColumns: string[] = ['idGestion', 'titulo', 'tipo','monto', 'fecha'];
  //proviene de la clase
  dataSource: MatTableDataSource<GestionFinanciera> = new MatTableDataSource<GestionFinanciera>();

  //cuando carga
  ngOnInit() {
    console.log('ngOnInit: actualizando tabla automáticamente');
    const idCliente = Number(localStorage.getItem('idCliente'));//obtengo el numero
    this.gestionService.listId(idCliente)
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataSource._updateChangeSubscription();
          console.log('Tabla actualizada automáticamente', data);
          this.router.navigate(['/Gestión'])
        },
        error: (err) => console.error('Error al refrescar', err)
      });
  }

  cargarTabla() {
    const idCliente = Number(localStorage.getItem('idCliente'));
    this.gestionService.listId(idCliente).subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => console.error('Error al refrescar tabla', err)
    });
  }
}
