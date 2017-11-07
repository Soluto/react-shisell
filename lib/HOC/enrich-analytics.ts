import { compose, withContext, ComponentEnhancer } from 'recompose';
import { AnalyticsDispatcher } from 'shisell';

import { TransformAnalyticsFunc } from './types';
import analyticsContextTypes from './analytics-context-types';
import { withAnalytics } from './with-analytics';
import { withoutAnalytics } from './without-analytics';
import Analytics from '../analytics';

type dispatcherFactory = () => AnalyticsDispatcher;


const LazyAnalytics = class {
    dispatcherFactory: dispatcherFactory;
    constructor(dispatcherFactory: dispatcherFactory) {
        this.dispatcherFactory = dispatcherFactory;
    }
    get dispatcher() {
        return this.dispatcherFactory();
    }
};

const defaultLazyAnalytics = new LazyAnalytics(() => Analytics.dispatcher);

export const enrichAnalytics = (transformAnalyticsFunc: TransformAnalyticsFunc) =>
    compose(
        withAnalytics,
        withContext(analyticsContextTypes, ({ analytics = defaultLazyAnalytics, ...otherProps }) => ({
            analytics: new LazyAnalytics(() => transformAnalyticsFunc(analytics.dispatcher, otherProps)),
        })),
        withoutAnalytics
    );