import { Component, inject} from '@angular/core';
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

const OPCODES: OPCODES[] = [
  { name: 'RGE',   code: 'RGE'   },
  { name: 'NYSEG', code: 'NYSEG' },
  { name: 'CMP',   code: 'CMP'   },
];

const DIRECTIONS: { name: string; code: boolean }[] = [
  { name: 'Inbound',  code: true  },
  { name: 'Outbound', code: false },
];

 const DATERANGES: Record<string, string> = {
  RGE: '02 Jun, 2014 - 23 Jun, 2022',
  NYSEG: '21 Oct, 2014 - 25 Oct, 2022',
  CMP: '12 Aug, 2014 - 18 May, 2022'
}; 
@Component({
  selector: 'app-vpi-slider',
  imports: [ToastModule, RouterModule, FormsModule, ReactiveFormsModule, CardModule, SelectModule, DatePickerModule, CommonModule, ButtonModule, DrawerModule],
  templateUrl: './vpi-slider.component.html',
  styleUrl: './vpi-slider.component.scss',
  standalone: true,
  providers: [DatePipe]
})

export class VpiSliderComponent  {
  public dateRangeError = false;
  public toDateError = false; 
  public fromDateError = false;
  public readonly opCodes    = OPCODES;
  public readonly directions = DIRECTIONS;
  public opCode: { name: string; code: string } | null = null;
  public selectedDirection: { name: string; code: string } | null = null;
  public pageNumber = 1;
  public fromDate: Date | null = null;
  public toDate:   Date | null = null;
  public hourFormat = "24";
  public aniAliDigitsModel = '';
  public extensionNumberModel = '';
  public channelNumberModel : number | null = null;
  public agentIdModel = '';
  public objectIdModel = '';
  public openDrawer = false;
  public nameModel = '';
  public validIDs : string[] = [];
  public invalidIDs : string[] = [];
  private readonly datePipe = inject(DatePipe);
  public readonly _dataService = inject(DataService);
  private readonly router = inject(Router);
  public dateRanges = DATERANGES
  public getFormattedDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') ?? '';
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

private isToday(date?: Date | string | null): boolean {
  if (!date) {
    return false;
  }
  const d = typeof date === 'string' ? new Date(date) : date;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cmp = new Date(d);
  cmp.setHours(0, 0, 0, 0);

  return cmp.getTime() === today.getTime();
}

  public applyDateFilters(ngForm: NgForm): void {
  
  const isFromToday = this.isToday(this.fromDate);
  const isToToday = this.isToday(this.toDate);
  if (isFromToday || isToToday) {
     this.fromDateError = isFromToday || this.fromDateError;
    this.toDateError = isToToday || this.toDateError;
     this.dateRangeError = true;
    return;
  }
  
const isRangeValid = this.validateRange();
  if (!isRangeValid) {
    return;
  }

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

private normalizeDate(date: Date | string | null): number | null {
  if (!date) {
    return null;
  }
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
 
public validateFromDate(): boolean {
  this.fromDateError = false;
  return this.validateRange();
}
 
public validateToDate(): boolean {
  this.toDateError = false;
   return this.validateRange();
}

public validateRange(): boolean {
   this.fromDateError = false;
  this.toDateError = false;
  this.dateRangeError = false;

  const opCode = this.opCode?.code;
  const range = opCode ? this.dateRanges[opCode] : null;

  if (!range) {
    return false;
  }

  const [startStr, endStr] = range.split(' - ');
  const minAllowed = this.normalizeDate(startStr);
  const maxAllowed = this.normalizeDate(endStr);

  const fromTime = this.normalizeDate(this.fromDate);
  const toTime = this.normalizeDate(this.toDate);

  if (fromTime && minAllowed && maxAllowed) {
    this.fromDateError = fromTime < minAllowed || fromTime > maxAllowed;
  }

  if (toTime && minAllowed && maxAllowed) {
    this.toDateError = toTime < minAllowed || toTime > maxAllowed;
  }

  if (fromTime && toTime && fromTime > toTime) {
    this.dateRangeError = true;
  }

  return !(this.fromDateError || this.toDateError || this.dateRangeError);
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
