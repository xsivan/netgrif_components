import {ConfigurationService} from '../../configuration/configuration.service';
import {Injectable} from '@angular/core';
import {Params, ProviderProgress, ResourceProvider} from '../resource-provider.service';
import {Observable} from 'rxjs';
import {Count} from '../interface/count';
import {changeType, getResourceAddress, getResourcePage} from '../resource-utility-functions';
import {MessageResource} from '../interface/message-resource';
import {filter, map} from 'rxjs/operators';
import {TaskReference} from '../interface/task-reference';
import {DataGroup, DataGroupsResource} from '../interface/data-groups';
import {Task} from '../interface/task';
import {ChangedFieldContainer} from '../interface/changed-field-container';
import {CountService} from '../abstract-endpoint/count-service';
import {Filter} from '../../filter/models/filter';
import {FilterType} from '../../filter/models/filter-type';
import {TaskGetRequestBody} from '../interface/task-get-request-body';
import {HttpEventType} from '@angular/common/http';
import {Page} from '../interface/page';
import {DataField} from '../../data-fields/models/abstract-data-field';
import {FieldConverterService} from '../../task-content/services/field-converter.service';
import {TaskSetDataRequestBody} from '../interface/task-set-data-request-body';

@Injectable({
    providedIn: 'root'
})
export class TaskResourceService implements CountService {
    private SERVER_URL: string;

    protected constructor(protected provider: ResourceProvider,
                          protected _configService: ConfigurationService,
                          protected _fieldConverter: FieldConverterService) {
        this.SERVER_URL = getResourceAddress('task', this._configService.get().providers.resources);
    }

