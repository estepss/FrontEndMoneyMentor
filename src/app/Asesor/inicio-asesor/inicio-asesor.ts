import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-inicio-asesor',
  imports: [CommonModule, CommonModule, RouterLink],
  templateUrl: './inicio-asesor.html',
  styleUrl: './inicio-asesor.css',
  animations: [
    trigger('tileEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ])
  ]
})
export class InicioAsesor {

  protected readonly RouterLink = RouterLink;
}
