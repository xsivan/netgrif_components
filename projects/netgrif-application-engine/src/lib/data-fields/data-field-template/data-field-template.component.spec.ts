import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DataFieldTemplateComponent} from './data-field-template.component';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MaterialModule} from '../../material/material.module';
import {AngularResizedEventModule} from 'angular-resize-event';
import {TextField} from '../text-field/models/text-field';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ConfigurationService} from '../../configuration/configuration.service';
import {TestConfigurationService} from '../../utility/tests/test-config';
import {ViewService} from '../../routing/view-service/view.service';
import {TestViewService} from '../../utility/tests/test-view-service';

describe('DataFieldTemplateComponent', () => {
    let component: DataFieldTemplateComponent;
    let fixture: ComponentFixture<TestWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, AngularResizedEventModule, NoopAnimationsModule],
            declarations: [DataFieldTemplateComponent, TestWrapperComponent],
            providers: [
                {provide: ConfigurationService, useClass: TestConfigurationService},
                {provide: ViewService, useClass: TestViewService}
                ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TestWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
    }));


    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

@Component({
    selector: 'nae-test-wrapper',
    template: '<nae-data-field-template [dataField]="field"></nae-data-field-template>'
})
class TestWrapperComponent {
    field = new TextField('', '', '', {});
}