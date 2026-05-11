import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { DataService } from 'services/data.service';

export const authGuard: CanActivateFn = () => {
  const msalService = inject(MsalService);
  const router = inject(Router);
  const dataService = inject(DataService);

  const account = msalService.instance.getActiveAccount()
    ?? msalService.instance.getAllAccounts()[0];

   if (!account) {
    router.navigate(['/home']);
    return false;
  }

   const opcodes = dataService.opcodesSignal();
  if (!opcodes || opcodes.length === 0) {
    const cachedOpcodes = sessionStorage.getItem('VPI_OPCODES');
    if (cachedOpcodes) {
      dataService.opcodesSignal.set(JSON.parse(cachedOpcodes));  
      dataService.isOpcodeAvailable.set(true);
    } else {
            router.navigate(['/home']);
        return false;
    }
  }

   return true;
};