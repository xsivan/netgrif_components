/**
 * Service that handles the logic of FrontEnd event OPEN (expand) task.
 *
 * To by precise, this service handle creating, scheduling OPEN task event and handle returned outcome from BackEnd.
 * BUT ... it's all about procesing reaction bind to this event, and have NOTHING to do with real opening of task (with that action).
 */

import {Inject, Injectable, Optional} from "@angular/core";
import {TaskHandlingService} from "./task-handling-service";
import {LoggerService} from "../../logger/services/logger.service";
import {TaskResourceService} from "../../resources/engine-endpoint/task-resource.service";
import {SnackBarService} from "../../snack-bar/services/snack-bar.service";
import {TranslateService} from "@ngx-translate/core";
import {TaskRequestStateService} from "./task-request-state.service";
import {TaskEventService} from "../../task-content/services/task-event.service";
import {EventQueueService} from "../../event-queue/services/event-queue.service";
import {EventService} from "../../event/services/event.service";
import {ChangedFieldsService} from "../../changed-fields/services/changed-fields.service";
import {NAE_TASK_OPERATIONS} from "../models/task-operations-injection-token";
import {TaskOperations} from "../interfaces/task-operations";
import {SelectedCaseService} from "./selected-case.service";
import {TaskViewService} from "../../view/task-view/service/task-view.service";
import {TaskContentService} from "../../task-content/services/task-content.service";
import {AfterAction} from "../../utility/call-chain/after-action";
import {QueuedEvent} from "../../event-queue/model/queued-event";
import {take} from "rxjs/operators";
import {EventOutcomeMessageResource} from "../../resources/interface/message-resource";
import {ChangedFieldsMap} from "../../event/services/interfaces/changed-fields-map";
import {OpenTaskEventOutcome} from "../../event/model/event-outcomes/task-outcomes/open-task-event-outcome";
import {TaskEventOutcome} from "../../event/model/event-outcomes/task-outcomes/task-event-outcome";
import {createTaskEventNotification} from "../../task-content/model/task-event-notification";
import {TaskEvent} from "../../task-content/model/task-event";

@Injectable()
export class OpenTaskService extends TaskHandlingService {

    constructor(protected _log: LoggerService,
                protected _taskResourceService: TaskResourceService,
                protected _snackBar: SnackBarService,
                protected _translate: TranslateService,
                protected _taskState: TaskRequestStateService,
                protected _taskEvent: TaskEventService,
                protected _eventQueue: EventQueueService,
                protected _eventService: EventService,
                protected _changedFieldsService: ChangedFieldsService,
                @Inject(NAE_TASK_OPERATIONS) protected _taskOperations: TaskOperations,
                @Optional() _selectedCaseService: SelectedCaseService,
                @Optional() protected _taskViewService: TaskViewService,
                _taskContentService: TaskContentService) {
        super(_taskContentService, _selectedCaseService);
    }

    /**
     * Performs the 'opentask' event call.
     *
     * Doesn't send any requests if the loading indicator is in it's active state.
     * Otherwise sets the indicator to the active state and disables it once the request response is received.
     *
     * The argument can be used to chain operations together,
     * or to execute code conditionally based on the success state of the 'opentask' operation.
     *
     * If the task held within the {@link TaskContentService} changes before a response is received, the response will be ignored
     * and the `afterAction` will not be executed.
     * @param afterAction if 'opentask' completes successfully `true` will be emitted into this Subject, otherwise `false` will be emitted
     */
    public openTask(afterAction: AfterAction = new AfterAction()): void {
        this._eventQueue.scheduleEvent(new QueuedEvent(
            () => {
                return this.isTaskPresent();
            },
            nextEvent => {
                this.performOpenRequest(afterAction, nextEvent, this._taskViewService !== null && !this._taskViewService.allowMultiOpen);
            },
            nextEvent => {
                this.completeSuccess(afterAction, nextEvent);
            }
        ));
    }

    /**
     * Performs an `opentask` request on the task currently stored in the `taskContent` service
     * @param afterAction the action that should be performed after the request is processed
     * @param nextEvent indicates to the event queue that the next event can be processed
     * @param forceReload whether a force reload of the task data should be performed after 'opentask'.
     * If set to `false` a regular reload is performed instead.
     */
    protected performOpenRequest(afterAction: AfterAction, nextEvent: AfterAction, forceReload: boolean) {
        //Get id of task , on witch we want perfrom 'opentask' event
        const openedTaskId = this._safeTask.stringId;

        //Changes the state of the loading indicator to `true`
        this._taskState.startLoading(openedTaskId);

        //Calls the endpoint and processes the possible responses
        this.openRequest(afterAction, openedTaskId, nextEvent, forceReload);
    }

