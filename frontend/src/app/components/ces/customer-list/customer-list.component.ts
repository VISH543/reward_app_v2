import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { Router } from '@angular/router';
import { CustomerContextService } from '../../../services/customer-context.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="content">
      <div class="header-row">
        <div class="title-area">
          <h1>Customer Management</h1>
          <p class="subtitle" *ngIf="!showForm">Manage and view all registered customers</p>
          <p class="subtitle" *ngIf="showForm">Enter details to register a new customer</p>
        </div>
        <div class="actions" *ngIf="!showForm">
          <input type="text" placeholder="Search by name or card..." [(ngModel)]="searchQuery" (input)="onSearch()" class="search-input">
          <button class="btn btn-primary" (click)="showForm = true">+ New Customer</button>
        </div>
      </div>

      <div *ngIf="showForm" class="glass card form-card animate-slide-down">
        <div class="form-header">
          <h3>Create New Customer</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" placeholder="e.g. John" [(ngModel)]="newCustomer.firstName">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="e.g. Doe" [(ngModel)]="newCustomer.lastName">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="john.doe@example.com" [(ngModel)]="newCustomer.email">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="+1..." [(ngModel)]="newCustomer.phoneNumber">
          </div>
          <div class="form-group">
            <label>Join Date</label>
            <input type="date" [(ngModel)]="newCustomer.joinDate">
          </div>
          <div class="form-actions">
            <button class="btn btn-outline" (click)="showForm = false">Cancel</button>
            <button class="btn btn-primary" (click)="createCustomer()">Create Customer</button>
          </div>
        </div>
      </div>

      <!-- Add Card Modal -->
      <div *ngIf="showCardModal" class="modal-overlay" (click)="showCardModal = false">
        <div class="glass card form-card animate-slide-down" style="max-width: 500px; margin-top: 5vh;" (click)="$event.stopPropagation()">
          <div class="form-header">
            <h3>Add Card for {{ selectedCustomerForCard?.firstName }}</h3>
            <div style="display: flex; gap: 15px; align-items: center;">
                <button class="btn-text" (click)="generateCardDetails()" style="font-size: 11px;">REGENERATE</button>
                <button class="btn-close" (click)="showCardModal = false">&times;</button>
            </div>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr;">
            <div class="form-group">
              <label>Card Holder Name</label>
              <input type="text" [(ngModel)]="newCard.cardHolderName">
            </div>
            <div class="form-group">
              <label>Card Number</label>
              <input type="text" [(ngModel)]="newCard.cardNumber">
            </div>
            <div class="form-group">
              <label>Expiry Date</label>
              <input type="text" [(ngModel)]="newCard.expiryDate">
            </div>
            <div class="form-actions">
               <button class="btn btn-outline" (click)="showCardModal = false">Cancel</button>
               <button class="btn btn-primary" (click)="saveCard()" [disabled]="addingCard">
                 {{ addingCard ? 'Saving...' : 'Save Card' }}
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="glass card list-container animate-fade-in" *ngIf="!showForm">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Cards</th>
              <th>Type</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers">
              <!-- ... existing customer row ... -->
              <td>{{ c.firstName }} {{ c.lastName }}</td>
              <td>{{ c.email }}</td>
              <td>
                <div class="card-summary" *ngIf="c.creditCards?.length > 0">
                  <span class="card-count-badge">{{ c.creditCards.length }}</span>
                  <span class="card-hint">**** {{ c.creditCards[0].cardNumber.slice(-4) }}</span>
                </div>
                <span class="text-muted" *ngIf="!c.creditCards?.length" style="font-size: 11px;">No Cards</span>
              </td>
              <td>
                <span [class]="'badge ' + (isPremium(c) ? 'badge-premium' : 'badge-regular')">
                  {{ isPremium(c) ? 'PREMIUM' : 'REGULAR' }}
                </span>
              </td>
              <td>{{ c.joinDate }}</td>
              <td class="table-actions">
                <button class="btn btn-primary btn-sm" (click)="viewProfile(c)">Profile</button>
                <button class="btn btn-outline btn-sm" (click)="addCardToCustomer(c)">+ Card</button>
                <button class="btn btn-danger btn-sm" (click)="deleteCustomer(c.id)">Delete</button>
              </td>
            </tr>
            <tr *ngIf="customers.length === 0">
              <td colspan="6" class="empty-row">
                <div class="empty-state-msg">
                  <p>No customers found matching your criteria</p>
                  <button class="btn btn-text" (click)="searchQuery = ''; loadCustomers()">Clear Search</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <button [disabled]="page === 0" (click)="changePage(-1)">Previous</button>
          <span>Page {{ page + 1 }}</span>
          <button (click)="changePage(1)">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content { padding: 40px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
    .title-area h1 { margin: 0; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin: 5px 0 0 0; }
    .search-input { width: 300px; margin-right: 20px; padding: 10px 15px; border-radius: 12px; }
    
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .form-group input { padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.05); }
    .form-actions { grid-column: span 2; display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
    
    .btn-close { background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer; }
    .empty-row { padding: 50px !important; text-align: center; }
    .empty-state-msg p { margin-bottom: 10px; color: var(--text-muted); }
    
    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .table-actions { display: flex; gap: 8px; }
    .pagination { margin-top: 20px; display: flex; gap: 20px; align-items: center; justify-content: center; }
    .card-summary { display: flex; align-items: center; gap: 8px; }
    .card-count-badge { background: var(--primary); color: white; width: 20px; height: 20px; border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
    .card-hint { font-size: 11px; font-weight: 600; color: var(--text-main); }
    .btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
    .btn-outline:hover { background: var(--primary); color: white; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    .btn-text { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-text:hover { text-decoration: underline; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; backdrop-filter: blur(5px); }
  `]
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  searchQuery = '';
  page = 0;
  showForm = false;
  newCustomer = { firstName: '', lastName: '', email: '', phoneNumber: '', joinDate: '' };

  // Add Card Modal State
  showCardModal = false;
  selectedCustomerForCard: any = null;
  newCard = { cardNumber: '', expiryDate: '', cardHolderName: '' };
  addingCard = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private customerContext: CustomerContextService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    let url = `/api/ces/customers?page=${this.page}`;
    if (this.searchQuery) url += `&search=${this.searchQuery}`;
    this.http.get<any>(url).subscribe(data => this.customers = data.content);
  }

  onSearch(): void {
    this.page = 0;
    this.loadCustomers();
  }

  changePage(delta: number): void {
    this.page += delta;
    this.loadCustomers();
  }

  createCustomer(): void {
    this.http.post('/api/ces/customers', this.newCustomer).subscribe({
      next: () => {
        this.notificationService.success('Customer created successfully!');
        this.loadCustomers();
        this.showForm = false;
        this.newCustomer = { firstName: '', lastName: '', email: '', phoneNumber: '', joinDate: '' };
      },
      error: (err) => {
        this.notificationService.error('Error creating customer: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteCustomer(id: number): void {
    if (confirm('Soft delete this customer?')) {
      this.http.delete(`/api/ces/customers/${id}`).subscribe(() => this.loadCustomers());
    }
  }

  viewProfile(customer: any): void {
    this.customerContext.setActiveCustomer(customer);
    this.router.navigate(['/ces/customers', customer.id]);
  }

  addCardToCustomer(customer: any): void {
    console.log('Opening add card modal for customer:', customer.id);
    this.selectedCustomerForCard = customer;
    this.generateCardDetails();
    this.showCardModal = true;
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
      cardHolderName: this.selectedCustomerForCard ? `${this.selectedCustomerForCard.firstName} ${this.selectedCustomerForCard.lastName}` : ''
    };
  }

  saveCard(): void {
    if (!this.selectedCustomerForCard) return;

    this.addingCard = true;
    this.http.post(`/api/ces/customers/${this.selectedCustomerForCard.id}/cards`, this.newCard).subscribe({
      next: () => {
        this.notificationService.success('Credit card added successfully!');
        this.loadCustomers(); // Reload to update card counts
        this.showCardModal = false;
        this.addingCard = false;
        this.selectedCustomerForCard = null;
      },
      error: (err) => {
        this.notificationService.error('Error adding credit card: ' + (err.error?.message || err.message));
        this.addingCard = false;
      }
    });
  }

  isPremium(c: any): boolean {
    if (!c.joinDate) return false;
    const join = new Date(c.joinDate);
    const now = new Date();
    return (now.getFullYear() - join.getFullYear()) >= 3;
  }
}
