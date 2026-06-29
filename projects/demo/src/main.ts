import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withXhr } from '@angular/common/http';

bootstrapApplication(AppComponent, { providers: [provideHttpClient(withXhr())] }).catch((err) =>
  console.error(err),
);
