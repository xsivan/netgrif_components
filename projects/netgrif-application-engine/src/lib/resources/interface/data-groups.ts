import {Fields} from './fields';
import {DataField} from '../../data-fields/models/abstract-data-field';
import {DataGroupLayout} from './data-group-layout';

/**
 * Object from Backend
 */
export interface DataGroupsResource {
    fields: Fields;
    /**
     * Name datagroup
     */
    title: string;
    /**
     * Desing alignment
     * ***Example:*** start
     */
    alignment: string;
    /**
     * Desing stretch
     *
     * ***Example:*** true
     */
    stretch: boolean;
    layout?: DataGroupLayout;
}

/**
 * Object from Backend
 */
export interface DataGroup {
    /**
     * Array [DataField]{@link DataField}
     */
    fields: Array<DataField<any>>;
    /**
     * Name datagroup
     */
    title: string;
    /**
     * Desing alignment
     * ***Example:*** start
     */
    alignment: string;
    /**
     * Desing stretch
     *
     * ***Example:*** true
     */
    stretch: boolean;
    layout?: DataGroupLayout;
}