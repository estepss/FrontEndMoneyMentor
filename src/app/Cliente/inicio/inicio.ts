import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-inicio',
  imports: [
    RouterLink

  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
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
export class Inicio {

}
