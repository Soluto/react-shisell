import * as React from 'react';
import {Component, ComponentType, FunctionComponent} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {wrapDisplayName} from '../wrapDisplayName';
import {Analytics, ShisellContext} from '../shisell-context';

type TransformAnalyticsFunc<T> = (dispatcher: AnalyticsDispatcher, props: T) => AnalyticsDispatcher;
type DispatcherFactory = () => AnalyticsDispatcher;

class LazyAnalytics implements Analytics {
    constructor(private dispatcherFactory: DispatcherFactory) {}

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

class EnrichAnalytics extends Component<{getDispatcher: DispatcherFactory}> {
    readonly analytics = new LazyAnalytics(() => this.props.getDispatcher());
    render() {
        return <ShisellContext.Provider value={this.analytics}>{this.props.children}</ShisellContext.Provider>;
    }
}

export function enrichAnalytics<Props>(transformAnalyticsFunc: TransformAnalyticsFunc<Props>) {
    return (BaseComponent: ComponentType<Props>) => {
        const EnhancedComponent: FunctionComponent<Props> = props => (
            <ShisellContext.Consumer>
                {analytics => (
                    <EnrichAnalytics getDispatcher={() => transformAnalyticsFunc(analytics.dispatcher, props)}>
                        <BaseComponent {...props} />
                    </EnrichAnalytics>
                )}
            </ShisellContext.Consumer>
        );

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'enrichAnalytics');

        return EnhancedComponent;
    };
}
