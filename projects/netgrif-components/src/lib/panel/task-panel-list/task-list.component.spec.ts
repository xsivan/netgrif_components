import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TaskListComponent} from './task-list.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of} from 'rxjs';
import {
    ArrayTaskViewServiceFactory,
    AssignPolicy,
    AuthenticationMethodService,
    AuthenticationService,
    ConfigurationService,
    DataFocusPolicy,
    FinishPolicy,
    MaterialModule,
    MockAuthenticationMethodService,
    MockAuthenticationService,
    MockUserResourceService,
    noNetsTaskViewServiceFactory,
    SearchService,
    TaskResourceService,
    TaskViewService,
    TestConfigurationService,
    TestTaskSearchServiceFactory,
    UserResourceService
} from '@netgrif/application-engine';
import {RouterTestingModule} from '@angular/router/testing';
import {PanelComponentModule} from '../panel.module';
import {AuthenticationComponentModule} from '../../authentication/auth.module';

describe('TaskListComponent', () => {
    let component: TaskListComponent;
    let fixture: ComponentFixture<TestWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatExpansionModule,
                PanelComponentModule,
                MaterialModule,
                NoopAnimationsModule,
                CommonModule,
                HttpClientTestingModule,
                AuthenticationComponentModule,
                RouterTestingModule.withRoutes([])
            ],
            declarations: [TestWrapperComponent],
            providers: [
                ArrayTaskViewServiceFactory,
                {provide: AuthenticationMethodService, useClass: MockAuthenticationMethodService},
                {provide: AuthenticationService, useClass: MockAuthenticationService},
                {provide: UserResourceService, useClass: MockUserResourceService},
                {
                    provide: SearchService,
                    useFactory: TestTaskSearchServiceFactory
                },
                {
                    provide: ConfigurationService,
                    useClass: TestConfigurationService
                },
                {
                    provide: TaskViewService,
                    useFactory: noNetsTaskViewServiceFactory,
                    deps: [ArrayTaskViewServiceFactory]
                },
                {provide: TaskResourceService, useClass: MyResources},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TestWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });
});

@Component({
    selector: 'nc-test-wrapper',
    template: '<nc-task-list [tasks$]="taskPanels"></nc-task-list>'
})
class TestWrapperComponent {
    taskPanels = of([]);
}

class MyResources {
    searchTask(filter) {
        return of([{
            caseId: 'string',
            transitionId: 'string',
            title: 'string',
            caseColor: 'string',
            caseTitle: 'string',
            user: undefined,
            roles: {},
            startDate: undefined,
            finishDate: undefined,
            assignPolicy: AssignPolicy.manual,
            dataFocusPolicy: DataFocusPolicy.manual,
            finishPolicy: FinishPolicy.manual,
            stringId: 'string',
            cols: undefined,
            dataGroups: [],
            _links: {}
        }]);
    }
}