import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { CustomerContextService } from '../../../services/customer-context.service';

@Component({
    selector: 'app-global-redemption-list',
    standalone: true,
    imports: [CommonModule, NavbarComponent, RouterModule],
    template: `
    <app-navbar></app-navbar>
    <div class="content">
      <div class="header-row">
        <h1>Global Redemption History</h1>
        <div class="stats glass">
          <div class="stat-item">
            <span class="label">Total Redemptions</span>
            <span class="value">{{ redemptions.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Total Points Spent</span>
            <span class="value">{{ totalPointsSpent | number }}</span>
          </div>
        </div>
      </div>

      <div class="glass card">
        <div *ngIf="loading" class="loading-state">Loading redemptions...</div>
        <div *ngIf="!loading && redemptions.length === 0" class="empty-state">
          <p>No redemptions found in the system.</p>
        </div>

        <table *ngIf="!loading && redemptions.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Category</th>
              <th>Reward Item</th>
              <th>Cardholder Used</th>
              <th>Points</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of redemptions">
              <td class="date-cell">{{ r.redemptionDate | date:'medium' }}</td>
              <td>
                <div class="customer-info">
                  <span class="name">{{ r.customer.firstName }} {{ r.customer.lastName }}</span>
                  <span class="email">{{ r.customer.email }}</span>
                </div>
              </td>
              <td>
                <span class="category-pill">{{ r.rewardItem.category?.name || 'Other' }}</span>
              </td>
              <td class="item-name">{{ r.rewardItem.name }}</td>
              <td>
                <div class="card-info" *ngIf="r.creditCard">
                  <span class="holder">{{ r.creditCard.cardHolderName }}</span>
                  <span class="card-num">**** {{ r.creditCard.cardNumber.slice(-4) }}</span>
                </div>
                <span class="text-muted" *ngIf="!r.creditCard">N/A</span>
              </td>
              <td class="points-cell">-{{ r.pointsSpent }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="viewProfile(r.customer)">View Profile</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .content { padding: 40px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
    .stats { display: flex; gap: 40px; padding: 15px 30px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-item .label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .stat-item .value { font-size: 24px; font-weight: 700; color: var(--primary); }
    
    .loading-state, .empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
    
    .customer-info, .card-info { display: flex; flex-direction: column; line-height: 1.3; }
    .customer-info .name { font-weight: 600; color: var(--text-main); }
    .customer-info .email, .card-info .card-num { font-size: 11px; color: var(--text-muted); }
    .card-info .holder { font-size: 13px; font-weight: 600; }
    
    .date-cell { font-size: 13px; color: var(--text-muted); }
    .category-pill { background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .item-name { font-weight: 600; }
    .points-cell { color: #f87171; font-weight: 700; }
    .card-num { font-family: 'JetBrains Mono', monospace; }
  `]
})
export class GlobalRedemptionListComponent implements OnInit {
    redemptions: any[] = [];
    loading = true;

    constructor(
        private http: HttpClient,
        private router: Router,
        private customerContext: CustomerContextService
    ) { }

    ngOnInit(): void {
        this.loadRedemptions();
    }

    loadRedemptions(): void {
        this.http.get<any[]>('/api/ces/redemptions').subscribe({
            next: (data) => {
                this.redemptions = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    get totalPointsSpent(): number {
        return this.redemptions.reduce((sum, r) => sum + r.pointsSpent, 0);
    }

    viewProfile(customer: any): void {
        this.customerContext.setActiveCustomer(customer);
        this.router.navigate(['/ces/customers', customer.id]);
    }
}
