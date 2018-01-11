import * as React from 'react';
import * as shisell from 'shisell';
import {Requireable} from 'prop-types';

import {TransformAnalyticsFunc} from './types';
import analyticsContextTypes, {AnalyticsContext} from './analytics-context-types';
import {withAnalytics} from './with-analytics';
import {withoutAnalytics} from './without-analytics';
import Analytics from '../analytics';

export type DispatcherFactory = () => shisell.AnalyticsDispatcher;

export class LazyAnalytics {
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

        getChildContext() {
            const analytics = this.context.analytics || defaultLazyAnalytics;

            return {
                analytics: new LazyAnalytics(() => transformAnalyticsFunc(analytics.dispatcher, this.props)),
            };
        }

        render() {
            return <BaseComponent {...this.props} />;
        }
    };
