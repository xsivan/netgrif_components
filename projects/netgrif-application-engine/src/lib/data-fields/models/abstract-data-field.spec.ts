import {DataField} from './abstract-data-field';
import {Component} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TextField} from '../text-field/models/text-field';
import {DataFieldsModule} from '../data-fields.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('DataField', () => {
    let component: TestWrapperComponent;
    let fixture: ComponentFixture<TestWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatFormFieldModule, DataFieldsModule, NoopAnimationsModule],
            declarations: [
                TestWrapperComponent
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(TestWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('NAE-899 Fields don\'t update their validity when changing behavior', () => {
        expect(component).toBeTruthy();
        expect(component.field.valid).toBeTrue();

        component.field.behavior = {required: true, editable: true};
        component.field.update();

        expect(component.field.valid).toBeFalse();

        component.field.behavior = {optional: true, hidden: true};
        component.field.update();

        expect(component.field.valid).toBeTrue();
    });
});

@Component({
    selector: 'nae-test-wrapper',
    template: '<nae-text-field [dataField]="field"></nae-text-field>'
})
class TestWrapperComponent {
    field = new TextField('', '', '', {optional: true, hidden: true});
}