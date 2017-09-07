import * as React from 'react';
import { AnalyticsDispatcher } from 'shisell';
import { Requireable } from 'prop-types';
import Analytics from '../analytics';
import { analyticsContextTypes, AnalyticsProps, TransformAnalytics } from '../models';

export type DispatcherFactory = () => AnalyticsDispatcher;

export class LazyAnalytics {
    dispatcherFactory: DispatcherFactory;

    constructor(dispatcherFactory: DispatcherFactory) {
        this.dispatcherFactory = dispatcherFactory;
    }

    get dispatcher() {
        return this.dispatcherFactory();
    }
}

//returns shisell's root analytics dispatcher
const defaultLazyAnalytics = new LazyAnalytics(() => Analytics.dispatcher);

const setAnalyticsScope = <T extends {}>(transformAnalytics: TransformAnalytics<T>) => (
    WrappedComponent: React.ComponentType<T>
) =>
    class AnalyticsScopeSetter extends React.Component<T> {
        context: AnalyticsProps;
        static childContextTypes = analyticsContextTypes;
        static contextTypes = analyticsContextTypes;

        getChildContext() {
            const { analytics: { dispatcher } = defaultLazyAnalytics } = this.context;

            return {
                analytics: new LazyAnalytics(() => transformAnalytics(dispatcher, this.props)),
            };
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

export default setAnalyticsScope;
