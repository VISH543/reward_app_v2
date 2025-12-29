import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { CustomerListComponent } from './components/ces/customer-list/customer-list.component';
import { CustomerProfileComponent } from './components/ces/customer-profile/customer-profile.component';
import { RewardCatalogComponent } from './components/ces/reward-catalog/reward-catalog.component';
import { GlobalRedemptionListComponent } from './components/ces/global-redemption-list/global-redemption-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    { path: 'ces/customers', component: CustomerListComponent, canActivate: [authGuard] },
    { path: 'ces/customers/:id', component: CustomerProfileComponent, canActivate: [authGuard] },
    { path: 'ces/rewards', component: RewardCatalogComponent, canActivate: [authGuard] },
    { path: 'ces/redemptions', component: GlobalRedemptionListComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];
