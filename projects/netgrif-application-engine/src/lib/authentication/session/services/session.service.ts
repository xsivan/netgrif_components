import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {ConfigurationService} from '../../../configuration/configuration.service';
import {NullStorage} from '../null-storage';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {LoggerService} from '../../../logger/services/logger.service';
import {catchError, map, tap} from 'rxjs/operators';
import {MessageResource} from '../../../resources/interface/message-resource';
import {LoadingEmitter} from '../../../utility/loading-emitter';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    public static readonly SESSION_TOKEN_STORAGE_KEY = 'naet';
    public static readonly SESSION_BEARER_HEADER_DEFAULT = 'X-Auth-Token';

    private _session$: BehaviorSubject<string>;
    private _storage: Storage;
    private readonly _sessionHeader: string;
    private _verified: boolean;
    private _verifying: LoadingEmitter;

    constructor(private _config: ConfigurationService, private _log: LoggerService, private _http: HttpClient) {
        // const sessionConfig = this._config.get().providers.auth.session;
        this._storage = this.resolveStorage(this._config.get().providers.auth['sessionStore']);
        this._sessionHeader = this._config.get().providers.auth.sessionBearer ?
            this._config.get().providers.auth.sessionBearer : SessionService.SESSION_BEARER_HEADER_DEFAULT;
        this._session$ = new BehaviorSubject<string>(null);
        this._verified = false;
        this._verifying = new LoadingEmitter();
        setTimeout(() => {
            this.load();
        });
    }

    get session$(): Observable<string> {
        return this._session$.asObservable();
    }

    set sessionToken(sessionToken: string) {
        this._session$.next(sessionToken);
        this._storage.setItem(SessionService.SESSION_TOKEN_STORAGE_KEY,
            btoa(SessionService.SESSION_TOKEN_STORAGE_KEY + ':' + sessionToken));
    }

    get sessionToken(): string {
        return this._session$.getValue();
    }

    get sessionHeader(): string {
        return this._sessionHeader;
    }

    get verified(): boolean {
        return this._verified;
    }

    get verifying(): Observable<boolean> {
        return this._verifying.asObservable();
    }

    get isVerifying(): boolean {
        return this._verifying.isActive;
    }

    public setVerifiedToken(sessionToken: string) {
        this._log.warn('Session token without explicit verification was set');
        this._verified = true;
        this.sessionToken = sessionToken;
    }

    public clear(): void {
        this._verified = false;
        this.sessionToken = '';
        this._storage.removeItem(SessionService.SESSION_TOKEN_STORAGE_KEY);
    }

    public verify(token?: string): Observable<boolean> {
        this._verifying.on();
        token = !!token ? token : this.sessionToken;

        const authConfig = this._config.get().providers.auth;
        let url = authConfig.address;
        url += authConfig.endpoints && authConfig.endpoints['verification'] ? authConfig.endpoints['verification'] :
            (authConfig.endpoints && authConfig.endpoints['login'] ? authConfig.endpoints['login'] : '');
        if (!url || url === authConfig.address) {
            this.clear();
            this._verifying.off();
            return throwError(new Error('Cannot verify session token. ' +
                'Login URL is not defined in the config [nae.providers.auth.endpoints.login].'));
        } else {
            return this._http.get<MessageResource>(url, {
                headers: new HttpHeaders().set(this._sessionHeader, token),
                observe: 'response'
            }).pipe(
                catchError(error => {
                    if (error instanceof HttpErrorResponse && error.status === 401) {
                        this._log.warn('Authentication token is invalid. Clearing session token');
                        this.clear();
                    }
                    this._verifying.off();
                    return throwError(error);
                }),
                map(response => {
                    this._log.debug(response.body.success);
                    this._verified = true;
                    this.sessionToken = token;
                    return true;
                }),
                tap(_ => this._verifying.off())
            );
        }
    }

    protected load(): string {
        let token = this._storage.getItem(SessionService.SESSION_TOKEN_STORAGE_KEY);
        this._verified = false;
        if (token) {
            token = this.resolveToken(token);
            this.sessionToken = token;
            this.verify(token).subscribe(ver => {
                this._log.debug('Token ' + token + ' verified status: ' + ver);
            });
        }
        return '';
    }

    private resolveToken(raw: string): string {
        return raw ? atob(raw).split(':')[1] : '';
    }

    private resolveStorage(storage: string): any {
        switch (storage) {
            case 'local':
                return localStorage;
            case 'session':
                return sessionStorage;
            case 'null':
                return new NullStorage();
            default:
                return localStorage;
        }
    }
}