    /**
     *  Count tasks by provided criteria
     *  POST
     *  {{baseUrl}}/api/task/count
     */
    public count(filterParam: Filter): Observable<Count> {
        if (filterParam.type !== FilterType.TASK) {
            throw new Error('Provided filter doesn\'t have type TASK');
        }
        return this.provider.post$('task/count', this.SERVER_URL, filterParam.getRequestBody(), filterParam.getRequestParams())
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Get all tasks
     * GET
     * {{baseUrl}}/api/task
     */
    public getAllTask(): Observable<Array<Task>> {
        return this.provider.get$('task', this.SERVER_URL)
            .pipe(map(r => changeType(r, 'tasks')));
    }

    /**
     * Assign task
     * GET
     */
    // {{baseUrl}}/api/task/assign/:id
    public assignTask(taskId: string): Observable<MessageResource> {
        return this.provider.get$('task/assign/' + taskId, this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Cancel task
     * GET
     */
    // {{baseUrl}}/api/task/cancel/:id
    public cancelTask(taskId: string): Observable<MessageResource> {
        return this.provider.get$('task/cancel/' + taskId, this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Delegate task
     * POST
     */
    // {{baseUrl}}/api/task/delegate/:id
    public delegateTask(taskId: string, body: object): Observable<MessageResource> {
        return this.provider.post$('task/delegate/' + taskId, this.SERVER_URL, body)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Finish task
     * GET
     */
    // {{baseUrl}}/api/task/finish/:id
    public finishTask(taskId: string): Observable<MessageResource> {
        return this.provider.get$('task/finish/' + taskId, this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Searches tasks trough the Elastic endpoint.
     * POST
     * @param filterParam filter used to search the tasks. Must be of type `TASK`.
     * @param params Additional parameters
     */
    // {{baseUrl}}/api/task/search_es
    public searchTask(filterParam: Filter, params?: Params): Observable<Page<Task>> {
        if (filterParam.type !== FilterType.TASK) {
            throw new Error('Provided filter doesn\'t have type TASK');
        }
        params = ResourceProvider.combineParams(filterParam.getRequestParams(), params);
        return this.provider.post$('task/search_es', this.SERVER_URL, filterParam.getRequestBody(), params)
            .pipe(map(r => getResourcePage<Task>(r, 'tasks')));
    }

    /**
     * Searches tasks trough the Mongo endpoint.
     * POST
     * @param body search request body
     * @param params Additional request parameters
     */
    // {{baseUrl}}/api/task/search
    public getTasks(body: TaskGetRequestBody, params?: Params): Observable<Page<Task>> {
        return this.provider.post$('task/search', this.SERVER_URL, body, params)
            .pipe(map(r => getResourcePage<Task>(r, 'tasks')));
    }

    // ----------- CASE ----------
    /**
     * Get all tasks by cases
     * POST
     */
    // {{baseUrl}}/api/task/case
    public getAllTasksByCases(body: object): Observable<Array<Task>> { // TODO: ??
        return this.provider.post$('task/case', this.SERVER_URL, body)
            .pipe(map(r => changeType(r, 'tasks')));
    }

    /**
     * Get tasks of the case
     * GET
     */
    // {{baseUrl}}/api/task/case/:id
    public getAllTasksByCase(caseId: string): Observable<Array<TaskReference>> {
        return this.provider.get$('task/case/' + caseId, this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    // ----------- MY Task ----------
    /**
     * Get all tasks assigned to logged user
     * GET
     */
    // {{baseUrl}}/api/task/my
    public getAllMyTasks(): Observable<Array<Task>> {
        return this.provider.get$('task/my', this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Get all finished tasks by logged user
     * GET
     */
    // {{baseUrl}}/api/task/my/finished
    public getAllFinishedTask(): Observable<Array<Task>> {
        return this.provider.get$('task/my/finished', this.SERVER_URL)
            .pipe(map(r => changeType(r, undefined)));
    }

    /**
     * Get all task data
     *
     * GET
     *
     * If you don't want to parse the response yourself use [getData]{@link TaskResourceService#getData} instead.
     *
     * @returns the raw backend response without any additional processing
     */
    // {{baseUrl}}/api/task/:id/data
    public rawGetData(taskId: string): Observable<Array<DataGroupsResource>> {
        return this.provider.get$('task/' + taskId + '/data', this.SERVER_URL)
            .pipe(map(r => changeType(r, 'dataGroups')));
    }

    /**
     *  Get all task data
     *
     *  GET
     *
     *  If you want to process the raw backend response use [rawGetData]{@link TaskResourceService#rawGetData} instead.
     *
     * @param taskId ID of the task who's data should be retrieved from the server
     * @returns processed data groups of the given task. If the task has no data an empty array will be returned.
     */
    public getData(taskId: string): Observable<Array<DataGroup>> {
        return this.rawGetData(taskId).pipe(
            map(responseArray => {
                if (!Array.isArray(responseArray)) {
                    return [];
                }
                const result = [];
                responseArray.forEach(dataGroupResource => {
                    const dataFields: Array<DataField<any>> = [];
                    if (!dataGroupResource.fields._embedded) {
                        return; // continue
                    }
                    const fields = [];
                    Object.keys(dataGroupResource.fields._embedded).forEach(localizedFields => {
                        fields.push(...dataGroupResource.fields._embedded[localizedFields]);
                    });
                    fields.sort((a, b) => a.order - b.order);
                    dataFields.push(...fields.map(dataFieldResource => this._fieldConverter.toClass(dataFieldResource)));
                    result.push({
                        fields: dataFields,
                        stretch: dataGroupResource.stretch,
                        title: dataGroupResource.title,
                        layout: dataGroupResource.layout,
                        alignment: dataGroupResource.alignment
                    });
                });
                return result;
            })
        );
    }

    /**
     * Set task data
     * POST
     */
    // {{baseUrl}}/api/task/:id/data
    public setData(taskId: string, body: TaskSetDataRequestBody): Observable<ChangedFieldContainer> {
        return this.provider.post$('task/' + taskId + '/data', this.SERVER_URL, body)
            .pipe(map(r => changeType(r, undefined)));
    }

    // ------------- FILE ------------
    /**
     * Download task file field value
     * GET
     */
    // {{baseUrl}}/api/task/:id/file/:field         - for file field
    // {{baseUrl}}/api/task/:id/file/:field/:name   - for file list field
    public downloadFile(taskId: string, fieldId: string, name?: string): Observable<ProviderProgress | Blob> {
        const url = !!name ? 'task/' + taskId + '/file/' + fieldId + '/' + name : 'task/' + taskId + '/file/' + fieldId;
        return this.provider.getBlob$(url, this.SERVER_URL).pipe(
            map(event => {
                switch (event.type) {
                    case HttpEventType.DownloadProgress:
                        return ResourceProvider.getProgress(event);
                    case HttpEventType.Response:
                        return event.body;
                    default:
                        return undefined;
                }
            }),
            filter(value => !!value)
        );
    }

    /**
     * Upload file into the task
     * POST
     */
    // {{baseUrl}}/api/task/:id/file/:field     - for file field
    // {{baseUrl}}/api/task/:id/files/:field    - for file list field
    public uploadFile(taskId: string, fieldId: string, body: object, multipleFiles: boolean):
        Observable<ProviderProgress | ChangedFieldContainer> {
        const url = !multipleFiles ? 'task/' + taskId + '/file/' + fieldId : 'task/' + taskId + '/files/' + fieldId;
        return this.provider.postWithEvent$<ChangedFieldContainer>(url, this.SERVER_URL, body).pipe(
            map(event => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        return ResourceProvider.getProgress(event);
                    case HttpEventType.Response:
                        return event.body;
                    default:
                        return undefined;
                }
            }),
            filter(value => !!value)
        );
    }

    /**
     * Delete file from the task
     * DELETE
     */
    public deleteFile(taskId: string, fieldId: string, name?: string): Observable<MessageResource> {
        const url = !!name ? 'task/' + taskId + '/file/' + fieldId + '/' + name : 'task/' + taskId + '/file/' + fieldId;
        return this.provider.delete$(url, this.SERVER_URL).pipe(
            map(r => changeType(r, undefined))
        );
    }
}