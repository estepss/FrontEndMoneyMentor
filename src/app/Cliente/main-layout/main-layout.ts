import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {AsesorService} from '../../services/asesor-service';
import {ClienteService} from '../../services/cliente-service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  public nombre: string = '';
  //public rol: string = '';

  perfilService = inject(ClienteService);
  ngOnInit(): void {
    this.cargarUsuario();

    //escucha cambios en localStorage (desde otros componentes)
    window.addEventListener('storage', () => this.cargarUsuario());

    const email = localStorage.getItem('email');
    if (email) {
      this.perfilService.obtenerclienteporEmail(email).subscribe(p => {
        this.nombre = p.nombre;
      });
    }
  }

  cargarUsuario() {
    const stored = localStorage.getItem('currentUser');

    if (stored) {
      const data = JSON.parse(stored);
      this.nombre = data.nombre || '(Sin nombre)';
      this.rol = data.rol || '(Sin rol)';
    } else {
      this.nombre = '(Invitado)';
      this.rol = '(Rol)';
    }
  }

  router: Router = inject(Router);
  rol: any;
  esCliente(): boolean {
    let es = false;
    this.rol = localStorage.getItem('rol');
    if (this.rol === 'ROLE_CLIENTE') es = true;
    return es;
  }

  sidebarOpen = false;
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  obtenerAvatar(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ffffff&color=179bae&bold=true`;
  }
}
