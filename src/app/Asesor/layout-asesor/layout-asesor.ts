import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {Perfil} from '../../model/perfil';
import {PerfilService} from '../../services/perfil-service';
import {AsesorService} from '../../services/asesor-service';

@Component({
  selector: 'app-layout-asesor',
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './layout-asesor.html',
  styleUrl: './layout-asesor.css'
})
export class LayoutAsesor {
  public nombre: any;
  perfilService = inject(AsesorService);
  ngOnInit(): void {
    this.cargarUsuario();

    //escucha cambios en localStorage (desde otros componentes)
    window.addEventListener('storage', () => this.cargarUsuario());

    const email = localStorage.getItem('email');
    if (email) {
      this.perfilService.obtenerAsesorPorEmail(email).subscribe(p => {
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
  esAsesor(): boolean {
    let es = false;
    this.rol = localStorage.getItem('rol');
    if (this.rol === 'ROLE_ASESOR') es = true;
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
