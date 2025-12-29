import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { CustomerContextService } from '../../services/customer-context.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar glass">
      <div class="logo-area">
        <span class="logo gradient-text">CES Portal</span>
        <span class="role-badge" *ngIf="user">{{ user.roles[0] }}</span>
        <div class="active-customer-context" *ngIf="activeCustomer">
          <span class="context-label">Customer:</span>
          <b>{{ activeCustomer.firstName }}</b>
          <span class="points-pill" *ngIf="activeCard">{{ activeCard.rewardPoints?.points || 0 }} pts</span>
        </div>
      </div>
      
      <div class="nav-links">
        <a routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin()">User Management</a>
        <a routerLink="/ces/customers" routerLinkActive="active" *ngIf="isCes()">Customers</a>
        <a routerLink="/ces/rewards" routerLinkActive="active" *ngIf="isCes()">Rewards</a>
        <a routerLink="/ces/redemptions" routerLinkActive="active" *ngIf="isCes()">Redemptions</a>
      </div>
      
      <div class="user-actions">
        <span>{{ user?.username }}</span>
        <button class="btn btn-danger" (click)="logout()">Logout</button>
      </div>

      <div class="notification-container" *ngIf="notification">
        <div class="notification" [class]="notification.type">
          {{ notification.message }}
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      margin: 20px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .role-badge {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .nav-links {
      display: flex;
      gap: 25px;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-main);
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .active-customer-context {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      font-size: 13px;
    }
    .context-label { color: var(--text-muted); }
    .points-pill {
      background: var(--primary);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 11px;
    }
    .notification-container {
      position: fixed;
      top: 100px;
      right: 40px;
      z-index: 1000;
    }
    .notification {
      padding: 15px 25px;
      border-radius: 12px;
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      color: white;
    }
    .notification.success { border-color: var(--success); color: var(--success); }
    .notification.error { border-color: var(--danger); color: var(--danger); }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NavbarComponent {
  user: any;
  activeCustomer: any;
  activeCard: any;
  notification: any;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private customerContext: CustomerContextService,
    private notificationService: NotificationService
  ) {
    this.user = this.storageService.getUser();
    this.customerContext.activeCustomer$.subscribe(customer => {
      this.activeCustomer = customer;
    });
    this.customerContext.activeCard$.subscribe(card => {
      this.activeCard = card;
    });
    this.notificationService.notification$.subscribe(n => {
      this.notification = n;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isAdmin(): boolean {
    return this.user?.roles.includes('ROLE_ADMIN_CES');
  }

  isCes(): boolean {
    return this.user?.roles.includes('ROLE_CES_USER') || this.user?.roles.includes('ROLE_ADMIN_CES');
  }
}
