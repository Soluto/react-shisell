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

const doOnFirstChangeProps = (
    changedPropName: string,
    valueBeforeChange: any,
    valueAfterChange: any,
    doFunc: (prop: any) => void
) =>
    mapPropsStreamWithConfig(rxjsconfig)(props$ => {
        const rxStream = props$ as Observable<{}>;

        return Observable.combineLatest(
            rxStream,
            rxStream
                .pairwise()
                .filter(
                    (propsPair: Array<{ [key: string]: any }>) =>
                        propsPair[0][changedPropName] === valueBeforeChange &&
                        propsPair[1][changedPropName] === valueAfterChange
                )
                .take(1)
                .do((propsPair: Array<object>) => doFunc(propsPair[1]))
                .startWith(null),
            (props, _) => props
        );
    });

export const withOnFirstChangeAnalytic = (
    changedPropName: string,
    valueBeforeChange: any,
    valueAfterChange: any,
    analyticName: string,
    propsToExtras: MapPropsToExtras = () => ({})
) =>
    compose(
        withAnalytics,
        doOnFirstChangeProps(
            changedPropName,
            valueBeforeChange,
            valueAfterChange,
            ({ analytics, ...otherProps }) =>
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName)
        ),
        withoutAnalytics
    );
