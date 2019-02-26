import * as React from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {wrapDisplayName} from '../wrapDisplayName';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';
import {withAnalytics} from './with-analytics';
import {withoutAnalytics} from './without-analytics';
import Analytics from '../analytics';

type TransformAnalyticsFunc<T> = (dispatcher: AnalyticsDispatcher, props: T) => AnalyticsDispatcher;
type DispatcherFactory = () => AnalyticsDispatcher;

class LazyAnalytics {
    constructor(private dispatcherFactory: DispatcherFactory) {}

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

const defaultLazyAnalytics = new LazyAnalytics(() => Analytics.dispatcher);

export const enrichAnalytics = <Props extends object>(transformAnalyticsFunc: TransformAnalyticsFunc<Props>) => (
    BaseComponent: React.ReactType<Props>,
) =>
    class EnrichAnalytics extends React.Component<Props> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;
        static childContextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, EnrichAnalytics.name);

        getChildContext() {
            const analytics = this.context.analytics || defaultLazyAnalytics;
            const newAnalytics = new LazyAnalytics(() => transformAnalyticsFunc(analytics.dispatcher, this.props));

            return {
                analytics: newAnalytics as any,
            };
        }

        render() {
            return <BaseComponent {...this.props} />;
        }
    } as React.ComponentClass<Props>;
