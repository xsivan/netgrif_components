import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {
    ArrayTaskViewServiceFactory,
    HeaderComponent,
    InjectedTabbedTaskViewData,
    NAE_TAB_DATA,
    SearchService,
    TabbedTaskView,
    tabbedTaskViewServiceFactory,
    TaskViewService
} from '@netgrif/application-engine';

const searchServiceFactory = (injectedTabData: InjectedTabbedTaskViewData) => {
    return new SearchService(injectedTabData.baseFilter);
};

@Component({
    selector: 'nae-app-tabbed-task-view',
    templateUrl: './tabbed-task-view.component.html',
    styleUrls: ['./tabbed-task-view.component.scss'],
    providers: [
        ArrayTaskViewServiceFactory,
        {
            provide: SearchService,
            useFactory: searchServiceFactory,
            deps: [NAE_TAB_DATA]
        },
        {
            provide: TaskViewService,
            useFactory: tabbedTaskViewServiceFactory,
            deps: [ArrayTaskViewServiceFactory, NAE_TAB_DATA]
        }
    ]
})
export class TabbedTaskViewComponent extends TabbedTaskView implements AfterViewInit {

    @ViewChild('header') public taskHeaderComponent: HeaderComponent;

    constructor(taskViewService: TaskViewService, @Inject(NAE_TAB_DATA) injectedTabData: InjectedTabbedTaskViewData) {
        super(taskViewService, injectedTabData);
    }

    ngAfterViewInit(): void {
        this.initializeHeader(this.taskHeaderComponent);
    }
}