import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { MSALInstanceFactory } from 'app/msal.config';

(async () => {  
  const msalInstance = MSALInstanceFactory(); // Create the instance
  await msalInstance.initialize(); 
  await bootstrapApplication(AppComponent, appConfig);
})().catch(err => console.error('App bootstrap failed', err));