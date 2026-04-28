import {catchError, of} from 'rxjs';
import {AppConfigService} from '@app/_services';

export function appInitializer(accountService: AccountService){
    return () => accountService.getUserByToken()
        .pipe(
            catchError(() => of())
        );
}