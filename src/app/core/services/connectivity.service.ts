import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  online$: Observable<boolean> = this.onlineSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.onlineSubject.next(true));
    window.addEventListener('offline', () => this.onlineSubject.next(false));
  }

  get isOnline(): boolean {
    return this.onlineSubject.value;
  }
}
