import {Component, Input, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {ConfigurationService} from '../../configuration/configuration.service';
import {View, Views} from '../../configuration/interfaces/schema';
import {NavigationEnd, Router} from '@angular/router';
import {MatTreeNestedDataSource} from '@angular/material/tree';

interface NavigationNode {
    name: string;
    icon?: string;
    url: string;
    children?: Array<NavigationNode>;
    level?: number;
}

@Component({
    selector: 'nae-navigation-tree',
    templateUrl: './navigation-tree.component.html',
    styleUrls: ['./navigation-tree.component.scss']
})
export class NavigationTreeComponent implements OnInit {

    @Input() public viewPath: string;
    @Input() public parentUrl: string;
    @Input() public routerChange: boolean;

    treeControl: NestedTreeControl<NavigationNode>;
    dataSource: MatTreeNestedDataSource<NavigationNode>;

    constructor(private _config: ConfigurationService, private _router: Router) {
        this.treeControl = new NestedTreeControl<NavigationNode>(node => node.children);
        this.dataSource = new MatTreeNestedDataSource<NavigationNode>();
        this.dataSource.data = this.resolveNavigationNodes(_config.get().views, '');
        this.resolveLevels(this.dataSource.data);
    }

    ngOnInit(): void {
        if (this.viewPath && this.parentUrl !== undefined && this.routerChange) {
            this._router.events.subscribe((event) => {
                if (event instanceof NavigationEnd && this.routerChange) {
                    const viewRoute = this._config.getViewByPath(this.viewPath);
                    if (viewRoute && viewRoute.children) {
                        this.dataSource.data = this.resolveNavigationNodes(viewRoute.children, this.parentUrl);
                    }
                    this.resolveLevels(this.dataSource.data);
                }
            });
            const view = this._config.getViewByPath(this.viewPath);
            if (view && view.children) {
                this.dataSource.data = this.resolveNavigationNodes(view.children, this.parentUrl);
            }
            this.resolveLevels(this.dataSource.data);
        }
    }

    public hasChild(_: number, node: NavigationNode): boolean {
        return !!node.children && node.children.length > 0;
    }

    private resolveNavigationNodes(views: Views, parentUrl: string): Array<NavigationNode> {
        if (!views || Object.keys(views).length === 0) {
            return null;
        }
        const nodes: Array<NavigationNode> = [];
        Object.keys(views).forEach((routeKey: string) => {
            const view = views[routeKey];
            if (!this.hasNavigation(view) && !this.hasSubRoutes(view)) {
                return;
            }
            if (this.hasNavigation(view)) {
                const node: NavigationNode = this.buildNode(view, routeKey, parentUrl);
                if (this.hasSubRoutes(view)) {
                    node.children = this.resolveNavigationNodes(view.children, node.url);
                }
                nodes.push(node);
            } else {
                if (this.hasSubRoutes(view)) {
                    nodes.push(...this.resolveNavigationNodes(view.children, parentUrl + '/' + routeKey));
                }
            }
        });
        return nodes;
    }

    private hasNavigation(route: View): boolean {
        if (!route.navigation) {
            return false;
        }
        if (typeof route.navigation === 'boolean') {
            return route.navigation;
        }
        if (typeof route.navigation === 'object') {
            return Object.keys(route.navigation).length !== 0;
        }
    }

    private hasSubRoutes(route: View): boolean {
        if (!route.children) {
            return false;
        }
        if (typeof route.children === 'object') {
            return Object.keys(route.children).length !== 0;
        }
    }

    private buildNode(view: View, routeKey: string, parentUrl: string): NavigationNode {
        const node: NavigationNode = {
            name: null,
            url: null
        };
        node.name = this.getNodeName(view, routeKey);
        node.icon = this.getNodeIcon(view);
        node.url = parentUrl + '/' + routeKey;
        return node;
    }

    private getNodeName(view: View, routeKeys: string): string {
        if (view.navigation['title']) {
            return view.navigation['title'];
        }
        const str = routeKeys.replace('_', ' ');
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    private getNodeIcon(view: View): string {
        return !view.navigation['icon'] ? undefined : view.navigation['icon'];
    }

    private resolveLevels(nodes: NavigationNode[], parentLevel?: number): void {
        if (!nodes) {
            return;
        }
        const currentLevel = parentLevel === null || parentLevel === undefined ? 0 : parentLevel + 1;
        nodes.forEach(node => {
            node.level = currentLevel;
            if (node.children) {
                this.resolveLevels(node.children, currentLevel);
            }
        });
    }

}