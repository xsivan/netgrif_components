import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject, Subject, timer} from 'rxjs';
import {TaskPanelData} from '../../../panel/task-panel-list/task-panel-data/task-panel-data';
import {ChangedFields} from '../../../data-fields/models/changed-fields';
import {TaskResourceService} from '../../../resources/engine-endpoint/task-resource.service';
import {UserService} from '../../../user/services/user.service';
import {SnackBarService} from '../../../snack-bar/services/snack-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, map, mergeMap, scan, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {SimpleFilter} from '../../../filter/models/simple-filter';
import {SortableViewWithAllowedNets} from '../../abstract/sortable-view-with-allowed-nets';
import {Net} from '../../../process/net';
import {LoadingEmitter} from '../../../utility/loading-emitter';
import {Pagination} from '../../../resources/interface/pagination';
import {Task} from '../../../resources/interface/task';
import {SearchService} from '../../../search/search-service/search.service';
import {LoggerService} from '../../../logger/services/logger.service';
import {ListRange} from '@angular/cdk/collections';
import {UserComparatorService} from '../../../user/services/user-comparator.service';


@Injectable()
export class TaskViewService extends SortableViewWithAllowedNets {

    protected _tasks$: Observable<Array<TaskPanelData>>;
    protected _changedFields$: Subject<ChangedFields>;
    protected _requestedPage$: BehaviorSubject<number>;
    protected _loading$: LoadingEmitter;
    protected _endOfData: boolean;
    protected _pagination: Pagination;
    protected _initiallyOpenOneTask: boolean;
    protected _closeTaskTabOnNoTasks: boolean;

    // Kovy fix
    protected _panelUpdate$: BehaviorSubject<Array<TaskPanelData>>;
    protected _closeTab$: ReplaySubject<void>;

    /**
     * @ignore
     * Used to decide if the mongo endpoint should be used instead
     */
    private readonly _parentCaseId: string = undefined;
    private readonly _initializing: boolean = true;
    private _clear = false;
    private _reloadPage = false;

    constructor(protected _taskService: TaskResourceService,
                private _userService: UserService,
                private _snackBarService: SnackBarService,
                private _translate: TranslateService,
                protected _searchService: SearchService,
                private _log: LoggerService,
                private _userComparator: UserComparatorService,
                allowedNets: Observable<Array<Net>> = of([]),
                initiallyOpenOneTask: Observable<boolean> = of(true),
                closeTaskTabOnNoTasks: Observable<boolean> = of(true)) {
        super(allowedNets);
        this._tasks$ = new Subject<Array<TaskPanelData>>();
        this._loading$ = new LoadingEmitter();
        this._changedFields$ = new Subject<ChangedFields>();
        this._requestedPage$ = new BehaviorSubject<number>(null);
        this._endOfData = false;
        this._pagination = {
            size: 50,
            totalElements: undefined,
            totalPages: undefined,
            number: -1
        };
        this._panelUpdate$ = new BehaviorSubject<Array<TaskPanelData>>([]);
        this._closeTab$ = new ReplaySubject<void>(1);

        const baseFilter = this._searchService.baseFilter;
        if (baseFilter instanceof SimpleFilter) {
            const keys = Object.keys(baseFilter.getRequestBody());
            if (keys.length === 1 && keys[0] === 'case' && typeof baseFilter.getRequestBody()[keys[0]] === 'string') {
                this._parentCaseId = baseFilter.getRequestBody()[keys[0]];
            }
        }
        this._initializing = false;

        this._searchService.activeFilter$.subscribe(() => {
            this.reload();
        });

        const tasksMap$ = this._requestedPage$.pipe(
            mergeMap(p => this.loadPage(p)),
            scan((acc, value) => {
                let result: { [k: string]: TaskPanelData } = {};
                if (this._clear) {
                    this._clear = false;

                } else if (this._reloadPage) {
                    this._reloadPage = false;
                    Object.keys(acc).forEach(taskId => {
                        if (!value[taskId]) {
                            delete acc[taskId];
                        } else {
                            this.updateTask(acc[taskId].task, value[taskId].task);
                            value[taskId].task.dataGroups = acc[taskId].task.dataGroups;
                            value[taskId].initiallyExpanded = acc[taskId].initiallyExpanded;
                            // acc[taskId] = value[taskId];
                            this.blockTaskFields(acc[taskId].task, !(acc[taskId].task.user &&
                                this._userComparator.compareUsers(acc[taskId].task.user)));
                            delete value[taskId];
                        }
                    });
                    result = Object.assign(acc, value);
                } else {
                    result = {...acc, ...value};
                }
                return result;
            }, {})
        );
        this._tasks$ = tasksMap$.pipe(
            map(v => Object.values(v) as Array<TaskPanelData>),
            map(taskArray => {
                if (taskArray.length === 1 && this._initiallyOpenOneTask) {
                    taskArray[0].task.finishDate === undefined ?
                        taskArray[0].initiallyExpanded = true :
                        taskArray[0].initiallyExpanded = false;
                }
                return taskArray;
            }),
            tap(v => this._panelUpdate$.next(v)));

        initiallyOpenOneTask.subscribe(bool => {
            this._initiallyOpenOneTask = bool;
        });

        closeTaskTabOnNoTasks.subscribe(bool => {
            this._closeTaskTabOnNoTasks = bool;
        });
    }

