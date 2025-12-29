import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerContextService {
    private activeCustomerSubject = new BehaviorSubject<any>(null);
    activeCustomer$ = this.activeCustomerSubject.asObservable();

    private activeCardSubject = new BehaviorSubject<any>(null);
    activeCard$ = this.activeCardSubject.asObservable();

    private cartSubject = new BehaviorSubject<any[]>([]);
    cart$ = this.cartSubject.asObservable();

    setActiveCustomer(customer: any): void {
        const current = this.activeCustomerSubject.value;
        if (current && customer && current.id !== customer.id) {
            this.clearCart();
            this.setActiveCard(null);
        }
        this.activeCustomerSubject.next(customer);
    }

    getActiveCustomer(): any {
        return this.activeCustomerSubject.value;
    }

    setActiveCard(card: any): void {
        this.activeCardSubject.next(card);
    }

    getActiveCard(): any {
        return this.activeCardSubject.value;
    }

    addToCart(item: any): void {
        const current = this.cartSubject.value;
        this.cartSubject.next([...current, item]);
    }

    removeFromCart(index: number): void {
        const current = [...this.cartSubject.value];
        current.splice(index, 1);
        this.cartSubject.next(current);
    }

    clearCart(): void {
        this.cartSubject.next([]);
    }
}
