import {Injector, Input, OnInit} from '@angular/core';
import {Filter} from '../../../filter/models/filter';
import {CustomCard} from '../model/custom-card';
import {DashboardCardTypes} from '../model/dashboard-card-types';
import {AbstractCustomCardResourceService} from './abstract-custom-card-resource-service';
import {TranslateService} from '@ngx-translate/core';

export abstract class AbstractCustomCard implements OnInit {

    @Input() public card: CustomCard;
    protected _filter: Filter;
    public loading: boolean;

    public count: number;
    public margin: number[] = [0, 0, 0, 0];

    public value = 50;
    public data: [];

    /* Data holder for graphs with 2D data array, eg.: Pie Chart*/
    @Input() public single: any[];

    /* Data holder for graphs with multiple 2D data array, eg.: BarChart, LineChart*/
    public multi: any[];

    public showLegend = true;
    public showLabels = true;
    public animations = true;

    public xAxis = true;
    public yAxis = true;
    public showYAxisLabel = true;
    public showXAxisLabel = true;

    public gradient = true;
    public colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };

    protected constructor(protected _injector: Injector,
                          protected resourceService: AbstractCustomCardResourceService,
                          protected translateService: TranslateService) {
        this.loading = true;
    }

    ngOnInit(): void {
        this.card.units = this.translateService.instant('dashboard.' + this.card.units);
        this.card.query = JSON.parse(this.card.query);
        this.single = [];
        this.multi = [];
        this.resourceService.getResource(this.getResourceTypeAsString(), this.card.query).subscribe(json => {
            this.convertData(json);
        });
    }

    public setCardType(type: string): void {
        switch (type) {
            case 'pie': {
                this.card.type = DashboardCardTypes.PIE;
                break;
            }
            case 'bar': {
                this.card.type = DashboardCardTypes.BAR;
                break;
            }
            case 'line': {
                this.card.type = DashboardCardTypes.LINE;
                break;
            }
            case 'lineargauge': {
                this.card.type = DashboardCardTypes.LINEARGAUGE;
                break;
            }
            default: {
                this.card.type = DashboardCardTypes.DEFAULT;
                break;
            }
        }
    }

    public getResourceTypeAsString(): string {
        return this.card.resourceType.toLowerCase();
    }

    public abstract convertData(json): void;

}