import {Injectable} from '@angular/core';
import {LoggerService} from '../../../logger/services/logger.service';
import {ConfigurationService} from '../../../configuration/configuration.service';
import {HttpClient} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {UserRegistrationRequest} from '../models/user-registration-request';
import {MessageResource} from '../../../resources/interface/message-resource';
import {switchMap} from 'rxjs/operators';
import {UserInvitationRequest} from '../models/user-invitation-request';
import {SignUpModule} from '../sign-up.module';

@Injectable({
    providedIn: SignUpModule
})
export class SignUpService {

    private readonly _signUpUrl: string;
    private readonly _verifyUrl: string;
    private readonly _inviteUrl: string;

    constructor(private _config: ConfigurationService, private _http: HttpClient, private _log: LoggerService) {
        const authAddress = _config.get().providers.auth.address;
        if (!authAddress) {
            throw new Error('Authentication provider address is not set!');
        }
        this._signUpUrl = authAddress + _config.get().providers.auth.endpoints['signup'];
        this._verifyUrl = authAddress + _config.get().providers.auth.endpoints['verify'];
        this._inviteUrl = authAddress + _config.get().providers.auth.endpoints['invite'];
    }

    public signup(newUser: UserRegistrationRequest): Observable<MessageResource> {
        if (!this._signUpUrl) {
            throw new Error('SingUp URL is not set in authentication provider endpoints!');
        }
        newUser.password = btoa(newUser.password);
        return this._http.post<MessageResource>(this._signUpUrl, newUser).pipe(
            switchMap(this.processMessageResponse)
        );
    }

    public invite(invitation: UserInvitationRequest): Observable<MessageResource> {
        if (!this._inviteUrl) {
            throw new Error('Invite URL is not set in authentication provider endpoints!');
        }
        if (!invitation.groups) {
            invitation.groups = [];
        }
        if (!invitation.processRoles) {
            invitation.processRoles = [];
        }
        return this._http.post<MessageResource>(this._inviteUrl, invitation).pipe(
            switchMap(this.processMessageResponse)
        );
    }

    public verify(token: string): Observable<MessageResource> {
        if (!this._verifyUrl) {
            throw new Error('Verify URL is not set in authentication provider endpoints!');
        }
        return this._http.post<MessageResource>(this._verifyUrl, token).pipe(
            switchMap(this.processMessageResponse)
        );
    }

    private processMessageResponse(message: MessageResource): Observable<MessageResource> {
        if (message.error) {
            throwError(new Error(message.error));
        } else {
            return of(message);
        }
    }
}