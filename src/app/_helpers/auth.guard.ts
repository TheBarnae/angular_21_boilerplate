import {Injectible} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, MaybeAsync } from '@angular/router';
import {AccountService} from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        const user = this.accountService.userValue;
        if (account){
            if(route.data.roles && !route.data.roles.includes(account.role)){
                this.router.navigate(['/']);
                return false;
            }
            return true;
        }
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
