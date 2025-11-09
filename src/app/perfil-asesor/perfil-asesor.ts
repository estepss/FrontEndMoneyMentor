import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {Perfil} from '../model/perfil';
import {PerfilService} from '../services/perfil-service';

@Component({
  selector: 'app-perfil-asesor',
    imports: [
        MatButton,
        ReactiveFormsModule
    ],
  templateUrl: './perfil-asesor.html',
  styleUrl: './perfil-asesor.css'
})
export class PerfilAsesor {
  //router = inject(Router);
  perfil!: Perfil;
  cargando = true;
  fb = inject(FormBuilder);
  perfilService = inject(PerfilService);
  perfilForm = this.fb.group({
    email: [''],
    telefono: [''],
    password: [''],
    sobreMi: [''],
  });

  ngOnInit(): void {
    const raw = localStorage.getItem('userId');
    const userId = raw ? Number(raw) : NaN;
    console.log('userId leído =', raw, userId);

    if (Number.isNaN(userId)) {
      this.cargando = false;
      this.perfilForm.disable();
      alert('No hay usuario en sesión.');
      return;
    }

    this.perfilService.listId(userId).subscribe({
      next: (p) => {
        this.perfil = p;
        this.perfilForm.patchValue({
          email:    p.email ?? '',
          telefono: p.telefono ?? '',
          sobreMi:  p.sobreMi ?? '',
          password:  p.password ?? '',
        });
        this.cargando = false;
      },
      error: (e) => {
        console.error('GET perfil error', e); // mira si es 401 o 404
        this.cargando = false;
        this.perfilForm.disable();
        alert('No se pudo cargar tu perfil.');
      }
    });
  }

  onSubmit() {
    // 1) valida form
    if (this.perfilForm.invalid) return;

    // 2) userId válido
    const raw = localStorage.getItem('userId');
    const userId = raw ? Number(raw) : NaN;
    if (Number.isNaN(userId)) {
      alert('No hay usuario en sesión');
      return;
    }

    // 3) arma el DTO que tu back espera (NO envíes Perfil completo)
    const { email, telefono, sobreMi, password } = this.perfilForm.getRawValue();
    const dto: any = {
      ...(email    ? { email: email.trim() }       : {}),
      ...(telefono ? { telefono: telefono.trim() } : {}),
      ...(sobreMi  ? { sobreMi: sobreMi.trim() }   : {}),
      ...(password ? { password: password.trim() }                  : {}) // solo si la cambiaste
    };

    // 4) PUT /actualizar/{userId}
    this.perfilService.update(userId, dto).subscribe({
      next: (res: any) => {
        // si el back devuelve 200 con JSON úsalo; si da 204 usa dto
        const updated = res ?? { ...this.perfil, ...dto };
        this.perfil = updated as any;                   // refresca la card izquierda
        this.perfilForm.get('password')?.reset();      // limpia password
        this.perfilForm.markAsPristine();
        alert('Perfil actualizado');
      },
      error: (e) => {
        console.error('PUT actualizar error', e);
        alert('No se pudo actualizar');
      }
    });
  }
}

