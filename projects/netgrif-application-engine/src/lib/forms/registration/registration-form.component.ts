import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {passwordValidator} from './password.validator';
import {FormSubmitEvent, HasForm} from '../has-form';
import {SignUpService} from '../../authentication/sign-up/services/sign-up.service';
import {LoggerService} from '../../logger/services/logger.service';
import {MessageResource} from '../../resources/interface/message-resource';

@Component({
    selector: 'nae-registration-form',
    templateUrl: './registration-form.component.html',
    styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit, HasForm {

    public rootFormGroup: FormGroup;
    public hidePassword: boolean;
    public hideRepeatPassword: boolean;

    @Output() public formSubmit: EventEmitter<FormSubmitEvent>;
    @Output() public register: EventEmitter<MessageResource>;

    private _token: string;
    private _tokenVerified: boolean;

    constructor(formBuilder: FormBuilder, private _signupService: SignUpService, private _log: LoggerService) {
        this.rootFormGroup = formBuilder.group({
            email: ['', Validators.email],
            name: [''],
            surname: [''],
            password: [''],
            confirmPassword: ['']
        }, {validator: passwordValidator});
        this.hidePassword = true;
        this.hideRepeatPassword = true;
        this.formSubmit = new EventEmitter<FormSubmitEvent>();
        this.register = new EventEmitter<MessageResource>();
        this._tokenVerified = false;
    }

    public ngOnInit(): void {
    }

    get token(): string {
        return this._token;
    }

    @Input()
    set token(token: string) {
        this._token = token;
        if (!this._token) {
            this._tokenVerified = false;
            return;
        }
        this._signupService.verify(this._token).subscribe(message => {
            this._log.info('Token ' + this._token + ' has been successfully verified');
            this._tokenVerified = true;
        }, (error: Error) => {
            this._log.error(error.message);
            this._tokenVerified = false;
        });
    }

    public onSubmit(): void {
        if (!this.rootFormGroup.valid) {
            return;
        }
        const request = {
            token: undefined,
            email: this.rootFormGroup.controls['email'].value,
            name: this.rootFormGroup.controls['name'].value,
            surname: this.rootFormGroup.controls['surname'].value,
            password: this.rootFormGroup.controls['password'].value
        };
        this.formSubmit.emit(request);

        if (!this._tokenVerified) {
            this.register.emit({error: 'Provided token ' + this._token + ' is not valid'});
            return;
        }
        request.token = this._token;
        this._signupService.signup(request).subscribe(message => {
            this.register.emit(message);
        }, error => {
            this.register.emit({error});
        });
    }
}