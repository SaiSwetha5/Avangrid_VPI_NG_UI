import { Component, effect, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { DataService } from 'services/data.service';
import { NgForm, ReactiveFormsModule, FormsModule, NgModel } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

interface OpCode {
  name: string;
  code: string;
}

const UUIDREGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const DIRECTIONS: { name: string; code: boolean }[] = [
  { name: 'Inbound', code: true },
  { name: 'Outbound', code: false },
];

const DATERANGES: Record<string, string> = {
  RGE: '02 Jun, 2014 - 23 Jun, 2022',
  NYSEG: '21 Oct, 2014 - 25 Oct, 2022',
  CMP: '12 Aug, 2014 - 18 May, 2022'
};

@Component({
  selector: 'app-vpi-slider',
  imports: [FloatLabel, InputTextModule, ToastModule, RouterModule, FormsModule, ReactiveFormsModule, CardModule, SelectModule, DatePickerModule, CommonModule, ButtonModule, DrawerModule],
  templateUrl: './vpi-slider.component.html',
  styleUrl: './vpi-slider.component.scss',
  standalone: true,
  providers: [DatePipe]
})
export class VpiSliderComponent implements OnInit {
  public fromDate: Date = new Date();
  public readonly directions = DIRECTIONS;
  public readonly dateRanges = DATERANGES;
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  public dataService = inject(DataService);
  private readonly cdr = inject(ChangeDetectorRef);
  public dateRangeError = false;
  public toDateError = false;
  public fromDateError = false;
  public pageNumber = 1;
  public toDate: Date = new Date();
  public hourFormat = '24';
  public aniAliDigitsModel = '';
  public extensionNumberModel = '';
  public channelNumberModel: string | null = null;
  public agentIdModel = '';
  public objectIdModel = '';
  public nameModel = '';
  public validIDs: string[] = [];
  public invalidIDs: string[] = [];
  public opCode: OpCode | null = null;
  public selectedDirection: { name: string; code: boolean } | null = null;

  public ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/vpi')) {
          if (!this.dataService.drawerFormState()) {
            this.resetFormForNewSession();
          }
        }
      }
    });
  }

  public resetFormForNewSession(): void {
    this.resetAllFields();
    this.dataService.drawerFormState.set(undefined);
  }

  private readonly opcodeReadyEffect = effect(() => {
    const options = sessionStorage.getItem('VPI_OPCODES');
    if (options) {
      this.dataService.opcodesSignal.set(JSON.parse(options));
    }
    this.cdr.detectChanges();

  });

  private readonly drawerOpenEffect = effect(() => {
    if (this.dataService.openDrawer()) {
      this.restoreFormState();
    }
  });

  public getFormattedDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') ?? '';
  }

  public resetFilters(ngForm?: NgForm): void {
    ngForm?.resetForm();
    this.fromDate = new Date();
    this.toDate = new Date();
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
  }

  public cancelFilters(ngForm: NgForm): void {
    ngForm.resetForm();
    this.dataService.openDrawer.set(false);
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
  }

  private isToday(date?: Date | string | null): boolean {
    if (!date) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(date);
    cmp.setHours(0, 0, 0, 0);
    return cmp.getTime() === today.getTime();
  }


  private checkTodayErrors(): boolean {
    const isFromToday = this.isToday(this.fromDate);
    const isToToday = this.isToday(this.toDate);

    if (isFromToday || isToToday) {
      this.fromDateError = isFromToday || this.fromDateError;
      this.toDateError = isToToday || this.toDateError;
      this.dateRangeError = true;
      return true;
    }
    return false;
  }

  public applyDateFilters(): void {
    if (this.checkTodayErrors()) {
      return;
    }

    if (!this.validateRange()) {
      return;
    }

    if (this.objectIdModel && !this.processObjectIds()) {
      return;
    }

    const opcoCode = this.opCode?.code ?? '';
    this.dataService.selectedOpcode.set(opcoCode);

    this.dataService.setPayload({
      from_date: this.getFormattedDate(this.fromDate),
      to_date: this.getFormattedDate(this.toDate),
      opco: opcoCode,
      filters: this.buildFilters(),
      pagination: {
        pageNumber: this.pageNumber,
        pageSize: 20,
      },
    });

    this.dataService.openDrawer.set(false);
    this.router.navigate(['/vpi']);
  }


  private buildFilters() {
    return {
      name: this.nameModel ? this.nameModel.split(',') : null,
      extensionNum: this.extensionNumberModel ? this.extensionNumberModel.split(',') : null,
      objectIDs: this.validIDs.length > 0 ? this.validIDs : null,
      channelNum: this.channelNumberModel ? this.channelNumberModel.toString().split(',') : null,
      aniAliDigits: this.aniAliDigitsModel ? this.aniAliDigitsModel.split(',') : null,
      agentID: this.agentIdModel ? this.agentIdModel.split(',') : null,
      direction: this.selectedDirection?.code ?? null,
    };
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

    const range = this.getAllowedRange();
    if (!range) {
      return false;
    }

    const fromTime = this.normalizeDate(this.fromDate);
    const toTime = this.normalizeDate(this.toDate);

    this.fromDateError = this.isOutOfRange(fromTime, range);
    this.toDateError = this.isOutOfRange(toTime, range);
    this.dateRangeError = this.isFromAfterTo(fromTime, toTime);

    return !(this.fromDateError || this.toDateError || this.dateRangeError);
  }

  public openDrawerFunction(): void {
    this.dataService.openDrawer.set(true);
  }

  private restoreFormState(): void {
    const currentRoute = this.router.url.split('?')[0];
    const isVpiRoute = currentRoute.startsWith('/vpi');

    if (isVpiRoute) {
      const saved = this.dataService.drawerFormState();
      if (!saved?.opco) {
        return;
      }

      const matchedOpcode = this.dataService.opcodesSignal()
        .find(o => o.code === saved.opco);
      if (!matchedOpcode) {
        return;
      }

      this.fromDate = this.parseDate(saved.from_date);
      this.toDate = this.parseDate(saved.to_date);
      this.opCode = matchedOpcode;
      this.selectedDirection = this.findDirection(saved.filters?.direction);

      const filteredArray = saved.filters || {};
      this.nameModel = this.formatArray(filteredArray.name);
      this.extensionNumberModel = this.formatArray(filteredArray.extensionNum);
      this.channelNumberModel = this.formatArray(filteredArray.channelNum);
      this.aniAliDigitsModel = this.formatArray(filteredArray.aniAliDigits);
      this.agentIdModel = this.formatArray(filteredArray.agentID);
      this.objectIdModel = this.formatArray(filteredArray.objectIDs);

      this.cdr.detectChanges();
    } else {
      this.dataService.drawerFormState.set(undefined);
      this.resetAllFields();
    }
  }

  private formatArray(arr: string[] | null | undefined): string {
    const safeArray = arr ?? [];
    return safeArray.length > 0 ? safeArray.join(',') : '';
  }

  private parseDate(dateValue: string | Date | undefined | null): Date {
    return dateValue ? new Date(dateValue) : new Date();
  }

  private findDirection(code: string | number | boolean | null | undefined) {
    if (code === null || code === undefined) {
      return null;
    }
    return this.directions.find(d => String(d.code) === String(code)) ?? null;
  }

  private resetAllFields(): void {
    this.fromDate = new Date();
    this.toDate = new Date();
    this.toDateError = false;
    this.fromDateError = false;
    this.dateRangeError = false;
    this.selectedDirection = null;
    this.aniAliDigitsModel = '';
    this.extensionNumberModel = '';
    this.channelNumberModel = null;
    this.agentIdModel = '';
    this.objectIdModel = '';
    this.nameModel = '';
  }

  public onDrawerHide(): void {
    this.dataService.drawerFormState.set({
      from_date: this.getFormattedDate(this.fromDate),
      to_date: this.getFormattedDate(this.toDate),
      opco: this.opCode?.code ?? '',
      filters: {
        name: this.nameModel ? this.nameModel.split(',') : null,
        extensionNum: this.extensionNumberModel ? this.extensionNumberModel.split(',') : null,
        objectIDs: this.objectIdModel ? this.objectIdModel.split(',') : null,
        channelNum: this.channelNumberModel ? this.channelNumberModel.toString().split(',') : null,
        aniAliDigits: this.aniAliDigitsModel ? this.aniAliDigitsModel.split(',') : null,
        agentID: this.agentIdModel ? this.agentIdModel.split(',') : null,
        direction: this.selectedDirection?.code ?? null,
      },
      pagination: { pageNumber: this.pageNumber, pageSize: 20 },
    });

    this.dataService.openDrawer.set(false);
  }

  public isValidUUID(uuid: string): boolean {
    return UUIDREGEX.test(uuid);
  }

  private processObjectIds(): boolean {
    const ids = this.objectIdModel.split(',').map(x => x.trim());
    this.validIDs = ids.filter(id => this.isValidUUID(id));
    this.invalidIDs = ids.filter(id => !this.isValidUUID(id));
    return this.invalidIDs.length === 0;
  }

  private getAllowedRange(): [number, number] | null {
    const opCode = this.opCode?.code;
    const range = opCode ? this.dateRanges[opCode] : null;
    if (!range) {
      return null;
    }

    const [startStr, endStr] = range.split(' - ');
    const min = this.normalizeDate(startStr);
    const max = this.normalizeDate(endStr);

    return min !== null && max !== null ? [min, max] : null;
  }

  private isOutOfRange(date: number | null, [min, max]: [number, number]): boolean {
    return date !== null && (date < min || date > max);
  }

  private isFromAfterTo(from: number | null, to: number | null): boolean {
    return from !== null && to !== null && from > to;
  }

  public checkOpcode(opCodeRef: NgModel): void {
    if (!this.opCode) {
      opCodeRef.control.markAsTouched();
      opCodeRef.control.setErrors({ required: true });
    }
  }
}
