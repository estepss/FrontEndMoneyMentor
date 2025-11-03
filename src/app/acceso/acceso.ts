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
import {NgIf} from '@angular/common'; // <-- tu clase/Modelo

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
  ],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css'
})
export class Acceso {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private router = inject(Router);

  isSignUpMode = true; // muestra primero Registro
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
    rol: ['', Validators.required] // 'CLIENTE' | 'ASESOR'
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

  // === LOGIN FICTICIO (sin backend) ===
  onLogin() {
    if (this.loginForm.invalid) {
      alert('Por favor completa los campos correctamente');
      return;
    }

    const { email, password } = this.loginForm.value;

    // Ejemplo simple: validamos con valores fijos
    if (email === 'admin@gmail.com' && password === '123456') {
      alert('Inicio de sesión exitoso');
      localStorage.setItem('usuario', email!);
      this.router.navigate(['/Inicio']); // redirige a la página deseada
    } else {
      alert('Credenciales inválidas (usa admin@gmail.com / 123456)');
    }
  }

}
