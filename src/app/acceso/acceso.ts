import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';
type Role = 'asesor' | 'cliente';

@Component({
  selector: 'app-acceso',
  imports: [
    FormsModule,
    NgClass
  ],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css'
})
export class Acceso {
  isSignUpMode = false;

  login = { username: '', password: '' };

  register: {
    name: string;
    dni: string;
    role: Role | '';
    email: string;
    password: string;
    username: string; // puedes usar email como username si prefieres
  } = {
    name: '',
    dni: '',
    role: '',
    email: '',
    password: '',
    username: ''
  };

  constructor(private router: Router) {}

  toggleSignUp() { this.isSignUpMode = true; }
  toggleSignIn() { this.isSignUpMode = false; }

  onSignInSubmit() {
    console.log('role ngModel ->', this.register.role);
    const { username, password } = this.login;
    if (!username.trim() || !password.trim()) {
      alert('Completa usuario y contraseña.');
      return;
    }
    const stored = localStorage.getItem(username.trim());
    if (!stored) { alert('Usuario no encontrado. Por favor, regístrate.'); return; }
    const data = JSON.parse(stored) as { password: string };
    if (data.password !== password) { alert('Contraseña incorrecta.'); return; }

    localStorage.setItem('currentUser', username.trim());
    this.router.navigate(['/Inicio']); // ajusta la ruta si es distinta
  }

  onSignUpSubmit() {
    const r = this.register;
    // validaciones simples
    if (!r.name.trim() || !r.dni.trim() || !r.role || !r.email.trim() || !r.password) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (!/^\d{8}$/.test(r.dni.trim())) { // ajusta si tu DNI no es 8 dígitos
      alert('DNI inválido.');
      return;
    }
    // define el "username" (puedes usar email si prefieres)
    r.username = r.email.trim().toLowerCase();

    if (localStorage.getItem(r.username)) {
      alert('Este usuario ya está registrado. Intenta iniciar sesión.');
      return;
    }

    localStorage.setItem(
      r.username,
      JSON.stringify({
        name: r.name.trim(),
        dni: r.dni.trim(),
        role: r.role,
        email: r.email.trim().toLowerCase(),
        password: r.password
      })
    );

    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    this.register = { name: '', dni: '', role: '', email: '', password: '', username: '' };
    this.isSignUpMode = false;
  }
}

