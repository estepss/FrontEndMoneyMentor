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
import {catchError, EMPTY, of, switchMap, tap} from 'rxjs';
import {AsesorService} from '../services/asesor-service';
import {Credenciales} from '../model/credenciales';
import {ResponeDto} from '../model/respone-dto';
import {LoginService} from '../services/login-service';

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
  private loginService = inject(LoginService);


  isSignUpMode = false; // muestra primero Registro
  toggleSignUp() { this.isSignUpMode = true; }
  toggleSignIn() { this.isSignUpMode = false; }


  // Form de LOGIN (placeholder)
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });


  // Form de REGISTRO
  accesoForm: FormGroup = this.fb.group({
    idPerfil: [''],
    nombres: ['', Validators.required],
    dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['999999999'],
    sobreMi: [''],
    rol: ['', Validators.required], // 'CLIENTE' | 'ASESOR'
    idUser: ['']
  });

  // === REGISTRO ===
  private backendError: any;
  onSubmit() {
    this.backendError  = null;
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
      error: (err) => {
        console.log('ERROR BACKEND COMPLETO:', err);

        // HttpErrorResponse típico de Angular:
        // - err.status -> 409
        // - err.error  -> lo que devolvió Spring (objeto o string)
        let msg = 'Ocurrió un error inesperado.';

        if (err.status === 0) {
          msg = 'No se pudo conectar con el servidor.';
        } else if (typeof err.error === 'string') {
          // por si el back devolviera texto plano
          msg = err.error;
        } else if (err.error?.message) {
          // lo que mandamos desde el handler
          msg = err.error.message; //  Aquí debe venir: "El DNI ya se encuentra registrado."
        }

        this.backendError = msg;
        alert(msg); // para que veas el mensaje sí o sí mientras pruebas
      }
    });
  }

  ngOnInit() {
    if(localStorage.getItem('token')!=null){
      localStorage.clear();//borra todos los items
      console.log("Token y items eliminados");
    }
    this.loadForm()
  }

  loadForm(): void {
    console.log("Form");
  }


  onLogin() {
    if (this.loginForm.invalid) {
      alert('Formulario no válido');
      return;
    }

    // Construye tu DTO como usas normalmente
    const requestDto: Credenciales = new Credenciales();

    // el Service mapeará email -> username, así no rompes tu modelo
    requestDto.email = this.loginForm.value.email;
    requestDto.password = this.loginForm.value.password;

    let responseDTO: ResponeDto = new ResponeDto();

    this.loginService.login(requestDto).subscribe({

      next: (data: ResponeDto) => {
        console.log("Login response ROLs:", data.roles);
        console.log("Login response ROL:", data.roles[0]);
        localStorage.setItem('rol', data.roles[0]);
        localStorage.setItem('rol', data.roles[0]); // si lo usas aún

        if (data.roles[0] === 'ROLE_CLIENTE') {
          this.clienteService.obtenerclienteporEmail(requestDto.email).subscribe({
            next: (cli: any) => {
              localStorage.setItem('idCliente', String(cli.idCliente));
              localStorage.setItem('userId', String(data.userId));
              console.log('Cliente logeado ->', cli);
              localStorage.setItem('email', cli.email);
              alert('¡Login correcto!');
              this.router.navigate(['/Inicio']);
            },
            error: (err) => {
              console.error('Error al obtener cliente:', err);
              alert('No se pudo obtener cliente');
            }
          });

        } else if (data.roles[0] === 'ROLE_ASESOR') {
          this.asesorService.obtenerAsesorPorEmail(requestDto.email).subscribe({
            next: (ase: any) => {
              localStorage.setItem('idAsesor', String(ase.idAsesor));
              localStorage.setItem('userId', String(data.userId));
              console.log('Asesor logeado ->', ase);
              localStorage.setItem('email', ase.email);
              alert('¡Login correcto!');
              this.router.navigate(['/InicioAsesor']);
            },
            error: (err) => {
              console.error('Error al obtener asesor:', err);
              alert('No se pudo obtener asesor');
            }
          });
        }
        else {
          console.warn('Rol desconocido o vacío');
          this.router.navigate(['/Landing']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        alert(error?.error?.message ?? 'Error en login');
        this.router.navigate(['/Landing']);
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
