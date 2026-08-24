import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { App } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { _throw } from 'rxjs/observable/throw';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {

    private loggingOut: boolean = false;

    constructor(private app: App, private storage: Storage) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: any) => {
                if (error instanceof HttpErrorResponse
                    && error.status === 401
                    && req.url.indexOf(environment.auth.credentialsLoginUrl) !== 0) {
                    this.forceLogout();
                }
                return _throw(error);
            })
        );
    }

    private forceLogout() {
        if (this.loggingOut) {
            return;
        }
        this.loggingOut = true;

        this.storage.clear().then(() => {
            const nav = this.app.getActiveNavs()[0] || this.app.getRootNavs()[0];
            if (nav) {
                nav.setRoot('LoginPage');
            }
            this.loggingOut = false;
        });
    }
}
