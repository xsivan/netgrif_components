import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {
    AbstractTaskView, CategoryFactory,
    TaskViewServiceFactory, defaultTaskSearchCategoriesFactory, NAE_SEARCH_CATEGORIES, NextGroupService,
    SearchService,
    SimpleFilter, TaskSearchCaseQuery,
    TaskViewService
} from 'netgrif-application-engine';
import {
    HeaderComponent,
} from 'netgrif-components';

const localTaskViewServiceFactory = (factory: TaskViewServiceFactory) => {
    return factory.createFromConfig('group-view');
};

const searchServiceFactory = (nextGroupService: NextGroupService) => {
    const groupIds: Array<TaskSearchCaseQuery> = [];
    nextGroupService.groupOfUser.forEach(group => {
       groupIds.push({id: group.stringId});
    });
    return new SearchService(SimpleFilter.fromTaskQuery({case: groupIds}));
};

@Component({
    selector: 'nae-app-group-view-group-view',
    templateUrl: './group-view.component.html',
    styleUrls: ['./group-view.component.scss'],
    providers: [
        CategoryFactory,
        TaskViewServiceFactory,
        {   provide: SearchService,
            useFactory: searchServiceFactory,
            deps: [NextGroupService]
        },
        {   provide: TaskViewService,
            useFactory: localTaskViewServiceFactory,
            deps: [TaskViewServiceFactory]},
        {provide: NAE_SEARCH_CATEGORIES, useFactory: defaultTaskSearchCategoriesFactory, deps: [CategoryFactory]},
    ]
})
export class GroupViewComponent extends AbstractTaskView implements AfterViewInit {

    @ViewChild('header') public taskHeaderComponent: HeaderComponent;

    constructor(taskViewService: TaskViewService) {
        super(taskViewService);

    }

    ngAfterViewInit(): void {
        this.initializeHeader(this.taskHeaderComponent);
    }
}