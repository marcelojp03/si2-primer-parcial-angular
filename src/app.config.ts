import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from './app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { AuthService } from './app/core/services/auth.service';

function initializeAuth(auth: AuthService): () => Promise<void> {
    return () => {
        if (auth.isAuthenticated() && !auth.getCurrentUser()) {
            return firstValueFrom(auth.getMe()).then(() => {}).catch(() => {});
        }
        return Promise.resolve();
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([jwtInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        { provide: APP_INITIALIZER, useFactory: initializeAuth, deps: [AuthService], multi: true },
        MessageService,
        provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })
    ]
};

