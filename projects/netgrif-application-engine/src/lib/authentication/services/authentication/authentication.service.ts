import {Credentials} from '../../models/credentials';
import {Injectable} from '@angular/core';
import {AuthenticationMethodService} from '../authentication-method.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User as AuthUser} from '../../models/user';
import {ConfigurationService} from '../../../configuration/configuration.service';
import {catchError, map, tap} from 'rxjs/operators';
import {User} from '../../../user/models/user';
import {UserTransformer} from '../../models/user.transformer';
import {SessionService} from '../../session/services/session.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private static readonly IDENTIFICATION_ATTRIBUTE = 'id';

    private _authenticated$: BehaviorSubject<boolean>;

    constructor(private _auth: AuthenticationMethodService,
                private _config: ConfigurationService,
                private _sessionService: SessionService,
                private _userTransformer: UserTransformer) {
        this._authenticated$ = new BehaviorSubject<boolean>(false);
        this._sessionService.session$.subscribe(token => {
            this._authenticated$.next(!!token && token.length !== 0 && this._sessionService.verified);
        });
    }

    login(credentials: Credentials): Observable<User> {
        return this._auth.login(credentials).pipe(
            tap((user: AuthUser) => {
                this._authenticated$.next(!!user[AuthenticationService.IDENTIFICATION_ATTRIBUTE]);
            }),
            map((user: AuthUser) => this._userTransformer.transform(user)),
            catchError(error => {
                console.error(error);
                return of(null);
            })
        );
    }

    logout(): Observable<object> {
        return this._auth.logout().pipe(
            tap(() => {
                this._authenticated$.next(false);
                this._sessionService.clear();
            }),
            catchError(error => {
                console.error(error);
                return of(error);
            })
        );
    }

    get isAuthenticated(): boolean {
        return this._authenticated$.getValue();
    }

    get authenticated$(): Observable<boolean> {
        return this._authenticated$.asObservable();
    }
}