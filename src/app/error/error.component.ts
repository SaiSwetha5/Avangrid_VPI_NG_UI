import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiError } from 'interfaces/vpi-interface';
import { ErrorService } from 'services/error.service';

 @Component({
  selector: 'app-error',
  imports: [CommonModule ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})

 export class ErrorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);  
  public error?: ApiError;

  ngOnInit() {
     const nav = this.router.getCurrentNavigation();
    this.error = nav?.extras?.state?.['error'];

     if (!this.error) {
      this.error = this.errorService.get();
    }
  }
}
