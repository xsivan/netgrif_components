import {DataField} from '../../data-fields/models/abstract-data-field';
import {GridElementWithItem} from '../../utility/grid-layout/model/grid-element-with-item';

export interface DatafieldGridLayoutElement extends GridElementWithItem {
    item: DataField<any>;
    title?: string;
}