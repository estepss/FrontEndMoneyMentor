import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";

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

  ngOnInit(): void {
    this.cargarUsuario();

    // 🔹 escucha cambios en localStorage (desde otros componentes)
    window.addEventListener('storage', () => this.cargarUsuario());
  }

  cargarUsuario() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const data = JSON.parse(stored);
      this.nombre = data.name || '(Sin nombre)';
      this.rol = data.rol || '(Sin rol)';
    } else {
      this.nombre = '(Invitado)';
      this.rol = '( rol)';
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

}
