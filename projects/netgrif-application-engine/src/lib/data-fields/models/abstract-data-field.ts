import {Behavior} from './behavior';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';
import {Change} from './changed-fields';
import {distinctUntilChanged} from 'rxjs/operators';
import {Layout} from './layout';
import {ConfigurationService} from '../../configuration/configuration.service';

/**
 * Holds the logic common to all data field Model objects.
 * @typeparam T - type of the `value` property of the data field
 */
export abstract class DataField<T> {
    /**
     * @ignore
     * Current value of the data field
     */
    private _value: BehaviorSubject<T>;
    /**
     * @ignore
     * Whether the data field Model object was initialized.
     *
     * See [registerFormControl()]{@link DataField#registerFormControl} for more information.
     */
    private _initialized: boolean;
    /**
     * @ignore
     * Whether the field fulfills all of it's validators.
     */
    private _valid: boolean;
    /**
     * @ignore
     * Whether the `value` of the field changed recently. The flag is cleared when changes are received from backend.
     */
    private _changed: boolean;
    /**
     * @ignore
     * Data field subscribes this stream.
     * The data field updates it's Validators, validity and enabled/disabled according to it's behavior.
     */
    private _update: Subject<void>;
    /**
     * @ignore
     * Data field subscribes this stream. When a `true` value is received the data field disables itself.
     * When a `false`value is received data field disables/enables itself based on it's behavior.
     */
    private _block: Subject<boolean>;
    /**
     * @ignore
     * Data field subscribes this stream. Sets the state of the data field to "touched" or "untouched" (`true`/`false`).
     * Validity of the data field is not checked in an "untouched" state.
     * All fields are touched before a task is finished to check their validity.
     */
    private _touch: Subject<boolean>;
    /**
     * @ignore
     * Appearance of dataFields, possible values - outline, standard, fill, legacy
     */
    public materialAppearance: string;
    /**
     * @param _stringId - ID of the data field from backend
     * @param _title - displayed title of the data field from backend
     * @param initialValue - initial value of the data field
     * @param _behavior - data field behavior
     * @param _placeholder - placeholder displayed in the datafield
     * @param _description - tooltip of the datafield
     * @param _layout - information regarding the component rendering
     */
    protected constructor(private _stringId: string, private _title: string, initialValue: T,
                          private _behavior: Behavior, private _placeholder?: string,
                          private _description?: string, private _layout?: Layout) {
        this._value = new BehaviorSubject<T>(initialValue);
        this._initialized = false;
        this._valid = true;
        this._changed = false;
        this._update = new Subject<void>();
        this._block = new Subject<boolean>();
        this._touch = new Subject<boolean>();
    }

    get stringId(): string {
        return this._stringId;
    }

    set title(title: string) {
        this._title = title;
    }

    get title(): string {
        return this._title;
    }

    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
    }

    get placeholder(): string {
        return this._placeholder;
    }

    set description(desc: string) {
        this._description = desc;
    }

    get description(): string {
        return this._description;
    }

    set behavior(behavior: Behavior) {
        this._behavior = behavior;
    }

    get behavior(): Behavior {
        return this._behavior;
    }

    get value(): T {
        return this._value.getValue();
    }

    set value(value: T) {
        if (!this.valueEquality(this._value.getValue(), value)) {
            this._changed = true;
        }
        this._value.next(value);
    }

    set layout(layout: Layout) {
        this._layout = layout;
    }

    get layout(): Layout {
        return this._layout;
    }

    get disabled(): boolean {
        return !!this._behavior.visible && !this._behavior.editable;
    }

    get initialized(): boolean {
        return this._initialized;
    }

    get valid(): boolean {
        return this._valid;
    }

    set changed(set: boolean) {
        this._changed = set;
    }

    get changed(): boolean {
        return this._changed;
    }

    set block(set: boolean) {
        this._block.next(set);
    }

    set touch(set: boolean) {
        this._touch.next(set);
    }

    public update(): void {
        this._update.next();
    }

    public valueChanges(): Observable<T> {
        return this._value.asObservable();
    }

    public registerFormControl(formControl: FormControl): void {
        formControl.valueChanges.pipe(
            distinctUntilChanged(this.valueEquality)
        ).subscribe(newValue => {
            this._valid = this._determineFormControlValidity(formControl);
            this.value = newValue;
        });
        this._value.pipe(
            distinctUntilChanged(this.valueEquality)
        ).subscribe(newValue => {
            this._valid = this._determineFormControlValidity(formControl);
            formControl.setValue(newValue);
        });
        this.updateFormControlState(formControl);
        this._initialized = true;
        this._changed = false;
    }

    public updateFormControlState(formControl: FormControl): void {
        this._update.subscribe(() => {
            this.disabled ? formControl.disable() : formControl.enable();
            formControl.clearValidators();
            formControl.setValidators(this.resolveFormControlValidators());
            formControl.updateValueAndValidity();
            this._valid = this._determineFormControlValidity(formControl);
        });
        this._block.subscribe(bool => {
            if (bool) {
                formControl.disable();
            } else {
                this.disabled ? formControl.disable() : formControl.enable();
            }
        });
        this._touch.subscribe(bool => {
            if (bool) {
                formControl.markAsTouched();
            } else {
                formControl.markAsUntouched();
            }
        });
        this.update();
        formControl.setValue(this.value);
        this._valid = this._determineFormControlValidity(formControl);
    }

    /**
     * Computes whether the FormControl si valid.
     * @param formControl check form control
     */
    protected _determineFormControlValidity(formControl: FormControl): boolean {
        // disabled form controls are marked as invalid as per W3C standard, this solves that problem
        return formControl.disabled || formControl.valid;
    }

    /**
     * Creates Validator objects based on field `behavior`. Only the `required` behavior is resolved by default.
     * Required is resolved as `Validators.required`.
     * If you need to resolve additional Validators or need a different resolution for the `required` Validator override this method.
     *
     * See {@link Behavior} for information about data field behavior.
     *
     * See {@link ValidatorFn} and {@link Validators} for information about Validators.
     *
     * Alternatively see [Form Validation guide]{@link https://angular.io/guide/form-validation#reactive-form-validation} from Angular.
     */
    protected resolveFormControlValidators(): Array<ValidatorFn> {
        const result = [];
        if (this.behavior.required) {
            result.push(Validators.required);
        }
        return result;
    }

    /**
     * Determines if two values of the data field are equal.
     *
     * `a === b` equality is used by default. If you want different behavior override this method.
     * @param a - first compared value
     * @param b - second compared value
     */
    protected valueEquality(a: T, b: T): boolean {
        return a === b;
    }

    /**
     * Updates the state of this data field model object.
     * @param change - object describing the changes - returned from backend
     *
     * Also see {@link ChangedFields}.
     */
    public applyChange(change: Change): void {
        Object.keys(change).forEach(changedAttribute => {
            switch (changedAttribute) {
                case 'value':
                    this.value = change[changedAttribute];
                    break;
                case 'behavior':
                    Object.assign(this.behavior, change[changedAttribute]);
                    this.update();
                    break;
                default:
                    throw new Error(`Unknown attribute '${changedAttribute}' in change object`);
            }
        });
    }

    public resolveAppearance(config: ConfigurationService): void {
        let appearance = 'outline';
        if (config.get().services && config.get().services.dataFields && config.get().services.dataFields.appearance) {
            appearance = config.get().services.dataFields.appearance;
        }
        if (this.layout && this.layout.appearance) {
            appearance = this.layout.appearance;
        }
        this.materialAppearance = appearance;
    }
}