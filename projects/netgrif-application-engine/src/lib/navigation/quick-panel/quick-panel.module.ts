import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QuickPanelComponent} from './components/quick-panel.component';
import {LogoutShortcutComponent} from './components/logout-shortcut/logout-shortcut.component';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';
import {InternalLinkComponent} from './components/internal-link/internal-link.component';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../material/material.module';
import {TranslateLibModule} from '../../translate/translate-lib.module';


@NgModule({
    declarations: [
        QuickPanelComponent,
        LogoutShortcutComponent,
        LanguageSelectorComponent,
        InternalLinkComponent
    ],
    exports: [
        QuickPanelComponent,
        LogoutShortcutComponent,
        LanguageSelectorComponent,
        InternalLinkComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MaterialModule,
        TranslateLibModule
    ]
})
export class QuickPanelModule {
}