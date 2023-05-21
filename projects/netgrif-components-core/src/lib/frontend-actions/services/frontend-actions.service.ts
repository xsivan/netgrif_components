import {Change, ChangedFields} from "../../data-fields/models/changed-fields";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../dialog/models/DialogData";
import {AlertDialogComponent} from "../../dialog/components/alert-dialog/alert-dialog.component";
import {DialogResult} from "../../dialog/models/DialogResult";
import {Injectable} from "@angular/core";
import {Action} from "rxjs/internal/scheduler/Action";

/**
 * Enum that represent all supported frontend actions
 */
enum FrontendActionType {
    openDialog = "OPEN_DIALOG"
}

/**
 * Service recognize and handle frontend actions.
 */
@Injectable()
export class FrontendActionsService {

    constructor(private dialog: MatDialog) {}

    /**
     * Loop array from input and find chngedFields instances, where key start with prefix 'EMPTY_'.
     * This instances (that are probably only frontend actions), try recognize and then execute relevant code in function.
     *
     * @param changedFields input array of ChangedFields instances that may contain frontend actions to handle
     */
    public filterAndHandleFrontendActions(changedFields: Array<ChangedFields>) {
        //Check if array isnt null or empty
        if(changedFields != null && changedFields.length > 0) {
            //Loop all values
            changedFields.forEach(a => {
                Object.keys(a).filter(k => {
                    //Check if key start with prefix "EMPTY_"
                    if(k.startsWith("EMPTY_")) {
                        //If yes, call next function to recognize this frontend action
                        this.recognizeFrontendActions(a[k]);
                    }
                });
            });
        }
    }

    /**
     * Verify if actio from input is really frontend action and then recognize action and call relevant code in function to be executed.
     *
     * @param action, possible frontend action
     */
    private recognizeFrontendActions(action: Change) {
        //Check if action instance isnt null
        if(action == null) return;

        //Check if if its really frontend action (mut contain isOnlyFrontEndAction param set as true)
        if(action['isOnlyFrontEndAction'] == null || action['isOnlyFrontEndAction'] == false) return;

        //Obtain frontend action type
        const frontEndActionTypeValue = action['frontEndActionType'];

        //Check if obtained type is null
        if(frontEndActionTypeValue == null) return;

        //Use switch to recognize frontEndActionType by comparint to all FrontendActionType enum  values
        //If action is recognized, call neccessary code to be execute
        switch (frontEndActionTypeValue) {
            case FrontendActionType.openDialog:
                this.openDialogWindow(action['dialogTitle'], action['dialogContent']);
                break;
            default:
                break;
        }
    }

    /**
     * Show dialog window to user, based on input params.
     *
     * @param title, string value representing dialog window title (text in header)
     * @param content, string value representing dialog window text in body
     */
    public openDialogWindow(title: string, content: string, configMatDialog?: MatDialogConfig<DialogData>): MatDialogRef<AlertDialogComponent, DialogResult> {
        //First check if params from input arent null
        if(title == null || content == null) return;

        //Use Angular MatDialog to show dialog window
        return this.dialog.open<AlertDialogComponent, DialogData, DialogResult>(AlertDialogComponent,
            Object.assign({
                data: {
                    title,
                    content
                }
            }, configMatDialog)
        );
    }
}
