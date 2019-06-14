import * as React from 'react';
import {Component, FunctionComponent} from 'react';
import * as PropTypes from 'prop-types';
import {AnalyticsDispatcher} from 'shisell';
import {Analytics, ShisellContext} from './shisell-context';

type DispatcherFactory = () => AnalyticsDispatcher;

class LazyAnalytics implements Analytics {
    constructor(private dispatcherFactory: DispatcherFactory) {}

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

class LazyAnalyticsProvider extends Component<{getDispatcher: DispatcherFactory}> {
    readonly analytics = new LazyAnalytics(() => this.props.getDispatcher());

    render() {
        return <ShisellContext.Provider value={this.analytics}>{this.props.children}</ShisellContext.Provider>;
    }
}

export type AnalyticsProviderProps = {
    dispatcher: AnalyticsDispatcher | ((dispatcher: AnalyticsDispatcher) => AnalyticsDispatcher);
};

export const AnalyticsProvider: FunctionComponent<AnalyticsProviderProps> = ({dispatcher, children}) => {
    if (typeof dispatcher === 'function') {
        return (
            <ShisellContext.Consumer>
                {analytics => (
                    <LazyAnalyticsProvider getDispatcher={() => dispatcher(analytics.dispatcher)}>
                        {children}
                    </LazyAnalyticsProvider>
                )}
            </ShisellContext.Consumer>
        );
    }

    return <LazyAnalyticsProvider getDispatcher={() => dispatcher}>{children}</LazyAnalyticsProvider>;
};

AnalyticsProvider.propTypes = {
    dispatcher: PropTypes.oneOfType([PropTypes.instanceOf(AnalyticsDispatcher), PropTypes.func]).isRequired,
};
