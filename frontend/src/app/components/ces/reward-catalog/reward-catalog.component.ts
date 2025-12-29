import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { Router } from '@angular/router';
import { CustomerContextService } from '../../../services/customer-context.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-reward-catalog',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  template: `
    <app-navbar></app-navbar>
    <div class="content">
      <div class="catalog-header">
        <h1>Reward Catalog</h1>
        <div class="active-customer glass" *ngIf="activeCustomer">
          <div class="context-info">
            <span>Assisting: <b>{{ activeCustomer.firstName }} {{ activeCustomer.lastName }}</b></span>
            <div class="card-selector-mini" *ngIf="cards.length > 0">
              <select [(ngModel)]="activeCard" (change)="onCardChange()">
                <option [ngValue]="null" disabled>Select Card to Redeem from</option>
                <option *ngFor="let card of cards" [ngValue]="card">
                  {{ card.cardNumber }} - {{ card.cardHolderName }} ({{ card.rewardPoints?.points || 0 }} pts)
                </option>
              </select>
            </div>
          </div>
          <span class="points-badge" *ngIf="activeCard">{{ activeCard.rewardPoints?.points || 0 }} pts</span>
        </div>
        <div class="active-customer glass error" *ngIf="!activeCustomer">
          <span>Please select a customer first from the Customer List</span>
        </div>
      </div>

      <div class="catalog-layout">
        <div class="sidebar">
          <div class="glass card">
            <h3>Categories</h3>
            <ul class="category-list">
              <li [class.active]="selectedCategory === null" (click)="selectCategory(null)">All Categories</li>
              <li *ngFor="let cat of categories" [class.active]="selectedCategory === cat.id" (click)="selectCategory(cat.id)">
                {{ cat.name }}
              </li>
            </ul>
          </div>

          <div class="glass card cart-card" *ngIf="cart.length > 0">
            <h3>Cart</h3>
            <ul class="cart-list">
              <li *ngFor="let item of cart; let i = index">
                <span>{{ item.name }}</span>
                <span>{{ item.pointCost }} pts <button class="btn-text" (click)="removeFromCart(i)">×</button></span>
              </li>
            </ul>
            <div class="cart-total">
              <p>Total: <b>{{ totalCartPoints }} pts</b></p>
              <button class="btn btn-primary" style="width: 100%;" [disabled]="!canRedeem() || redeeming || !activeCard" (click)="redeem()">
                {{ redeeming ? 'Processing...' : 'Redeem All' }}
              </button>
              <p *ngIf="activeCard && (activeCard.rewardPoints?.points || 0) < totalCartPoints" style="color: var(--danger); font-size: 12px; margin-top: 10px;">
                Insufficient points on selected card
              </p>
              <p *ngIf="!activeCard" style="color: var(--accent); font-size: 12px; margin-top: 10px;">
                Please select a card to redeem
              </p>
            </div>
          </div>
        </div>

        <div class="items-grid">
          <div *ngFor="let item of filteredItems" class="glass card item-card">
            <div class="item-icon">{{ getItemIcon(item.category.name) }}</div>
            <h4>{{ item.name }}</h4>
            <p class="cost">{{ item.pointCost }} Points</p>
            <button class="btn btn-primary" (click)="addToCart(item)" [disabled]="!activeCustomer">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content { padding: 40px; }
    .catalog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .active-customer { padding: 10px 20px; border-radius: 12px; display: flex; gap: 15px; align-items: center; }
    .active-customer.error { border-color: var(--danger); color: var(--danger); }
    .points-badge { background: var(--primary); color: white; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
    .catalog-layout { display: grid; grid-template-columns: 250px 1fr; gap: 30px; }
    .category-list { list-style: none; padding: 0; margin-top: 15px; }
    .category-list li { padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-muted); transition: all 0.3s; }
    .category-list li:hover { background: rgba(255,255,255,0.05); color: var(--text-main); }
    .category-list li.active { background: var(--primary); color: white; }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .item-card { text-align: center; }
    .item-icon { font-size: 40px; margin-bottom: 15px; filter: grayscale(0.5); }
    .cost { font-size: 20px; font-weight: 700; color: var(--accent); margin: 15px 0; }
    .cart-card { margin-top: 20px; border-color: var(--secondary); }
    .cart-list { list-style: none; padding: 0; margin: 15px 0; font-size: 14px; }
    .cart-list li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .cart-total { margin-top: 20px; border-top: 1px solid var(--border); padding-top: 15px; }
    .btn-text { background: none; border: none; color: var(--danger); cursor: pointer; font-size: 18px; }
    .card-selector-mini select {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 4px 8px;
      border-radius: 6px;
      margin-top: 5px;
      font-size: 12px;
    }
    .context-info { display: flex; flex-direction: column; }
  `]
})
export class RewardCatalogComponent implements OnInit {
  categories: any[] = [];
  items: any[] = [];
  filteredItems: any[] = [];
  selectedCategory: number | null = null;
  activeCustomer: any;
  activeCard: any;
  cards: any[] = [];
  cart: any[] = [];
  redeeming = false;

