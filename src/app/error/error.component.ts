import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ApiError } from 'interfaces/vpi-interface';
import { ErrorService } from 'services/error.service';

 @Component({
  selector: 'app-error',
  imports: [CommonModule ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})

export class ErrorComponent implements OnInit{
  private readonly errorService = inject(ErrorService);
  public error? : ApiError;

 public ngOnInit(): void {
    this.error = this.errorService.get();
  }

}
