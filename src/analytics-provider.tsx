import * as React from 'react';
import {Component} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {Analytics, ShisellContext} from './shisell-context';

export type DispatcherFactory = () => AnalyticsDispatcher;

class LazyAnalytics implements Analytics {
    constructor(private dispatcherFactory: DispatcherFactory) {}

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

export type AnalyticsProviderProps = {getDispatcher: DispatcherFactory};

export class AnalyticsProvider extends Component<AnalyticsProviderProps> {
    static displayName = 'AnalyticsProvider';

    readonly analytics = new LazyAnalytics(() => this.props.getDispatcher());

    render() {
        return <ShisellContext.Provider value={this.analytics}>{this.props.children}</ShisellContext.Provider>;
    }
}
