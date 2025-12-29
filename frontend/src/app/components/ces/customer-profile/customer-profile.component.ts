import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerContextService } from '../../../services/customer-context.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="content" *ngIf="customer">
      <div class="profile-header">
        <div class="user-info">
          <h1>{{ customer.firstName }} {{ customer.lastName }}</h1>
          <p>{{ customer.email }} | {{ customer.phoneNumber }}</p>
          <span [class]="'badge ' + (isPremium() ? 'badge-premium' : 'badge-regular')">
            {{ isPremium() ? 'PREMIUM CUSTOMER' : 'REGULAR CUSTOMER' }}
          </span>
        </div>
        <div class="points-card glass card">
          <p style="color: var(--text-muted); margin: 0;">Total Points</p>
          <h2 class="gradient-text" style="font-size: 32px; margin: 5px 0;">{{ totalPoints }}</h2>
          <button class="btn btn-primary" (click)="processRewards()" [disabled]="processing" style="width: 100%;">
            {{ processing ? 'Processing...' : 'Process Rewards' }}
          </button>
        </div>
      </div>

      <div class="grid-section">
        <!-- Credit Cards Section -->
        <div class="glass card">
          <div class="header-row">
            <h3>Credit Cards</h3>
            <button class="btn btn-primary btn-sm" (click)="toggleAddCard()">Add Card</button>
          </div>
          
          <div *ngIf="showCardForm" class="form-card-focused animate-slide-down">
            <div class="header-row">
              <h4>Register New Credit Card</h4>
              <button class="btn-text" (click)="generateCardDetails()" style="margin-right: 15px; font-size: 11px;">REGENERATE</button>
              <button class="btn-text" (click)="showCardForm = false">✕</button>
            </div>
            <div class="form-grid-vertical">
              <div class="form-group">
                <label>Card Holder Name</label>
                <input type="text" placeholder="e.g. JOHN DOE" [(ngModel)]="newCard.cardHolderName">
              </div>
              <div class="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" [(ngModel)]="newCard.cardNumber">
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" [(ngModel)]="newCard.expiryDate">
              </div>
              <div class="form-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" style="flex: 2;" (click)="addCard()" [disabled]="addingCard">
                  {{ addingCard ? 'Saving...' : 'Save Card' }}
                </button>
                <button class="btn btn-outline" style="flex: 1;" (click)="showCardForm = false">Cancel</button>
              </div>
            </div>
          </div>

          <div class="cards-list animate-fade-in" *ngIf="!showCardForm">
            <div *ngIf="cards.length === 0" class="empty-state glass">
              <p>No credit cards found for this customer.</p>
              <button class="btn btn-outline" (click)="showCardForm = true">Add First Card</button>
            </div>
            <div *ngFor="let card of cards" class="card-item" [class.active]="selectedCard?.id === card.id" (click)="selectCard(card)">
              <div class="card-chip"></div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                <div style="flex: 1;">
                  <p class="card-num">{{ card.cardNumber }}</p>
                  <p class="card-holder">{{ card.cardHolderName | uppercase }}</p>
                </div>
                <div class="card-points-badge">
                  <span class="value">{{ card.rewardPoints?.points || 0 }}</span>
                  <span class="label">PTS</span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">VALID THRU: {{ card.expiryDate }}</span>
                <button class="btn btn-primary btn-sm" (click)="generateTransactions(card.id); $event.stopPropagation()" [disabled]="generating">
                  {{ generating ? 'Generating...' : 'Refill' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Section -->
        <div class="glass card">
          <h3>Transactions {{ selectedCard ? ' - ' + selectedCard.cardNumber : '' }}</h3>
          <div class="scroll-area">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of transactions">
                  <td>{{ t.transactionDate | date:'shortDate' }}</td>
                  <td>{{ t.merchant }}</td>
                  <td>₹{{ t.amount | number:'1.2-2' }}</td>
                  <td>
                    <span class="badge" [class.badge-regular]="!t.processed" [class.badge-premium]="t.processed">
                      {{ t.processed ? 'Processed' : 'Unprocessed' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="grid-section" style="margin-top: 30px;">
        <!-- Redemption History -->
        <div class="glass card purchase-list-card" style="grid-column: span 2;">
          <div class="header-row">
            <h3>Purchase List & Point Activity</h3>
          </div>
          <div class="scroll-area">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Reward Item</th>
                  <th>Card Used (Holder)</th>
                  <th>Points Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let h of history">
                  <td>{{ h.redemptionDate | date:'medium' }}</td>
                  <td>
                    <span class="category-pill">{{ h.rewardItem.category?.name || 'Other' }}</span>
                  </td>
                  <td style="font-weight: 600;">{{ h.rewardItem.name }}</td>
                  <td>
                    <div *ngIf="h.creditCard" class="card-usage-info">
                      <span class="masked-num">**** {{ h.creditCard.cardNumber.slice(-4) }}</span>
                      <span class="holder-name-mini">{{ h.creditCard.cardHolderName | uppercase }}</span>
                    </div>
                    <span *ngIf="!h.creditCard" class="text-muted">N/A</span>
                  </td>
                  <td class="points-spent-cell">
                    <span class="minus-sign">-</span>{{ h.pointsSpent }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content { padding: 40px; }
    .profile-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .points-card { width: 250px; text-align: center; }
    .grid-section { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
    .form-grid-mini { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin: 15px 0; }
    .form-card-focused { background: rgba(255,255,255,0.03); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-top: 20px; }
    .form-grid-vertical { display: flex; flex-direction: column; gap: 15px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .form-group input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; color: white; font-family: inherit; }
    .form-group input:focus { border-color: var(--primary); outline: none; background: rgba(255,255,255,0.08); }
    .animate-slide-down { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .cards-list { 
      display: flex; flex-direction: column; gap: 15px; margin-top: 20px; 
      max-height: 540px; overflow-y: auto; padding-right: 10px;
    }
    .cards-list::-webkit-scrollbar, .scroll-area::-webkit-scrollbar { width: 5px; }
    .cards-list::-webkit-scrollbar-track, .scroll-area::-webkit-scrollbar-track { background: transparent; }
    .cards-list::-webkit-scrollbar-thumb, .scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .cards-list::-webkit-scrollbar-thumb:hover, .scroll-area::-webkit-scrollbar-thumb:hover { background: var(--primary); }
    .card-item { 
      padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.05); cursor: pointer;
      border: 1px solid transparent; transition: all 0.3s;
    }
    .card-item:hover { background: rgba(255,255,255,0.1); }
    .card-item.active { border-color: var(--primary); background: rgba(99,102,241,0.15); box-shadow: 0 4px 20px rgba(99,102,241,0.2); }
    .card-chip { width: 45px; height: 32px; background: linear-gradient(135deg, #facc15, #eab308); border-radius: 6px; margin-bottom: 20px; opacity: 0.8; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .card-num { font-size: 19px; font-weight: 600; letter-spacing: 2px; margin: 0; font-family: 'JetBrains Mono', monospace; }
    .card-holder { font-size: 12px; color: var(--text-main); font-weight: 600; margin-top: 4px; opacity: 0.9; }
    .card-points-badge { background: var(--primary); color: white; padding: 6px 12px; border-radius: 10px; text-align: center; line-height: 1; }
    .card-points-badge .value { display: block; font-size: 18px; font-weight: 700; }
    .card-points-badge .label { font-size: 9px; font-weight: 800; opacity: 0.8; }
    .empty-state { padding: 40px; text-align: center; border: 1px dashed var(--border); border-radius: 16px; margin-top: 20px; color: var(--text-muted); }
    .btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: 600; }
    .scroll-area { max-height: 400px; overflow-y: auto; }
    .purchase-list-card { margin-top: 20px; }
    .category-pill { background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 20px; font-size: 11px; color: var(--text-main); font-weight: 600; }
    .card-usage-info { display: flex; flex-direction: column; line-height: 1.2; }
    .masked-num { font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .holder-name-mini { font-size: 10px; color: var(--text-muted); font-weight: 600; }
    .points-spent-cell { color: #f87171; font-weight: 700; font-size: 15px; }
    .minus-sign { margin-right: 2px; }
    .btn-text { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 12px; font-weight: 600; padding: 0; }
    .btn-text:hover { text-decoration: underline; }
  `]
})
export class CustomerProfileComponent implements OnInit {
  customer: any;
  cards: any[] = [];
  selectedCard: any;
  transactions: any[] = [];
  history: any[] = [];

  showCardForm = false;
  newCard = { cardNumber: '', expiryDate: '', cardHolderName: '' };
  processing = false;
  generating = false;
  addingCard = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private customerContext: CustomerContextService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadProfile(id);

    this.route.queryParams.subscribe(params => {
      console.log('CustomerProfile: Query params received', params);
      const addCardParam = params['addCard'];
      // Check for boolean true or string 'true'
      if (addCardParam === true || addCardParam === 'true') {
        console.log('CustomerProfile: Opening Add Card form via query param');
        this.generateCardDetails(); // Auto-fill details
        this.showCardForm = true;

        // Clear the query param so a refresh doesn't re-trigger it unnecessarily,
        // though strictly speaking we might want it to persist.
        // For now, let's just ensure the UI reflects it.

        // Small delay to ensure view is ready regarding *ngIf="customer"
        setTimeout(() => {
          this.notificationService.info('Register New Card form opened');
          // Scroll to the form if possible
          const formElement = document.querySelector('.form-card-focused');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 800);
      }
    });
  }

  generateCardDetails(): void {
    // Generate random 16 digit number
    let num = '';
    for (let i = 0; i < 16; i++) {
      num += Math.floor(Math.random() * 10);
    }
    // Format as XXXX XXXX XXXX XXXX
    const formatted = num.match(/.{1,4}/g)?.join(' ') || num;

    // expiry 3 years from now
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);

    this.newCard = {
      cardNumber: formatted,
      expiryDate: `${mm}/${yy}`,
      cardHolderName: this.customer ? `${this.customer.firstName} ${this.customer.lastName}` : ''
    };
  }

  toggleAddCard(): void {
    this.showCardForm = !this.showCardForm;
    if (this.showCardForm) {
      this.generateCardDetails();
    }
  }

  loadProfile(id: any): void {
    this.http.get<any>(`/api/ces/customers/${id}`).subscribe(data => {
      this.customer = data;
      this.customerContext.setActiveCustomer(data);
      this.loadCards();
      this.loadHistory();
    });
  }

  loadCards(): void {
    const prevSelectedId = this.selectedCard?.id;
    this.http.get<any[]>(`/api/ces/customers/${this.customer.id}/cards`).subscribe(data => {
      this.cards = data;
      if (prevSelectedId) {
        this.selectedCard = this.cards.find(c => c.id === prevSelectedId) || this.cards[0];
      } else if (data.length > 0) {
        this.selectedCard = data[0];
      }

      if (this.selectedCard) {
        this.customerContext.setActiveCard(this.selectedCard);
        this.loadTransactions(this.selectedCard.id);
      }
    });
  }

  selectCard(card: any): void {
    this.selectedCard = card;
    this.customerContext.setActiveCard(card);
    this.loadTransactions(card.id);
  }

  loadTransactions(cardId: number): void {
    this.http.get<any[]>(`/api/ces/cards/${cardId}/transactions`).subscribe(data => this.transactions = data);
  }

  loadHistory(): void {
    this.http.get<any[]>(`/api/ces/customers/${this.customer.id}/redemption-history`).subscribe(data => this.history = data);
  }

  addCard(): void {
    if (!this.newCard.cardNumber || !this.newCard.cardHolderName || !this.newCard.expiryDate) {
      this.notificationService.error('Please fill in all credit card details.');
      return;
    }

    this.addingCard = true;
    this.http.post(`/api/ces/customers/${this.customer.id}/cards`, this.newCard).subscribe({
      next: () => {
        this.notificationService.success('Credit card added successfully!');
        this.loadCards();
        this.showCardForm = false;
        this.newCard = { cardNumber: '', expiryDate: '', cardHolderName: '' };
        this.loadProfile(this.customer.id);
        this.addingCard = false;
      },
      error: (err) => {
        this.notificationService.error('Error adding credit card: ' + (err.error?.message || err.message));
        this.addingCard = false;
      }
    });
  }

  generateTransactions(cardId: number): void {
    this.generating = true;
    this.http.post(`/api/ces/cards/${cardId}/transactions/generate`, {}).subscribe({
      next: () => {
        this.generating = false;
        this.notificationService.success('Transactions generated successfully!');
        this.loadTransactions(cardId);
      },
      error: () => this.generating = false
    });
  }

  processRewards(): void {
    this.processing = true;
    this.http.post(`/api/ces/customers/${this.customer.id}/process-rewards`, {}).subscribe({
      next: () => {
        this.processing = false;
        this.notificationService.success('Reward points processed successfully!');
        this.loadCards(); // loadCards already handles refreshing profile-related bits
        this.loadHistory();
      },
      error: () => this.processing = false
    });
  }

  isPremium(): boolean {
    if (!this.customer?.joinDate) return false;
    const join = new Date(this.customer.joinDate);
    const now = new Date();
    return (now.getFullYear() - join.getFullYear()) >= 3;
  }

  get totalPoints(): number {
    return this.cards.reduce((sum, card) => sum + (card.rewardPoints?.points || 0), 0);
  }
}
