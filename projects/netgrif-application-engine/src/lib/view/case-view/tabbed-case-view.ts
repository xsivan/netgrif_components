import {AbstractCaseView} from './abstract-case-view';
import {Inject, Type} from '@angular/core';
import {NAE_TAB_DATA} from '../../tabs/tab-data-injection-token/tab-data-injection-token.module';
import {InjectedTabData} from '../../tabs/interfaces';
import {Case} from '../../resources/interface/case';
import {LoggerService} from '../../logger/services/logger.service';
import {CaseViewService} from './service/case-view-service';
import {SimpleFilter} from '../../filter/models/simple-filter';
import {FilterType} from '../../filter/models/filter-type';

export interface InjectedTabbedCaseViewData extends InjectedTabData {
    tabViewComponent: Type<any>;
    tabViewOrder: number;
}

export abstract class TabbedCaseView extends AbstractCaseView {

    private readonly _correctlyInjected;

    protected constructor(caseViewService: CaseViewService,
                          protected _loggerService: LoggerService,
                          @Inject(NAE_TAB_DATA) protected _injectedTabData: InjectedTabbedCaseViewData,
                          protected _autoswitchToTaskTab: boolean = true,
                          protected _openExistingTab: boolean = true) {

        super(caseViewService);
        this._correctlyInjected = !!this._injectedTabData.tabViewComponent && this._injectedTabData.tabViewOrder !== undefined;
        if (!this._correctlyInjected) {
            this._loggerService.warn('TabbedCaseView must inject a filled object of type InjectedTabbedCaseViewData to work properly!');
        }
    }

    public handleCaseClick(clickedCase: Case): void {
        if (this._correctlyInjected) {
            this.openTab(clickedCase);
        }
    }

    public createNewCase(): void {
        const myCase = this._caseViewService.createNewCase();
        myCase.subscribe( kaze => {
            this.openTab(kaze);
        });
    }

    protected openTab(openCase: Case) {
        this._injectedTabData.tabViewRef.openTab({
            label: {
                text: openCase.title,
                icon: openCase.icon ? openCase.icon : 'check_box'
            },
            canBeClosed: true,
            tabContentComponent: this._injectedTabData.tabViewComponent,
            injectedObject: {
                baseFilter: new SimpleFilter('', FilterType.TASK, {case: `${openCase.stringId}`}),
                allowedNets: [openCase.processIdentifier]
            },
            order: this._injectedTabData.tabViewOrder,
            parentUniqueId: this._injectedTabData.tabUniqueId
        }, this._autoswitchToTaskTab, this._openExistingTab);
    }
}