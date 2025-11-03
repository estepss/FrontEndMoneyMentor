import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";

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
  public rol: string = '';

  ngOnInit(): void {
    // Obtenemos el usuario actual guardado en localStorage
    const currentUserKey = localStorage.getItem('currentUser');

    if (currentUserKey) {
      const stored = localStorage.getItem(currentUserKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Asignamos los valores
        this.nombre = data.name || '(Sin nombre)';
        this.rol = data.rol || '(Sin rol)';
      }
    }
  }
}
