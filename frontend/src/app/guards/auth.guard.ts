import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
    const storageService = inject(StorageService);
    const router = inject(Router);

    if (storageService.isLoggedIn()) {
        return true;
    }

    // Not logged in so redirect to login page with the return url
    return router.createUrlTree(['/login']);
};
