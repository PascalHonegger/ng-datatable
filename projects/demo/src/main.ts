import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { provideHttpClient } from "@angular/common/http";
import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
  ],
}).catch((err) => console.error(err));
