import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {RoleAssignmentService} from './services/role-assignment.service';
import {ProcessList, ProcessRole, ProcessVersion} from './services/ProcessList';
import {UserService} from '../../user/services/user.service';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {UserListItem, UserListService} from '../../user/services/user-list.service';
import {MatSelectionList} from '@angular/material/list';

@Component({
    selector: 'nae-role-assignment',
    templateUrl: './role-assignment.component.html',
    styleUrls: ['./role-assignment.component.scss'],
    providers: [
        RoleAssignmentService
    ]
})
export class RoleAssignmentComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('userList') public userList: MatSelectionList;
    @ViewChild(CdkVirtualScrollViewport) public viewport: CdkVirtualScrollViewport;

    public users: UserListService;
    public nets: ProcessList;
    public userMultiSelect: boolean;
    public searchUserControl = new FormControl();
    private SEARCH_DEBOUNCE_TIME = 200;

    constructor(private _service: RoleAssignmentService, private _userService: UserService) {
        this.users = this._service.userList;
        this.nets = this._service.processList;
        this.userMultiSelect = true;
    }

    ngOnInit(): void {
        this.nets.loadProcesses();
        this.searchUserControl.valueChanges.pipe(debounceTime(this.SEARCH_DEBOUNCE_TIME)).subscribe(searchText => {
            this.users.reload(searchText);
        });
    }

    ngAfterViewInit(): void {
        this.users.usersReload$.subscribe(() => {
            this.userList.deselectAll();
            this.userList.selectedOptions.clear();
            this.autoSelectRoles();
        });
    }

    ngOnDestroy(): void {
        this._userService.reload();
    }

    public loadNextUserPage(): void {
        if (!this.viewport) {
            return;
        }
        this.users.nextPage(this.viewport.getRenderedRange().end, this.viewport.getDataLength());
    }

    public autoSelectRoles(): void {
        const all = this.userList.selectedOptions.selected.map(option => (option.value as UserListItem).roles);
        if (all.length === 0) {
            this.nets.selectRoles(new Set<string>([]));
        }
        const intersection = all.reduce((acc, curr) => new Set([...acc].filter(s => curr.has(s))), all[0]);
        this.nets.selectRoles(intersection);
    }

    public update(role: ProcessRole): void {
        this.nets.updateSelectedRoles(role);
        const selected = this.userList.selectedOptions.selected.map(option => (option.value as UserListItem));
        this.users.updateRoles(selected, this.nets.selectedRoles).subscribe(_ => {
            this.autoSelectRoles();
        });
    }

    public selectAllUsers(select: boolean): void {
        this.userList.options.forEach(option => {
            (option.value as UserListItem).selected = select;
        });
        this.autoSelectRoles();
    }

    public toggleAllRoles(net: ProcessVersion, select: boolean): void {
        net.roles.forEach(r => {
            r.selected = select;
            this.nets.updateSelectedRoles(r);
        });
        const selected = this.userList.selectedOptions.selected.map(option => (option.value as UserListItem));
        this.users.updateRoles(selected, this.nets.selectedRoles).subscribe(_ => {
            this.autoSelectRoles();
        });
    }
}