import {Injectable, Type} from '@angular/core';
import {ConfigurationService} from '../../configuration/configuration.service';
import {ViewService} from '../view-service/view.service';
import {Route, Router} from '@angular/router';
import {View} from '../../configuration/interfaces/schema';
import {AuthenticationGuardService} from '../../authentication/services/guard/authentication-guard.service';
import {ViewClassInfo} from '../../../commons/view-class-info';
import {classify} from '../../../commons/angular-cli-devkit-core-strings';
import {LoggerService} from '../../logger/services/logger.service';


/**
 * Uses the information from nae.json to construct the application's routing
 */
@Injectable({
    providedIn: 'root'
})
export class RoutingBuilderService {

    constructor(router: Router,
                private _configService: ConfigurationService,
                private _viewService: ViewService,
                private _logger: LoggerService) {
        router.config.splice(0, router.config.length);
        for (const [pathSegment, view] of Object.entries(_configService.get().views)) {
            const route = this.constructRouteObject(view, pathSegment);
            if (route !== undefined) {
                router.config.push(route);
            }
        }
        router.config.push(...this.defaultRoutesRedirects());
    }

    private constructRouteObject(view: View, configPath: string): Route | undefined {
        const component = this.resolveComponentClass(view, configPath);
        if (component === undefined) {
            return undefined;
        }
        if (!view.routing || !view.routing.path) {
            this._logger.warn(`nae.json configuration is invalid. View at path '${configPath}'` +
                ` must define a 'routing' attribute. Skipping this view for routing generation.`);
            return undefined;
        }
        const route = {
            path: view.routing.path,
            component
        };
        if (view.routing.match !== undefined && view.routing.match) {
            route['pathMatch'] = 'full';
        }
        // TODO 26.5.2020 - Finer granularity for view access control
        if (view.access === 'private') {
            route['canActivate'] = [AuthenticationGuardService];
        }
        if (!!view.children) {
            route['children'] = [];
            Object.entries(view.children).forEach(([configPathSegment, childView]) => {
                const childRoute = this.constructRouteObject(childView, `${configPath}/${configPathSegment}`);
                if (childRoute !== undefined) {
                    route['children'].push(childRoute);                }
            });
        }
        if (!!view.layout && !!view.layout.name && view.layout.name === 'tabView') {
            if (!view.children) {
                route['children'] = [];
            }
            route['children'].push({
                path: '**',
                component
            });
        }

        return route;
    }

    private resolveComponentClass(view: View, configPath: string): Type<any> | undefined {
        let result;
        if (!!view.component) {
            result = this._viewService.resolveNameToClass(view.component.class);
        } else if (!!view.layout) {
            let className;
            if (!!view.layout.componentName) {
                className = `${classify(view.layout.componentName)}Component`;
            } else {
                const classInfo = new ViewClassInfo(configPath, view.layout.name, view.layout.componentName);
                className = classInfo.className;
            }
            result = this._viewService.resolveNameToClass(className);
        } else {
            this._logger.warn(`nae.json configuration is invalid. View at path '${configPath}'` +
                ` must define either a 'layout' or a 'component' attribute. Skipping this view for routing generation.`);
            return undefined;
        }
        if (result === undefined) {
            this._logger.warn(`Some views from nae.json configuration have not been created in the project.` +
                ` Run create-view schematic to rectify this. Skipping this view for routing generation.`);
            return undefined;
        }
        return result;
    }

    private defaultRoutesRedirects(): Array<Route> {
        const result = [];
        const servicesConfig = this._configService.get().services;
        if (!!servicesConfig && !!servicesConfig.routing) {
            if (!!servicesConfig.routing.defaultRedirect) {
                result.push({
                    path: '',
                    redirectTo: servicesConfig.routing.defaultRedirect,
                    pathMatch: 'full'
                });
            }
            if (!!servicesConfig.routing.wildcardRedirect) {
                result.push({
                    path: '**',
                    redirectTo: servicesConfig.routing.wildcardRedirect
                });
            }
        }
        return result;
    }
}