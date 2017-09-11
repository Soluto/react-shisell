import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as shisell from 'shisell';
import { Observable } from 'rxjs';
import rxjsconfig from 'recompose/rxjsObservableConfig';

import {
    getContext,
    withContext,
    compose,
    mapProps,
    withHandlers,
    lifecycle,
    withPropsOnChange,
    InferableComponentEnhancerWithProps,
    ComponentEnhancer,
    mapPropsStreamWithConfig,
    Subscription,
} from 'recompose';

import { Predicate, AnalyticsProps, MapPropsToExtras, analyticsContextTypes } from './models';
import doOnFirstProps from './modules/doOnFirstProps';
import doOnChangeProps from './modules/doOnChangeProps';
import { withAnalytics, withoutAnalytics } from './modules/withAnalytics';

export const withViewAnalytic = (where: Predicate, propsToExtras: MapPropsToExtras = () => ({})) =>
    compose(
        withAnalytics,
        doOnFirstProps(where, ({ analytics, ...otherProps }) =>
            analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch('View')
        ),
        withoutAnalytics
    );

export const withViewAnalyticOnPropChange = (
    propNames: Array<string>,
    where: Predicate,
    propsToExtras: MapPropsToExtras = () => ({})
) =>
    compose(
        withAnalytics,
        withPropsOnChange(propNames, ({ analytics, ...otherProps }) => {
            if (where(otherProps))
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch('View');
        }),
        withoutAnalytics
    );

export const withAnalyticOnEvent = (
    eventName = 'onClick',
    analyticName = 'Click',
    propsToExtras = (props: object, extrasProps: object) => ({}),
    predicate = (e: any, props: object) => true
) =>
    compose(
        withAnalytics,
        withHandlers({
            [eventName]: ({
                [eventName]: onEvent,
                extras = {},
                identities = {},
                analytics,
                extrasProps,
                ...props,
            }) => (e: object) => {
                if (predicate(e, props)) {
                    analytics.dispatcher
                        .withIdentities(identities)
                        .withExtras(extras)
                        .withExtras(propsToExtras(props, extrasProps))
                        .dispatch(analyticName);
                }
                onEvent && onEvent(e);
            },
        }),
        mapProps(({ extras, identities, extrasProps, ...otherProps }) => otherProps),
        withoutAnalytics
    );
