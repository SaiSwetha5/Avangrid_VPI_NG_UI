import { Component, inject, OnInit } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { DataService } from 'services/data.service';
import { NgForm, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';

interface OPCODES {
  name: string;
  code: string;
}

@Component({
  selector: 'app-vpi-slider',
  imports: [ToastModule, RouterModule, FormsModule, DatePickerModule, ReactiveFormsModule, CardModule, SelectModule, DatePickerModule, CommonModule, ButtonModule, DrawerModule],
  templateUrl: './vpi-slider.component.html',
  styleUrl: './vpi-slider.component.scss',
  standalone: true,
  providers: [DatePipe]
})


export class VpiSliderComponent implements OnInit {
  public dateRangeError = false;
  public toDateError = false;
  public fromDateError = false;
  public opCodes: OPCODES[] | undefined;
  public opCode: { name: string; code: string } | null = null;
  public pageNumber = 1;
  public fromDate: Date = new Date();
  public toDate: Date = new Date();
  public hourFormat = "24";
  public aniAliDigitsModel = '';
  public extensionNumberModel = '';
  public channelNumberModel = '';
  public fileNameModel = '';
  public objectIdModel = '';
  public activeTab = 'VPI';
  public visible = false;
  public currentUrl = '';
  public openDrawer = false;
  public nameModel = '';
  private datePipe = inject(DatePipe);
  private _dataService = inject(DataService);
  private router = inject(Router);

  public getFormattedDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  public ngOnInit(): void {
    this.opCodes = [
      { name: 'RGE', code: 'RGE' },
      { name: 'NYSEG', code: 'NYSEG' },
      { name: 'CMP', code: 'CMP' },
    ];
  }

  public resetFilters(ngForm: NgForm): void {
    ngForm.resetForm();
    this.fromDate = new Date();
    this.toDate = new Date();
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
  }

  public cancelFilters(ngForm: NgForm): void {
    ngForm.resetForm();
    this.openDrawer = false;
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
  }

  public applyDateFilters(ngForm: NgForm): void {
    this._dataService.setPayload({
      from_date: this.getFormattedDate(this.fromDate),
      to_date: this.getFormattedDate(this.toDate),
      opco: this.opCode?.code ? this.opCode.code : "",
      filters: {
        fileName: this.fileNameModel ? this.fileNameModel.split(',') : null,
        extensionNum: this.extensionNumberModel ? this.extensionNumberModel.split(',') : null,
        objectID: this.objectIdModel ? this.objectIdModel.split(',') : null,
        channelNum: this.channelNumberModel ? this.channelNumberModel.split(',') : null,
        aniAliDigits: this.aniAliDigitsModel ? this.aniAliDigitsModel.split(',') : null,
        name: this.nameModel ? this.nameModel.split(',') : null
      },
      pagination: {
        pageNumber: this.pageNumber,
        pageSize: 10,
      },
    });

    ngForm.resetForm();
    this.openDrawer = false;
    this.router.navigate(['/vpi']);
  }


  public validateToDate(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
    if (this.toDate) {
      const toDateOnly = new Date(this.toDate);
      toDateOnly.setHours(0, 0, 0, 0);
      this.toDateError = toDateOnly > today;
    }
    if (this.fromDate) {
      const fromDateOnly = new Date(this.fromDate);
      fromDateOnly.setHours(0, 0, 0, 0);
      this.fromDateError = fromDateOnly > today;
    }

    if (this.fromDate && this.toDate) {
      const fromDateOnly = new Date(this.fromDate);
      const toDateOnly = new Date(this.toDate);
      fromDateOnly.setHours(0, 0, 0, 0);
      toDateOnly.setHours(0, 0, 0, 0);
      this.dateRangeError = fromDateOnly > toDateOnly;
    }
  }

  public openDrawerFunction(ngForm: NgForm): void {
    this.openDrawer = true;
    ngForm.resetForm();
    this.fromDate = new Date();
    this.toDate = new Date();
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
  }
}
