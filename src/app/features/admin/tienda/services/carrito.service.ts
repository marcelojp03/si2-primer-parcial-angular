import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CarritoItem } from '../models/carrito.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
    private readonly KEY = 'vpay_carrito';
    private subject = new BehaviorSubject<CarritoItem[]>(this.fromStorage());
    readonly items$ = this.subject.asObservable();

    get items(): CarritoItem[] { return this.subject.value; }
    get totalItems(): number { return this.items.reduce((s, i) => s + i.cantidad, 0); }
    get total(): number { return this.items.reduce((s, i) => s + i.precioBase * i.cantidad, 0); }

    agregar(item: CarritoItem): void {
        const current = this.items;
        const idx = current.findIndex(i => i.eventoId === item.eventoId && i.sectorId === item.sectorId);
        const updated = idx >= 0
            ? current.map((el, n) => n === idx ? { ...el, cantidad: el.cantidad + item.cantidad } : el)
            : [...current, item];
        this.save(updated);
    }

    actualizar(eventoId: number, sectorId: number, cantidad: number): void {
        this.save(
            this.items
                .map(i => i.eventoId === eventoId && i.sectorId === sectorId ? { ...i, cantidad } : i)
                .filter(i => i.cantidad > 0)
        );
    }

    eliminar(eventoId: number, sectorId: number): void {
        this.save(this.items.filter(i => !(i.eventoId === eventoId && i.sectorId === sectorId)));
    }

    limpiar(): void { this.save([]); }

    private save(items: CarritoItem[]): void {
        sessionStorage.setItem(this.KEY, JSON.stringify(items));
        this.subject.next(items);
    }

    private fromStorage(): CarritoItem[] {
        try {
            const str = sessionStorage.getItem(this.KEY);
            return str ? JSON.parse(str) : [];
        } catch { return []; }
    }
}

