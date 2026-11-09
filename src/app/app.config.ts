import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // withHashLocation: las rutas funcionan en Vercel sin configuración extra (ej. /#/equipos)
    provideRouter(routes, withHashLocation()),
    provideHttpClient()
  ]
};
