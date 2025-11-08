import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { PerfilService } from '../services/perfil-service';
import { Perfil } from '../model/perfil';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import {ClienteService} from '../services/cliente-service';
import {of, switchMap, tap} from 'rxjs';
import {AsesorService} from '../services/asesor-service';

@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css'
})
export class Acceso {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private asesorService = inject(AsesorService);

  isSignUpMode = false; // muestra primero Registro
  toggleSignUp() { this.isSignUpMode = true; }
  toggleSignIn() { this.isSignUpMode = false; }
  // Form de LOGIN (placeholder)
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Form de REGISTRO
  accesoForm: FormGroup = this.fb.group({
    idPerfil: [''],
    nombres: ['', Validators.required],
    dni: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: [''],
    sobreMi: [''],
    rol: ['', Validators.required], // 'CLIENTE' | 'ASESOR'
    idUser: ['']
  });

  // === REGISTRO ===
  onSubmit() {
    if (this.accesoForm.invalid) return;

    const v = this.accesoForm.value;

    const perfil = new Perfil();
    // perfil.idPerfil = undefined;  // (opcional) explícito
    perfil.nombres  = v.nombres?.trim();
    perfil.dni      = v.dni?.trim();
    perfil.email    = v.email?.trim().toLowerCase();
    perfil.password = v.password;
    perfil.telefono = v.telefono?.trim() || null;
    perfil.sobreMi  = v.sobreMi?.trim() || null;
    perfil.rol      = String(v.rol).toUpperCase() as any; // 'CLIENTE' | 'ASESOR'

    this.perfilService.insert(perfil).subscribe({
      next: (data) => {
        console.log('Registrado:', data);
        alert('Registro exitoso');
        this.accesoForm.reset();
        this.toggleSignIn();
      },
      error: (e) => {
        console.error(e);
        alert(e?.error?.message ?? 'No se pudo registrar');
      }
    });
  }

  // === LOGIN ===
  onLogin() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.perfilService.auth({ username: email, password })
      .pipe(
        tap((res: any) => {
          localStorage.setItem('token', res.jwt);
        }),
        switchMap((res: any) => {
          // normaliza roles
          const roles: string[] = (res.roles ?? [])
            .map(String)
            .map((r: string) => r.toUpperCase().trim());
          const role = roles[0] ?? '';
          console.log('roles', roles, 'role elegido =>', role);

          localStorage.setItem('rol', role);

          if (role === 'ROLE_CLIENTE') {
            // CLIENTE
            return this.clienteService.obtenerclienteporEmail(email).pipe(
              tap((cli: any) => {
                localStorage.setItem('idCliente', String(cli.idCliente));
                localStorage.setItem('userId', String(res.userId));   // 👈 CLAVE CORRECTA
                console.log('userId guardado =', localStorage.getItem('userId'));

              })
            );
          } else if (role === 'ROLE_ASESOR') {
            // ASESOR
            return this.asesorService.obtenerAsesorPorEmail(email).pipe(
              tap((ase: any) => {
                localStorage.setItem('idAsesor', String(ase.idAsesor));
                localStorage.setItem('userId', String(res.userId));   // 👈 CLAVE CORRECTA
                console.log('userId guardado =', localStorage.getItem('userId'));
              })
            );
          }
          // rol desconocido → no hagas segunda llamada
          return of(null);
        })
      )
      .subscribe({
        next: () => this.router.navigate(['/Inicio']),
        error: (e) => {
          console.error('Login error:', e);
          alert(e?.error?.message ?? 'Error en login / carga de perfil');
        }
      });
  }

  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      this.isSignUpMode = mode === 'signup'; // signup → Registro / login → Iniciar Sesión
    });
  }
}
