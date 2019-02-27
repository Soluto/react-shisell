import * as React from 'react';
import {Component, ComponentClass, ComponentType} from 'react';
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

export function enrichAnalytics<Props>(transformAnalyticsFunc: TransformAnalyticsFunc<Props>) {
    return (BaseComponent: ComponentType<Props>): ComponentClass<Props> =>
        class extends Component<Props> {
            static contextType = ShisellContext;
            static displayName = wrapDisplayName(BaseComponent, 'enrichAnalytics');

            analytics = new LazyAnalytics(() => transformAnalyticsFunc(this.context.dispatcher, this.props as any));

            render() {
                return (
                    <ShisellContext.Provider value={this.analytics}>
                        <BaseComponent {...this.props} />
                    </ShisellContext.Provider>
                );
            }
        };
}
