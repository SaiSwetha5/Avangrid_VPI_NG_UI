import { Component, inject, OnInit} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { DataService } from 'services/data.service';
import { NgForm, ReactiveFormsModule,FormsModule } from '@angular/forms';
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
  public nameError = false;
  public fromDateError = false;
  public opCodes: OPCODES[] | undefined;
  public directions: { name: string; code: boolean }[] = [];
  public opCode: { name: string; code: string } | null = null;
  public selectedDirection: { name: string; code: string } | null = null;
  public pageNumber = 1;
  public fromDate: Date = new Date();
  public toDate: Date = new Date();
  public hourFormat = "24";
  public aniAliDigitsModel = '';
  public extensionNumberModel = '';
  public channelNumberModel : number | null = null;
  public agentIdModel = '';
  public objectIdModel = '';
  public activeTab = 'VPI';
  public visible = false;
  public currentUrl = '';
  public openDrawer = false;
  public nameModel = '';
  public validIDs : string[] = [];
  public invalidIDs : string[] = [];
  private readonly datePipe = inject(DatePipe);
  public readonly _dataService = inject(DataService);
  private readonly router = inject(Router);
  public dateRanges: Record<string, string> = {
  RGE: '02 Jun, 2014 - 23 Jun, 2022',
  NYSEG: '21 Oct, 2014 - 25 Oct, 2022',
  CMP: '12 Aug, 2014 - 18 May, 2022'
}; 

  public getFormattedDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  public ngOnInit(): void {
    this.opCodes = [
      { name: 'RGE', code: 'RGE' },
      { name: 'NYSEG', code: 'NYSEG' },
      { name: 'CMP', code: 'CMP' },
    ];
     
    this.directions = [{ name: 'Inbound', code: true }, { name: 'Outbound', code: false }];
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
    if (this.objectIdModel) {
    const ids = this.objectIdModel.split(',').map(x => x.trim());
      this.validIDs = ids.filter(id => this.isValidUUID(id));
      this.invalidIDs = ids.filter(id => !this.isValidUUID(id));
      if (this.invalidIDs.length > 0) {
      return;
    }
    }
   
    this._dataService.selectedOpcode.set(this.opCode?.code ? this.opCode.code : "");
    this._dataService.setPayload({
      from_date: this.getFormattedDate(this.fromDate),
      to_date: this.getFormattedDate(this.toDate),
      opco: this.opCode?.code ? this.opCode.code : "",
      filters: {
        name: this.nameModel ? this.nameModel.split(',') : null,
        extensionNum: this.extensionNumberModel ? this.extensionNumberModel.split(',') : null,
        objectIDs: this.validIDs.length > 0 ? this.validIDs : null,
        channelNum: this.channelNumberModel ? this.channelNumberModel.toString().split(',') : null,
        aniAliDigits: this.aniAliDigitsModel ? this.aniAliDigitsModel.split(',') : null,
        agentID: this.agentIdModel ? this.agentIdModel.split(',') : null,
        direction: this.selectedDirection?.name ? this.selectedDirection.name : null
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
 
public validateFromDate(): void {
  this.fromDateError = false;
  this.dateRangeError = false;

  if (!this.opCode?.code) {
    return;
  }

  const rangeString = this.dateRanges[this.opCode.code];
  if (rangeString) {
    const [startStr, endStr] = rangeString.split(' - ');
    const minAllowed = new Date(startStr);
    const maxAllowed = new Date(endStr);

    minAllowed.setHours(0, 0, 0, 0);
    maxAllowed.setHours(0, 0, 0, 0);

    if (this.fromDate) {
      const fromDateOnly = new Date(this.fromDate);
      fromDateOnly.setHours(0, 0, 0, 0);

      if (fromDateOnly < minAllowed || fromDateOnly > maxAllowed) {
        this.fromDateError = true;
      }
    }

     if (this.fromDate && this.toDate) {
      const fromDateOnly = new Date(this.fromDate);
      const toDateOnly = new Date(this.toDate);
      fromDateOnly.setHours(0, 0, 0, 0);
      toDateOnly.setHours(0, 0, 0, 0);

      if (fromDateOnly > toDateOnly) {
        this.dateRangeError = true;
      }
    }
  }
}

public validateToDate(): void {
  this.toDateError = false;
  this.dateRangeError = false;

  if (!this.opCode?.code) {
    return;
  }

  const rangeString = this.dateRanges[this.opCode.code];
  if (rangeString) {
    const [startStr, endStr] = rangeString.split(' - ');
    const minAllowed = new Date(startStr);
    const maxAllowed = new Date(endStr);

    minAllowed.setHours(0, 0, 0, 0);
    maxAllowed.setHours(0, 0, 0, 0);

    if (this.toDate) {
      const toDateOnly = new Date(this.toDate);
      toDateOnly.setHours(0, 0, 0, 0);

      if (toDateOnly < minAllowed || toDateOnly > maxAllowed) {
        this.toDateError = true;
      }
    }

     if (this.fromDate && this.toDate) {
      const fromDateOnly = new Date(this.fromDate);
      const toDateOnly = new Date(this.toDate);
      fromDateOnly.setHours(0, 0, 0, 0);
      toDateOnly.setHours(0, 0, 0, 0);

      if (fromDateOnly > toDateOnly) {
        this.dateRangeError = true;
      }
    }
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


  public isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

}
