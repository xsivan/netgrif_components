import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularResizedEventModule} from 'angular-resize-event';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AbstractNumberFieldComponent} from './abstract-number-field.component';
import {TranslateService} from '@ngx-translate/core';
import {NumberField} from './models/number-field';
import {LanguageService} from '../../translate/language.service';
import {MockAuthenticationMethodService} from '../../utility/tests/mocks/mock-authentication-method-service';
import {AuthenticationMethodService} from '../../authentication/services/authentication-method.service';
import {UserResourceService} from '../../resources/engine-endpoint/user-resource.service';
import {AuthenticationService} from '../../authentication/services/authentication/authentication.service';
import {ConfigurationService} from '../../configuration/configuration.service';
import {MockAuthenticationService} from '../../utility/tests/mocks/mock-authentication.service';
import {TestConfigurationService} from '../../utility/tests/test-config';
import {MockUserResourceService} from '../../utility/tests/mocks/mock-user-resource.service';
import {TranslateLibModule} from '../../translate/translate-lib.module';
import {MaterialModule} from '../../material/material.module';

describe('AbstractNumberFieldComponent', () => {
    let component: TestNumComponent;
    let fixture: ComponentFixture<TestWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                AngularResizedEventModule,
                TranslateLibModule,
                HttpClientTestingModule,
                NoopAnimationsModule
            ],
            providers: [
                {provide: AuthenticationMethodService, useCLass: MockAuthenticationMethodService},
                {provide: AuthenticationService, useClass: MockAuthenticationService},
                {provide: UserResourceService, useClass: MockUserResourceService},
                {provide: ConfigurationService, useClass: TestConfigurationService}
            ],
            declarations: [
                TestNumComponent,
                TestWrapperComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TestWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        const initializeLang = TestBed.inject(LanguageService);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get error message', () => {
        expect(component.getErrorMessage()).toEqual('This is custom odd message!');

        component.dataField.value = 5;
        expect(component.getErrorMessage()).toEqual('Entered number must be even');
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });
});

@Component({
    selector: 'nae-test-num',
    template: ''
})
class TestNumComponent extends AbstractNumberFieldComponent {
    constructor(_translate: TranslateService) {
        super(_translate);
    }
}

@Component({
    selector: 'nae-test-wrapper',
    template: '<nae-test-num [dataField]="field"></nae-test-num>'
})
class TestWrapperComponent {
    field = new NumberField('', '', 4, {
        optional: true,
        visible: true,
        editable: true,
        hidden: true
    }, [
        {validationRule: 'odd', validationMessage: 'This is custom odd message!'},
        {validationRule: 'even', validationMessage: ''},
        {validationRule: 'positive', validationMessage: 'This is custom message!'},
        {validationRule: 'negative', validationMessage: 'This is custom message!'},
        {validationRule: 'decimal', validationMessage: 'This is custom message!'},
        {validationRule: 'inrange inf,0', validationMessage: 'This is custom message!'},
        {validationRule: 'inrange 0,inf', validationMessage: 'This is custom message!'},
        {validationRule: 'inrange -5,0', validationMessage: 'This is custom message!'},
    ]);
}