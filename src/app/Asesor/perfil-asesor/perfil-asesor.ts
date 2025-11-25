import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {Perfil} from '../../model/perfil';
import {PerfilService} from '../../services/perfil-service';

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
    nombres: [''],
    telefono: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    sobreMi: ['', Validators.required]
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
          nombres:    p.nombres?? '',
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
    const { nombres, telefono, sobreMi, password } = this.perfilForm.getRawValue();
    const dto: any = {
      ...(nombres    ? { nombres: nombres.trim() }       : {}),
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
  obtenerAvatar(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ffffff&color=179bae&bold=true`;
  }
}

