import {Component} from '@angular/core';
import {CategoryFactory} from '../../category-factory/category-factory';
import {Category} from '../../models/category/category';
import {TaskAssignee} from '../../models/category/task/task-assignee';
import {TaskProcess} from '../../models/category/task/task-process';
import {TaskRole} from '../../models/category/task/task-role';
import {TaskTask} from '../../models/category/task/task-task';

@Component({
    selector: 'nae-task-search',
    templateUrl: './task-search.component.html',
    styleUrls: ['./task-search.component.scss'],
    providers: [
        CategoryFactory
    ]
})
export class TaskSearchComponent {

    public searchCategories: Array<Category<any>>;

    constructor(private _categoryFactory: CategoryFactory) {
        this.searchCategories = [
            this._categoryFactory.get(TaskAssignee),
            this._categoryFactory.get(TaskProcess),
            this._categoryFactory.get(TaskRole),
            this._categoryFactory.get(TaskTask),
        ];
    }

}