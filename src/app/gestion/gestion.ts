import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {Analisis} from '../analisis/analisis';

@Component({
  selector: 'app-gestion',
  imports: [
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css'
})
export class Gestion {

  protected readonly Analisis = Analisis;
}
