import {Component, OnInit} from '@angular/core';
import {TabContent} from '@netgrif/application-engine';
import {TabbedCaseViewComponent} from './tabbed-case-view/tabbed-case-view.component';
import {TabbedTaskViewComponent} from './tabbed-task-view/tabbed-task-view.component';
import {ReplaySubject} from 'rxjs';

@Component({
    selector: 'nae-app-tabbed-views-example',
    templateUrl: './tabbed-views-example.component.html',
    styleUrls: ['./tabbed-views-example.component.scss']
})
export class TabbedViewsExampleComponent implements OnInit {
    readonly TITLE = 'Tabbed Views';
    readonly DESCRIPTION = 'Ukážka integracie case-tab-task view';

    tabs: Array<TabContent>;

    constructor() {
        const stream = new ReplaySubject<number>(1);
        this.tabs = [
            {
                label: {
                    text: 'WRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
                    icon: 'storage',
                    count: stream
                },
                canBeClosed: false,
                tabContentComponent: TabbedCaseViewComponent,
                injectedObject: {
                    tabViewComponent: TabbedTaskViewComponent,
                    tabViewOrder: 0
                }
            }
        ];
        setTimeout(() => {
            stream.next(999999);
        }, 2000);
    }

    ngOnInit(): void {
    }

}