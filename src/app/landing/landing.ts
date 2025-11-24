import {Component, HostListener} from '@angular/core';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-landing',
  imports: [
    RouterLink
  ],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class Landing {
  bgUrl = 'assets/img/fondo_landing.jpg';

  isMenuOpen = false;
  currentSectionId = '';

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // Cierra el menú y calcula la sección activa al hacer scroll/cargar
  @HostListener('window:scroll')
  @HostListener('window:load')
  onScrollOrLoad(): void {
    this.isMenuOpen = false;

    const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];
    const top = window.scrollY;

    for (const s of sections) {
      const offset = s.offsetTop - 200;
      const height = s.offsetHeight;
      if (top >= offset && top < offset + height) {
        this.currentSectionId = s.id;
        return;
      }
    }
    // Si no calza ninguna, resetea
    this.currentSectionId = '';
  }

}
