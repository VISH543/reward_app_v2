import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="glass card login-card">
        <h2 class="gradient-text">CES Portal</h2>
        <p style="color: var(--text-muted); margin-bottom: 30px;">Sign in to manage rewards</p>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username" [(ngModel)]="form.username" required>
          </div>
          
          <div class="form-group" style="margin-top: 20px;">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="form.password" required>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 30px; justify-content: center;">
            Login
          </button>
          
          <div *ngIf="isLoginFailed" class="error-msg">
            Login failed: {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top left, #1e1b4b, #0f172a);
    }
    .login-card {
      width: 400px;
      text-align: center;
    }
    .form-group {
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-muted);
      font-size: 14px;
    }
    .error-msg {
      color: var(--danger);
      margin-top: 15px;
      font-size: 14px;
    }
  `]
})
export class LoginComponent implements OnInit {
  form: any = {
    username: '',
    password: ''
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(private authService: AuthService, private storageService: StorageService, private router: Router) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    } else {
      this.storageService.clean();
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;
        this.redirectUser();
      },
      error: err => {
        this.errorMessage = err.error.message || 'Verification failed';
        this.isLoginFailed = true;
      }
    });
  }

  redirectUser(): void {
    if (this.roles.includes('ROLE_ADMIN_CES')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/ces/customers']);
    }
  }
}
