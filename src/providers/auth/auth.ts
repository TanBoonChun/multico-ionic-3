import { Credentials } from './../../models/credentials';

import { Injectable } from '@angular/core';
// import { GooglePlus } from '@ionic-native/google-plus';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Auth } from "../../models/auth";
import { Storage } from '@ionic/storage';
import { environment } from '../../environment';


import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
}


@Injectable()
export class AuthProvider {


    constructor( private http: HttpClient, private storage: Storage) { }

    private SERVER_AUTH_CODE: string = 'serverAuthCode';
    private MSG_ACCESS_DENIED: string = 'User denied access';
    private serverAuthCode: any;
    // private codeAuthUrl: string = environment.auth.codeLoginUrl;
    private credentialsAuthUrl: string = environment.auth.credentialsLoginUrl;
    // private lecturersInviteUrl: string = environment.auth.lecturersInviteUrl;

    // public authUsingCode(): Observable<Auth> {
    //     return this.http.post<Auth>(this.codeAuthUrl, { code: this.serverAuthCode }, httpOptions)
    //         .pipe(
    //         catchError(this.handleError)
    //         );
    //     //   return this.http.post(this.codeAuthUrl, { code: this.serverAuthCode }, httpOptions)
    //     //       .pipe(
    //     //           catchError(this.handleError)
    //     //       );
    // }

   public authUsingCredentials(credentials: Credentials): Observable<Auth> {
        return this.http.post<Auth>(environment.auth.credentialsLoginUrl, credentials, httpOptions)
        .pipe(
            catchError(this.handleError)
        );
   }

//    public submitLecturerInvitationRequest(invitationRequest): Observable<any> {
//         return this.http.post<any>(this.lecturersInviteUrl, invitationRequest, httpOptions)
//         .pipe(
//             catchError(this.handleError)
//         );
//    }

    public setAccessToken(access_token: string) {
        this.storage.set('access_token', access_token);
    }

    public getAccessToken() {
        return this.storage.get('access_token');
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
            return Observable.throw('An error occurred:' + error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,

            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
            if (error.status == 422) {
                return Observable.throw('Invalid username or password');
            }
            return Observable.throw('An error occured. Try again later');

        }
        // return an observable with a user-facing error message
        // return Observable.throw(
        //     error);
    };

    // signInWithGoogle() {
    //     return this.googlePlus.login({
    //         webClientId: environment.google.webClientId,
    //         hostedDomain: environment.google.hostedDomain,
    //         offline: true
    //     }).then(
    //         res => {
    //             return new Promise((resolve, reject) => {
    //                 if (typeof res == 'object' && this.SERVER_AUTH_CODE in res) {
    //                     this.serverAuthCode = res.serverAuthCode;
    //                     resolve(res);
    //                 } else {
    //                     reject(this.MSG_ACCESS_DENIED);
    //                 }
    //             });
    //         }
    //         ).catch(
    //         error => {
    //             return new Promise((resolve, reject) => {
    //                 reject(this.MSG_ACCESS_DENIED);
    //             });
    //         }
    //         )
    // }
    //
    // signOutGoogle() {
    //     return this.googlePlus.logout().then(
    //         response => console.log(response)
    //     ).catch(
    //         error => console.log(error)
    //         );
    // }

}
