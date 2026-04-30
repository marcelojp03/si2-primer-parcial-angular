// import { Injectable } from '@angular/core';
// import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';

// import { AuthService } from '../services/auth.service';

// @Injectable({ providedIn: 'root' })
// export class Logged implements Resolve<any> {

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) { }

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//     if (this.authService.isLogged()) {
//       this.router.navigate(['/dashboard']);
//     }
//   }
// }


// core/guards/logged.guard.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Resolver para prevenir que usuarios logueados accedan a páginas de autenticación
 * Redirige según el tipo de usuario:
 * - Admin → /dashboard
 * - Customer → / (home)
 */
export const loggedResolver: ResolveFn<boolean> = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) {
    const userType = auth.getUserType();
    
    if (userType === 'admin') {
      console.log('[Logged Guard] Admin ya autenticado, redirigiendo a dashboard');
      router.navigate(['/dashboard']);
    } else if (userType === 'customer') {
      console.log('[Logged Guard] Cliente ya autenticado, redirigiendo a home');
      router.navigate(['/']);
    } else {
      console.warn('[Logged Guard] Usuario logueado sin tipo definido');
      router.navigate(['/']);
    }
  }
  
  return true;
};

