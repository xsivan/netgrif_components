import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NAE_SIDE_MENU_CONTROL} from '../../side-menu-injection-token.module';
import {SideMenuControl} from '../../models/side-menu-control';
import {Observable, of, Subject} from 'rxjs';
import {ConfigurationService} from '../../../configuration/configuration.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestConfigurationService} from '../../../utility/tests/test-config';
import {SideMenuImportNetModule} from './side-menu-import-net.module';
import {ImportNetComponent} from './import-net.component';
import {PetriNetResourceService} from '../../../resources/engine-endpoint/petri-net-resource.service';
import {TranslateLibModule} from '../../../translate/translate-lib.module';
import {ErrorSnackBarComponent} from '../../../snack-bar/components/error-snack-bar/error-snack-bar.component';
import {SuccessSnackBarComponent} from '../../../snack-bar/components/success-snack-bar/success-snack-bar.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {MatIconModule} from '@angular/material/icon';

describe('ImportNetComponent', () => {
    let component: ImportNetComponent;
    let fixture: ComponentFixture<ImportNetComponent>;
    let sideMenuCloseSpy: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                SideMenuImportNetModule,
                HttpClientTestingModule,
                NoopAnimationsModule,
                TranslateLibModule,
                MatIconModule,
            ],
            providers: [{
                    provide: NAE_SIDE_MENU_CONTROL,
                    useValue: new SideMenuControl(() => {}, new Observable<boolean>(), null)
                },
                {provide: ConfigurationService, useClass: TestConfigurationService},
                {provide: PetriNetResourceService, useClass: MyPetriNetResource}
            ],
            declarations: [
                ErrorSnackBarComponent,
                SuccessSnackBarComponent
            ],
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [
                    ErrorSnackBarComponent,
                    SuccessSnackBarComponent
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportNetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        sideMenuCloseSpy = spyOn(TestBed.inject(NAE_SIDE_MENU_CONTROL), 'close');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test functions', () => {
        component.onProcessFileChosen();
        component.retryFile({
            data: new File([], 'name'),  stringId: '', downloading: false,
            inProgress: false, progress: 0, completed: true,
        });
        component.cancelFile({
            data: new File([], 'name'), stringId: '', downloading: false,
            inProgress: false, progress: 0, completed: true, sub: new Subject().subscribe()
        });
        component.close();
        expect(sideMenuCloseSpy).toHaveBeenCalled();
    });

    afterAll(() => {
        TestBed.resetTestingModule();
    });
});

class MyPetriNetResource {
    importPetriNet(file) {
       return of({success: 'success'});
    }
}