    public get tasks$(): Observable<Array<TaskPanelData>> {
        return this._tasks$;
    }

    public get changedFields$(): Subject<ChangedFields> {
        return this._changedFields$;
    }

    public get loading$(): Observable<boolean> {
        return this._loading$.asObservable();
    }

    public get loading(): boolean {
        return this._loading$.isActive;
    }

    public get panelUpdate(): Observable<Array<TaskPanelData>> {
        return this._panelUpdate$.asObservable();
    }

    public get closeTab(): Observable<void> {
        return this._closeTab$.asObservable();
    }

    public loadPage(page: number): Observable<{ [k: string]: TaskPanelData }> {
        if (this._loading$.isActive || page === null || page === undefined || page < 0 || this._clear) {
            return of({});
        }
        let params: HttpParams = new HttpParams();
        params = this.addSortParams(params);
        params = this.addPageParams(params, page);
        this._loading$.on();
        return timer(200).pipe(
            mergeMap(_ => !this._searchService.additionalFiltersApplied && !!this._parentCaseId ?
                this._taskService.getTasks({case: this._parentCaseId}, params) :
                this._taskService.searchTask(this._searchService.activeFilter, params)),
            catchError(err => {
                this._log.error('Loading tasks has failed!', err);
                return of({content: [], pagination: {...this._pagination, number: this._pagination.number - 1}});
            }),
            tap(t => {
                if (this._pagination.totalElements && this._pagination.totalElements > 0 &&
                    t.pagination.totalElements === 0 && !Array.isArray(t.content)) {
                    this._closeTab$.next();
                }
            }),
            tap(t => this._endOfData = !Array.isArray(t.content) ||
                (Array.isArray(t.content) && t.content.length === 0) ||
                t.pagination.number === t.pagination.totalPages),
            map(tasks => Array.isArray(tasks.content) ? tasks : {...tasks, content: []}),
            map(tasks => {
                this._pagination = tasks.pagination;
                return tasks.content.reduce((acc, curr) => {
                    this.blockTaskFields(curr, !(curr.user && this._userComparator.compareUsers(curr.user)));
                    return {
                        ...acc, [curr.stringId]: {
                            task: curr,
                            changedFields: this._changedFields$,
                            initiallyExpanded: false
                        }
                    };
                }, {});
            }),
            tap(_ => this._loading$.off())
        );
    }

    private updateTask(old: Task, neww: Task) {
        Object.keys(neww).forEach(key => {
            if (neww[key] !== undefined && neww[key] !== null) {
                old[key] = neww[key];
            }
        });
        this.blockTaskFields(old, !(old.user && this._userComparator.compareUsers(old.user)));
    }

    private blockTaskFields(task: Task, block: boolean): void {
        if (!task.dataGroups) {
            return;
        }
        task.dataGroups.forEach(g => g.fields.forEach(f => f.block = block));
    }

    public nextPage(renderedRange: ListRange, totalLoaded: number): void {
        if (this._loading$.isActive || this._endOfData) {
            return;
        }

        // if (renderedRange.start === 0) {
        //     this._requestedPage$.next(this._pagination.number - 1);
        // } else
        if (renderedRange.end === totalLoaded) {
            this._requestedPage$.next(this._pagination.number + 1);
        }
    }

    public reload(): void {
        if (!this._tasks$ || !this._pagination) {
            return;
        }
        this._clear = true;
        this._pagination.number = -1;
        this._endOfData = false;
        const range = {
            start: -1,
            end: 0
        };
        this.nextPage(range, 0);
        timer(100).subscribe(_ => {
            this._pagination.number = -1;
            this.nextPage(range, 0);
        });
    }

    public reloadCurrentPage(): void {
        if (!this._tasks$ || !this._pagination) {
            return;
        }
        this._reloadPage = true;
        this._pagination.number = -1; // TODO [BUG] - Reloading only first page
        this._endOfData = false;
        const range = {
            start: -1,
            end: 0
        };
        this.nextPage(range, 0);
    }

    protected getMetaFieldSortId(): string {
        // TODO Tasks were not sortable on old frontend sorting might require elastic mapping changes on backend
        return this._lastHeaderSearchState.fieldIdentifier;
    }

    protected getDefaultSortParam(): string {
        return 'priority,desc';
    }

    protected addPageParams(params: HttpParams, page?: number): HttpParams {
        params = params.set('size', this._pagination.size + '');
        page = page !== null ? page : this._pagination.number;
        params = params.set('page', page + '');
        return params;
    }
}