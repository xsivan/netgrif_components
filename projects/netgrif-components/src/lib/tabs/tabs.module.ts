import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TabViewComponent} from './tab-view/tab-view.component';
import {MatTabsModule} from '@angular/material/tabs';
import {TabCreationDetectorComponent} from './tab-creation-detector/tab-creation-detector.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '@netgrif/application-engine';


@NgModule({
    declarations: [
        TabViewComponent,
        TabCreationDetectorComponent,
    ],
    exports: [
        TabViewComponent,
    ],
    imports: [
        CommonModule,
        MatTabsModule,
        MaterialModule,
        FlexLayoutModule,
    ]
})
export class TabsComponentModule {
}