import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";

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
  public nombre: string = '';
  public rol: string = '';

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
}
