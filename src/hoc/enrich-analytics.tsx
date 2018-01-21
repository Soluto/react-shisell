import * as React from 'react';
import * as shisell from 'shisell';
import {wrapDisplayName} from 'recompose';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';
import {withAnalytics} from './with-analytics';
import {withoutAnalytics} from './without-analytics';
import Analytics from '../analytics';

type TransformAnalyticsFunc = (dispatcher: shisell.AnalyticsDispatcher, otherProps: any) => shisell.AnalyticsDispatcher;
type DispatcherFactory = () => shisell.AnalyticsDispatcher;

class LazyAnalytics {
    constructor(private dispatcherFactory: DispatcherFactory) {}

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

const defaultLazyAnalytics = new LazyAnalytics(() => Analytics.dispatcher);

export const enrichAnalytics = (transformAnalyticsFunc: TransformAnalyticsFunc) => <P extends object>(
    BaseComponent: React.ComponentType<P>
) =>
    class EnrichAnalytics extends React.Component<P> {
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
    };
