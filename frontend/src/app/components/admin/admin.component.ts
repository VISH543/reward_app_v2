import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="content">
      <div class="header-row">
        <h1>CES User Management</h1>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : 'Create New CES User' }}
        </button>
      </div>

      <div *ngIf="showForm" class="glass card form-card">
        <h3>Create User</h3>
        <div class="form-grid">
          <input type="text" placeholder="Username" [(ngModel)]="newUser.username">
          <input type="password" placeholder="Password" [(ngModel)]="newUser.password">
          <button class="btn btn-primary" (click)="createUser()">Save User</button>
        </div>
      </div>

      <div class="glass card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td><span class="badge badge-regular">{{ user.role }}</span></td>
              <td>
                <button class="btn btn-danger" (click)="deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .content { padding: 40px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .form-card { margin-bottom: 30px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; align-items: center; margin-top: 20px; }
  `]
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  showForm = false;
  newUser = { username: '', password: '' };

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any[]>('/api/admin/users').subscribe(data => this.users = data);
  }

  createUser(): void {
    this.http.post('/api/admin/users', this.newUser).subscribe({
      next: () => {
        this.notificationService.success('CES user created successfully!');
        this.loadUsers();
        this.showForm = false;
        this.newUser = { username: '', password: '' };
      },
      error: (err) => {
        this.notificationService.error('Error creating user: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/admin/users/${id}`).subscribe({
        next: () => {
          this.notificationService.success('User deleted successfully!');
          this.loadUsers();
        },
        error: err => this.notificationService.error(err.error || 'Delete failed')
      });
    }
  }
}
