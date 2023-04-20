/**
 * Service that handles the logic of FrontEnd event open (expand) task.
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

    public openTask(afterAction: AfterAction = new AfterAction()): void {

        console.log("OPEN -> Open task");

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

    protected performOpenRequest(afterAction: AfterAction, nextEvent: AfterAction, forceReload: boolean) {

        console.log("OPEN - > perform request");

        const openedTaskId = this._safeTask.stringId;

        // this is probably no longer necessary because of the event queue
        if (this._taskState.isLoading(openedTaskId)) {
            nextEvent.resolve(true);
            return;
        }

        this._taskState.startLoading(openedTaskId);
        this.openRequest(afterAction, openedTaskId, nextEvent, forceReload);
    }

    protected openRequest(afterAction: AfterAction = new AfterAction(),
                            openedTaskId: string,
                            nextEvent: AfterAction = new AfterAction(),
                            forceReload: boolean) {

        this._taskResourceService.openTask(this._safeTask.stringId).pipe(take(1))
            .subscribe((outcomeResource: EventOutcomeMessageResource) => {

                console.log("OPEN - > open request");

                this._taskState.stopLoading(openedTaskId);
                if (!this.isTaskRelevant(openedTaskId)) {
                    this._log.debug('current task changed before the open response could be received, discarding...');
                    nextEvent.resolve(false);
                    return;
                }

                if (outcomeResource.success) {
                    this._taskContentService.updateStateData(outcomeResource.outcome as OpenTaskEventOutcome);
                    const changedFieldsMap: ChangedFieldsMap = this._eventService
                        .parseChangedFieldsFromOutcomeTree(outcomeResource.outcome);
                    if (!!changedFieldsMap) {
                        this._changedFieldsService.emitChangedFields(changedFieldsMap);
                    }
                    forceReload ? this._taskOperations.forceReload() : this._taskOperations.reload();
                    this.completeActions(afterAction, nextEvent, true, outcomeResource.outcome as OpenTaskEventOutcome);
                    this._snackBar.openSuccessSnackBar(!!outcomeResource.outcome.message
                        ? outcomeResource.outcome.message
                        : this._translate.instant('tasks.snackbar.openTaskSuccess'));
                } else if (outcomeResource.error) {
                    if (outcomeResource.error !== '') {
                        this._snackBar.openErrorSnackBar(outcomeResource.error);
                    }
                    if (outcomeResource.outcome !== undefined) {
                        const changedFieldsMap = this._eventService.parseChangedFieldsFromOutcomeTree(outcomeResource.outcome);
                        this._changedFieldsService.emitChangedFields(changedFieldsMap);
                    }
                    this.completeActions(afterAction, nextEvent, false);
                }

            }, error => {
                this._taskState.stopLoading(openedTaskId);
                this._log.debug('open task failed', error);

                if (!this.isTaskRelevant(openedTaskId)) {
                    this._log.debug('current task changed before the openTask error could be received');
                    nextEvent.resolve(false);
                    return;
                }

                this._snackBar.openErrorSnackBar(`${this._translate.instant('tasks.snackbar.openTask')}
             ${this._taskContentService.task} ${this._translate.instant('tasks.snackbar.failed')}`);
                this.completeActions(afterAction, nextEvent, false);
            });
    }

    protected completeActions(afterAction: AfterAction, nextEvent: AfterAction, bool: boolean, outcome?: TaskEventOutcome): void {
        this.sendNotification(bool, outcome);
        afterAction.resolve(bool);
        nextEvent.resolve(bool);
    }

    protected sendNotification(success: boolean, outcome?: TaskEventOutcome): void {
        this._taskEvent.publishTaskEvent(createTaskEventNotification(this._safeTask, TaskEvent.OPENTASK, success, outcome));
    }

    protected completeSuccess(afterAction: AfterAction, nextEvent: AfterAction): void {
        this._taskOperations.reload();
        this.completeActions(afterAction, nextEvent, true);
    }
}
