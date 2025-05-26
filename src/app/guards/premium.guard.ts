import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';
import { map } from 'rxjs/operators';
import { PremiumService } from '../service/premium.service';

export const premiumGuard: CanActivateFn = () => {
  const premiumService = inject(PremiumService);
  const router = inject(Router);

  return premiumService.getUserStatus().pipe(
    map(status => {
      if (status.premium) {
        return true;
      }
      return router.createUrlTree(['/premium/plans']);
    })
  );
};
