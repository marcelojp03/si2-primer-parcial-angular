import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppInterceptor } from './http/http.interceptor';

@NgModule(
    { 
        declarations: [],
        exports: [], 
        imports: [BrowserAnimationsModule], 
        providers: [
            { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
            provideHttpClient(withInterceptorsFromDi())
        ] 
    }
)
export class CoreModule { }

