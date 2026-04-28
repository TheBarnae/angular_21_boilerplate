import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { delay, mergeMap, materialize, dematerialize } from "rxjs/operators";

import {AlertService} from '@app/_services';
import {Role} from "@app/_models";
import { ok } from "assert/strict";

const accountsKey = 'angular-15-singup-verification-boilerplate-accounts';
let accounts: any[] = JSON.parse(localStorage.getItem(accountsKey)!) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        const { url,method,headers,body} = request;
        const alertService = this.alertService;

        return handleRoute();

        function handleRoute(){
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case url.match('/accounts') &&  method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                default:
                    return next.handle(request);
            }
        }

        function authenicate(){
            const { email, password } = body;
            const account = accounts.find(x => x.email === email && x.password === password);
            if (!account) return error('Email or password is incorrect');
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function revokeToken(){
            if(!isAuthenticated[]) return unauthorized();
            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            //revoke tokens and savce
            account.refreshTokens = account.refreshTokens.filter((x: any) => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }
        function register(){
            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password, please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email so you can test without api. A real backend would send a real email"</div>
                        `, { autoClose: false });
            },1000);
            return ok();
        }

        account.id = newAccountId();
        if (account.id === 1) {
            account.role = Role.Admin;
        } else {
            account.role = Role.User;
        }
        account.dateCreated = new Date().toISOString();
        account.verificationToken = new Date().getTime().toString();
        account.isVerified = false;
        account.refreshTokens = [];
        delete account.confirmPassword;
        accounts.push(account);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        setTimeout(() => {
            const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
            alertService.info(`
                <h4>Verification Email</h4>
                <p>Thanks for registering!</p> 
                <p>Please click the below link to verify your email address:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>  
                `, { autoClose: false });
            }, 1000);

            return ok();
        }
        function verifyEmail(){
            const { token } = body;
            const account = accounts.find(x => x.verificationToken === token);
            if (!account) return error('Verification failed');
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }
        
    }
}