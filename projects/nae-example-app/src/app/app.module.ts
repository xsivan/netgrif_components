import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {
    AdministrationModule,
    AuthenticationModule,
    CaseViewModule,
    ConfigurationService,
    CovalentModule,
    DashboardModule,
    DataFieldsModule,
    DialogModule,
    ForgottenPasswordFormModule,
    HeaderModule,
    LoginFormModule,
    MaterialModule,
    NavigationModule,
    PanelModule,
    ProfileModule,
    QuickPanelModule,
    RegistrationFormModule,
    ResourceProvider,
    SearchModule,
    SideMenuContentModule,
    SideMenuModule,
    SignUpModule,
    SnackBarModule,
    TabsModule,
    ToolbarModule,
    UserModule,
    WorkflowViewModule,
    ViewService,
    TreeCaseViewModule,
    NAE_SNACKBAR_HORIZONTAL_POSITION,
    NAE_SNACKBAR_VERTICAL_POSITION,
    SnackBarHorizontalPosition,
    SnackBarVerticalPosition
} from '@netgrif/application-engine';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule, FlexModule} from '@angular/flex-layout';
import {DocumentationComponent} from './doc/documentation/documentation.component';
import {NaeExampleAppConfigurationService} from './nae-example-app-configuration.service';
import {AuthenticationComponent} from './doc/authentication/authentication.component';
import {DrawerExampleComponent} from './doc/drawer-example/drawer-example.component';
import {RailExampleComponent} from './doc/rail-example/rail-example.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {SidemenuExampleComponent} from './doc/sidemenu-example/sidemenu-example.component';
import {SnackBarExampleComponent} from './doc/snack-bar-example/snack-bar-example.component';
import {DialogExampleComponent} from './doc/dialog-example/dialog-example.component';
import {TabViewExampleComponent} from './doc/tab-view-example/tab-view-example.component';
import {ContentComponent} from './doc/tab-view-example/content/content.component';
import {ReactiveTextFieldComponent} from './doc/reactive-text-field/reactive-text-field.component';
import {ToolbarExampleComponent} from './doc/toolbar-example/toolbar-example.component';
import {CaseViewComponent} from './doc/case-view/case-view.component';
import {TranslateLoader, TranslateModule, TranslatePipe, TranslateService, TranslateStore} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TaskViewComponent} from './doc/task-view/task-view.component';
import {TabbedCaseViewComponent} from './doc/tabbed-case-view/tabbed-case-view/tabbed-case-view.component';
import {TabbedViewsExampleComponent} from './doc/tabbed-case-view/tabbed-views-example.component';
import {TabbedTaskViewComponent} from './doc/tabbed-case-view/tabbed-task-view/tabbed-task-view.component';
import {WorkflowViewExampleComponent} from './doc/workflow-view-example/workflow-view-example.component';
import {LoginFormComponent} from './doc/forms/login-form/login-form.component';
import {PasswordFormComponent} from './doc/forms/password-form/password-form.component';
import {RegisterFormComponent} from './doc/forms/register-form/register-form.component';
import {HeadersComponent} from './doc/headers/headers.component';
import {PanelsComponent} from './doc/panels/panels.component';
import {DashboardExampleComponent} from './doc/dashboard-example/dashboard-example.component';
import {FilterRepositoryExampleComponent} from './doc/filter-repository-example/filter-repository-example.component';
import {ProfileComponent} from './doc/profile/profile.component';
import {NavigationExampleComponent} from './doc/navigation-example/navigation-example.component';
import {ButtonsNavComponent} from './doc/navigation-example/buttons-nav/buttons-nav.component';
import {RolesAssignComponent} from './doc/roles-assign/roles-assign.component';
import {NaeExampleAppViewService} from './nae-example-app-view.service';
import {TreeViewExampleComponent} from './doc/tree-view-example/tree-view-example.component';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
        DocumentationComponent,
        AuthenticationComponent,
        DrawerExampleComponent,
        RailExampleComponent,
        SidemenuExampleComponent,
        SnackBarExampleComponent,
        DialogExampleComponent,
        TabViewExampleComponent,
        ReactiveTextFieldComponent,
        ToolbarExampleComponent,
        TaskViewComponent,
        CaseViewComponent,
        TabbedCaseViewComponent,
        TabbedViewsExampleComponent,
        TabbedTaskViewComponent,
        WorkflowViewExampleComponent,
        ContentComponent,
        LoginFormComponent,
        PasswordFormComponent,
        RegisterFormComponent,
        HeadersComponent,
        PanelsComponent,
        DashboardExampleComponent,
        FilterRepositoryExampleComponent,
        ProfileComponent,
        NavigationExampleComponent,
        ButtonsNavComponent,
        RolesAssignComponent,
        TreeViewExampleComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexModule,
        FlexLayoutModule,
        MaterialModule,
        CovalentModule,
        AuthenticationModule,
        SignUpModule,
        HttpClientModule,
        MatIconModule,
        UserModule,
        QuickPanelModule,
        NavigationModule,
        SideMenuModule,
        PanelModule,
        DialogModule,
        TabsModule,
        DataFieldsModule,
        HeaderModule,
        DataFieldsModule,
        ToolbarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        }),
        MatCardModule,
        WorkflowViewModule,
        DashboardModule,
        LoginFormModule,
        ForgottenPasswordFormModule,
        RegistrationFormModule,
        SearchModule,
        SideMenuContentModule,
        ProfileModule,
        SnackBarModule,
        CaseViewModule,
        MatButtonModule,
        MatSidenavModule,
        AdministrationModule,
        HeaderModule,
        CaseViewModule,
        PanelModule,
        TreeCaseViewModule,
        MatProgressSpinnerModule,
        DashboardModule,
    ],
    entryComponents: [
        ContentComponent,
        TabbedCaseViewComponent,
        TabbedTaskViewComponent,
        AuthenticationComponent,
        LoginFormComponent,
        PasswordFormComponent,
        RegisterFormComponent,
        DrawerExampleComponent,
        RailExampleComponent,
        HeadersComponent,
        SidemenuExampleComponent,
        SnackBarExampleComponent,
        DialogExampleComponent,
        TabViewExampleComponent,
        ReactiveTextFieldComponent,
        ToolbarExampleComponent,
        PanelsComponent,
        TaskViewComponent,
        CaseViewComponent,
        TabbedViewsExampleComponent,
        WorkflowViewExampleComponent,
        DashboardExampleComponent,
        FilterRepositoryExampleComponent,
        ProfileComponent,
        NavigationExampleComponent,
        ButtonsNavComponent,
        RolesAssignComponent,
        TreeViewExampleComponent
    ],
    providers: [{
        provide: ConfigurationService,
        useClass: NaeExampleAppConfigurationService
    },
        {provide: NAE_SNACKBAR_VERTICAL_POSITION, useValue: SnackBarVerticalPosition.TOP },
        {provide: NAE_SNACKBAR_HORIZONTAL_POSITION, useValue: SnackBarHorizontalPosition.LEFT },
        ResourceProvider,
        TranslateService,
        TranslatePipe,
        TranslateStore,
        {provide: ViewService, useClass: NaeExampleAppViewService},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}