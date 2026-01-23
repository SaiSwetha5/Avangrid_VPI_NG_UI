import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { msalInstance } from 'app/msal.config';

async function main() {
  await msalInstance.initialize(); 
  bootstrapApplication(AppComponent, appConfig);
}

main();
 