import {AfterViewInit, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../../user/models/user';
import 'hammerjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatDrawerToggleResult, MatSidenav} from '@angular/material/sidenav';
import {LoggerService} from '../../logger/services/logger.service';
import {Subscription} from 'rxjs';

export abstract class AbstractNavigationDrawerComponent implements OnInit, AfterViewInit, OnDestroy {


    @Input('user') public showUser: boolean;
    @Input('userObject') public user: User;
    @Input('quickPanel') public showQuickPanel: boolean;
    @Input('panelItems') public quickPanelItems: Array<any>; // QuickPanelItem
    @Input() public navigation: boolean;

    @Output() public openedChange: EventEmitter<boolean>;

    @ViewChild('sidenav') protected _sideNav: MatSidenav;

    public opened: boolean;
    protected _fixed: boolean;
    protected subBreakpoint: Subscription;

    protected _config = {
        mode: 'over',
        opened: false,
        disableClose: false
    };

    constructor(protected breakpoint: BreakpointObserver, protected _log: LoggerService) {
        this.openedChange = new EventEmitter<boolean>();
        this._fixed = true;
        this.opened = true;
        this.quickPanelItems = ['language', 'settings', 'logout'];
    }

    ngOnInit(): void {
        this.resolveLayout(this._fixed);
        this.subBreakpoint = this.breakpoint.observe([Breakpoints.HandsetLandscape]).subscribe( result => {
            this._log.info('BreakpointObserver matches width of window: ' + this.breakpoint.isMatched('(max-width: 959.99px)'));
            if (this.breakpoint.isMatched('(max-width: 959.99px)')) {
                this.resolveLayout(false);
                this.opened = this._config.opened;
            } else {
                this.resolveLayout(this._fixed);
                this.opened = this._config.opened;
            }
        });
        this.opened = this._config.opened;
    }

    ngAfterViewInit(): void {
        this.openedChange = this._sideNav.openedChange;
    }

    ngOnDestroy(): void {
        this.subBreakpoint.unsubscribe();
    }

    get config() {
        return this._config;
    }

    get fixed(): boolean {
        return this._fixed;
    }

    @Input('fixed')
    set fixed(value: boolean) {
        this._fixed = value;
        this.resolveLayout(this._fixed);
    }

    open(): Promise<MatDrawerToggleResult> {
        if (this._fixed) {
            return Promise.resolve('open');
        }
        return this._sideNav.open();
    }

    close(): Promise<MatDrawerToggleResult> {
        if (this._fixed) {
            return Promise.resolve('open');
        }
        return this._sideNav.close();
    }

    toggle(): Promise<MatDrawerToggleResult> {
        if (this._fixed) {
            return Promise.resolve('open');
        }
        return this._sideNav.toggle();
    }

    private resolveLayout(bool: boolean): void {
        this._config = bool ? {
            mode: 'side',
            opened: true,
            disableClose: true
        } : {
            mode: 'over',
            opened: false,
            disableClose: false
        };
        if (bool && this._sideNav) {
            this._sideNav.open();
        }
    }

    swipeRight() {
        if (this.breakpoint.isMatched('(max-width: 959.99px)')) {
            this._sideNav.open();
        }
    }

    swipeLeft() {
        if (this.breakpoint.isMatched('(max-width: 959.99px)')) {
            this._sideNav.close();
        }
    }
}