    /**
     * Calls the endpoint and processes the possible responses.
     * @param afterAction the action that should be performed after the request is processed
     * @param openedTaskId the id of the task that 'opentask' event should be called
     * @param nextEvent indicates to the event queue that the next event can be processed
     * @param forceReload whether a force reload of the task data should be performed after 'opentask'.
     * If set to `false` a regular reload is performed instead.
     */
    protected openRequest(afterAction: AfterAction = new AfterAction(),
                            openedTaskId: string,
                            nextEvent: AfterAction = new AfterAction(),
                            forceReload: boolean) {

        this._taskResourceService.openTask(this._safeTask.stringId).pipe(take(1))
            .subscribe((outcomeResource: EventOutcomeMessageResource) => {

                //The next part of code is run when NO error occured during 'opentask' event call
                //It still doesn't guarantee succesfull execution of 'opentask' event

                //Changes the state of the loading indicator to `false`
                this._taskState.stopLoading(openedTaskId);

                //Check if this task in this state is still relevant
                //If no, emits the resolution as false and completes
                if (!this.isTaskRelevant(openedTaskId)) {
                    this._log.debug('current task changed before the open task event response could be received, discarding...');
                    nextEvent.resolve(false);
                    return;
                }

                //Check if returned message from server is ERROR type or SUCCESS type
                if (outcomeResource.success) {
                    //Returned message is SUCCESS type, that means 'opentask' event execution was successfull

                    //Clears the assignee, start date and finish date from the managed Task
                    this._taskContentService.updateStateData(outcomeResource.outcome as OpenTaskEventOutcome);

                    //Convert outcome data from tree to map
                    const changedFieldsMap: ChangedFieldsMap = this._eventService
                        .parseChangedFieldsFromOutcomeTree(outcomeResource.outcome);

                    //If map of outcomes isnt empty, emmit outcome
                    if (!!changedFieldsMap) {
                        this._changedFieldsService.emitChangedFields(changedFieldsMap);
                    }

                    //Perform type of reload based on selected by forceReload param
                    forceReload ? this._taskOperations.forceReload() : this._taskOperations.reload();

                    //Complete all action streams and send notification with value 'true' (event execution successed)
                    //Add outcome to notfication
                    this.completeActions(afterAction, nextEvent, true, outcomeResource.outcome as OpenTaskEventOutcome);

                    //Show to user success snackbar with success message in current selected languge
                    this._snackBar.openSuccessSnackBar(!!outcomeResource.outcome.message
                        ? outcomeResource.outcome.message
                        : this._translate.instant('tasks.snackbar.openTaskSuccess'));
                } else if (outcomeResource.error) {
                    //Returned message is ERROR type, that means 'opentask' event execution failed

                    //If message contain any text, show it via error snackbar to user
                    if (outcomeResource.error !== '') {
                        this._snackBar.openErrorSnackBar(outcomeResource.error);
                    }

                    //If outcome is not undefined, parse outcome from tree to map and emit changed fields
                    if (outcomeResource.outcome !== undefined) {
                        const changedFieldsMap = this._eventService.parseChangedFieldsFromOutcomeTree(outcomeResource.outcome);
                        this._changedFieldsService.emitChangedFields(changedFieldsMap);
                    }

                    //Complete all action streams and send notification with value 'false' (event execution failed)
                    this.completeActions(afterAction, nextEvent, false);
                }

            }, error => {
                //The error part of code is run when error occured during 'opentask' event call
                //For example error 403 when actual user does not have right for this event on this task

                //Changes the state of the loading indicator to `false`
                this._taskState.stopLoading(openedTaskId);
                this._log.debug('open task failed', error);

                //Check if this task in this state is still relevant
                //If no, emits the resolution as false and completes
                if (!this.isTaskRelevant(openedTaskId)) {
                    this._log.debug('current task changed before the openTask event error could be received');
                    nextEvent.resolve(false);
                    return;
                }

                //Show to user error snackbar with error message in current selected languge
                this._snackBar.openErrorSnackBar(`${this._translate.instant('tasks.snackbar.openTask')}
                    ${this._taskContentService.task} ${this._translate.instant('tasks.snackbar.failed')}`);

                //Complete all action streams and send notification with value 'false'
                this.completeActions(afterAction, nextEvent, false);
            });
    }

    /**
     * Complete all action streams and send notification with selected boolean
     */
    protected completeActions(afterAction: AfterAction, nextEvent: AfterAction, bool: boolean, outcome?: TaskEventOutcome): void {
        this.sendNotification(bool, outcome);
        afterAction.resolve(bool);
        nextEvent.resolve(bool);
    }

    /**
     * Publishes a 'opentask' notification to the {@link TaskEventService}
     * @param success whether the cancel operation was successful or not
     * @param outcome
     */
    protected sendNotification(success: boolean, outcome?: TaskEventOutcome): void {
        this._taskEvent.publishTaskEvent(createTaskEventNotification(this._safeTask, TaskEvent.OPENTASK, success, outcome));
    }

    /**
     * Reloads the task and emits `true` to the `afterAction` stream
     */
    protected completeSuccess(afterAction: AfterAction, nextEvent: AfterAction): void {
        this._taskOperations.reload();
        this.completeActions(afterAction, nextEvent, true);
    }
}