import {Component, Inject} from '@angular/core';
import {FileField} from '../../../data-fields/file-field/models/file-field';
import {FileFieldService} from '../../../data-fields/file-field/services/file-field.service';
import {NAE_SIDE_MENU_CONTROL} from '../../side-menu-injection-token.module';
import {SideMenuControl} from '../../models/side-menu-control';
import {FileUploadModel} from './models/file-upload-model';

/**
 * Create and bind to [SideMenuContainerComponent]{@link SideMenuContainerComponent} via `Portal`
 * after click on file field in task panel.
 */
@Component({
    selector: 'nae-files-upload',
    templateUrl: './files-upload.component.html',
    styleUrls: ['./files-upload.component.scss']
})
export class FilesUploadComponent {

    /**
     * Holds all information from a Petri Net.
     */
    public fileField: FileField;
    /**
     * Array all choose files in file field.
     */
    public allFiles: Array<FileUploadModel> = [];

    private readonly _fileFieldService: FileFieldService;

    /**
     * Set allFiles and fileField variables from [FileFieldService]{@link FileFieldService}.
     * @param injectedData Representing FileFieldService send from FileFieldComponent
     */
    constructor(@Inject(NAE_SIDE_MENU_CONTROL) injectedData: SideMenuControl) {
        this._fileFieldService = injectedData.data as FileFieldService;
        this.allFiles = this._fileFieldService.allFiles;
        this.fileField = this._fileFieldService.fileField;
    }

    /**
     * Click on add file or files button begin upload file from file picker and upload it.
     */
    public onFileUpload() {
        this._fileFieldService.fileUpload(null);
    }

    /**
     * Accessible only if is zipping mode on.
     *
     * Click on send button call [onSend()]{@link FileFieldService#onSend()} function to send all zipped files to backend.
     */
    public onSend() {
        this._fileFieldService.onSend();
    }

    get fileFieldService(): FileFieldService {
        return this._fileFieldService;
    }
}