  constructor(
    private http: HttpClient,
    private customerContext: CustomerContextService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activeCustomer = this.customerContext.getActiveCustomer();
    this.activeCard = this.customerContext.getActiveCard();
    this.customerContext.cart$.subscribe(data => this.cart = data);
    this.loadCategories();
    this.loadItems();
    if (this.activeCustomer) {
      this.loadCards();
    }
  }

  loadCards(): void {
    this.http.get<any[]>(`/api/ces/customers/${this.activeCustomer.id}/cards`).subscribe(data => {
      this.cards = data;
      if (this.activeCard) {
        // Relink to the card object from this list to ensure rewardPoints are updated
        this.activeCard = this.cards.find(c => (c.id === this.activeCard.id)) || this.activeCard;
        this.customerContext.setActiveCard(this.activeCard);
      }
    });
  }

  onCardChange(): void {
    this.customerContext.setActiveCard(this.activeCard);
  }

  loadCategories(): void {
    this.http.get<any[]>('/api/ces/rewards/categories').subscribe(data => this.categories = data);
  }

  loadItems(): void {
    this.http.get<any[]>('/api/ces/rewards/items').subscribe(data => {
      this.items = data;
      this.filteredItems = data;
    });
  }

  selectCategory(id: number | null): void {
    this.selectedCategory = id;
    if (id === null) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(i => i.category.id === id);
    }
  }

  addToCart(item: any): void {
    this.customerContext.addToCart(item);
    this.notificationService.success(`${item.name} added to cart!`);
  }

  removeFromCart(index: number): void {
    this.customerContext.removeFromCart(index);
  }

  get totalCartPoints(): number {
    return this.cart.reduce((sum, item) => sum + item.pointCost, 0);
  }

  canRedeem(): boolean {
    return this.activeCard && (this.activeCard.rewardPoints?.points || 0) >= this.totalCartPoints;
  }

  redeem(): void {
    this.redeeming = true;
    const itemIds = this.cart.map(i => i.id);
    this.http.post(`/api/ces/customers/${this.activeCustomer.id}/redeem?cardId=${this.activeCard.id}`, itemIds).subscribe({
      next: () => {
        this.redeeming = false;
        this.notificationService.success('Redemption successful!');
        this.customerContext.clearCart();
        // Navigate to purchase history (customer profile)
        this.router.navigate(['/ces/customers', this.activeCustomer.id]);
      },
      error: err => {
        this.redeeming = false;
        this.notificationService.error(err.error || 'Redemption failed');
      }
    });
  }

  getItemIcon(catName: string): string {
    switch (catName) {
      case 'Gift Cards': return '🎁';
      case 'Travel & Holidays': return '✈️';
      case 'Shopping & Electronics': return '🎧';
      case 'Dining & Lifestyle': return '🍽️';
      case 'Health & Fitness': return '💪';
      case 'Learning & Subscriptions': return '📚';
      default: return '🌟';
    }
  }
}
