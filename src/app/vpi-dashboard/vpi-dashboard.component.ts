import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-vpi-dashboard',
  templateUrl: './vpi-dashboard.component.html',
  styleUrl: './vpi-dashboard.component.scss',
  standalone: true,
  imports: [ CardModule, CommonModule, ButtonModule]
})
export class VpiDashboardComponent {
 }
