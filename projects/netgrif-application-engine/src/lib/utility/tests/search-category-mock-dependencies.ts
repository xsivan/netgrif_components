import {OperatorService} from '../../search/operator-service/operator.service';
import {of} from 'rxjs';
import {CaseViewService} from '../../view/case-view/service/case-view-service';
import {TaskViewService} from '../../view/task-view/service/task-view.service';
import {UserResourceService} from '../../resources/engine-endpoint/user-resource.service';
import {CategoryFactory} from '../../search/category-factory/category-factory';

const opService = new OperatorService();

export const createMockDependencies = () => {
    const mockCaseView = {allowedNets$: of([])} as CaseViewService;
    const mockTaskView = {allowedNets$: of([])} as TaskViewService;
    const mockUserResourceService = {getAll: () => of({content: [], pagination: {}})} as UserResourceService;

    return {
        categoryFactory: new CategoryFactory(opService, null, mockCaseView, mockTaskView, mockUserResourceService),
        userResourceService: mockUserResourceService,
        caseViewService: mockCaseView,
        taskViewService: mockTaskView,
    };
};