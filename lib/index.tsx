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
    Subscription
} from 'recompose';


import Analytics from './analytics';

type Predicate = (obj: any) => boolean;
type DispatcherFactory = () => shisell.AnalyticsDispatcher;
export type TransformAnalyticsFunc = (
    dispatcher: shisell.AnalyticsDispatcher,
    otherProps: any
) => shisell.AnalyticsDispatcher;
type AnalyticsProps = { analytics: { dispatcher: shisell.AnalyticsDispatcher } };
type MapPropsToExtras = (props: object) => object;

const doOnFirstProps = <T extends AnalyticsProps>(
    filter: Predicate,
    onFirstProps: (props: T) => void
) =>
    mapPropsStreamWithConfig<T, T>(rxjsconfig)(props$ => {
        const onFirstProps$ = (props$ as Observable<T>)
            .first(filter)
            .do(onFirstProps)
            .ignoreElements();
        return Observable.merge(props$, onFirstProps$);
    });

const LazyAnalytics = class {
    dispatcherFactory: DispatcherFactory;
    constructor(dispatcherFactory: DispatcherFactory) {
        this.dispatcherFactory = dispatcherFactory;
    }
    get dispatcher() {
        return this.dispatcherFactory();
    }
};
//returns shisel's root analytics dispatcher
const defaultLazyAnalytics = new LazyAnalytics(() => Analytics.dispatcher);

export const analyticsContextTypes = {
    analytics: PropTypes.object,
};

export const withAnalytics = getContext<AnalyticsProps>(analyticsContextTypes);
export const withoutAnalytics = mapProps(({ analytics, ...otherProps }) => otherProps);

export const setAnalyticsScope = (transformAnalyticsFunc: TransformAnalyticsFunc) =>
    compose(
        withAnalytics,
        withContext(
            analyticsContextTypes,
            ({ analytics = defaultLazyAnalytics, ...otherProps }) => ({
                analytics: new LazyAnalytics(() =>
                    transformAnalyticsFunc(analytics.dispatcher, otherProps)
                ),
            })
        ),
        withoutAnalytics
    );

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

const doOnFirstChangeProps = (changedPropName: string, valueBeforeChange: any, valueAfterChange: any, doFunc: (prop: any) => void) =>
    mapPropsStreamWithConfig(rxjsconfig)(props$ => {
        const rxStream = props$ as rx.Observable<{}>;

        return rx.Observable.combineLatest(
            rxStream,
            rxStream.pairwise()
                .filter(
                    (propsPair: Array<{ [key: string]: any }>) =>
                        propsPair[0][changedPropName] === valueBeforeChange &&
                        propsPair[1][changedPropName] === valueAfterChange
                )
                .take(1)
                .do((propsPair: Array<object>) => doFunc(propsPair[1]))
                .startWith(null),
            (props, _) => props
        )
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

const doOnChangeProps = (changedPropName: string, valueBeforeChangeFilter: any, valueAfterChangeFilter: any, doFunc: (prop: any) => void) =>
    mapPropsStreamWithConfig(rxjsconfig)(props$ => {
        const rxStream = props$ as rx.Observable<{}>;

        return rx.Observable.combineLatest(
            rxStream,
            rxStream
                .pairwise()
                .filter(
                    (propsPair: Array<{ [key: string]: any }>) =>
                        valueBeforeChangeFilter(propsPair[0][changedPropName]) &&
                        valueAfterChangeFilter(propsPair[1][changedPropName])
                )
                .do((propsPair: Array<object>) => doFunc(propsPair[1]))
                .startWith(null),
            (props, _) => props
        )
    }
    );

export const withOnChangeAnalytic = (
    changedPropName: string,
    valueBeforeChangeFilter: any,
    valueAfterChangeFilter: any,
    analyticName: string,
    propsToExtras: MapPropsToExtras = () => ({})
) =>
    compose(
        withAnalytics,
        doOnChangeProps(
            changedPropName,
            valueBeforeChangeFilter,
            valueAfterChangeFilter,
            ({ analytics, ...otherProps }) =>
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName)
        ),
        withoutAnalytics
    );

export const withDispatchOnceAnalytic = (
    analyticName: string,
    propsToExtras: MapPropsToExtras = () => ({})
) =>
    compose(
        withAnalytics,
        doOnFirstProps(
            props => props,
            ({ analytics, ...otherProps }) =>
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName)
        ),
        withoutAnalytics
    );

export const withTimeOnPageAnalytic = (analyticName: string) => {
    return (Comp: new () => React.Component<any, any>) =>
        class ComponentWithTimeOnPageAnalytics extends React.Component<AnalyticsProps> {
            mountTimestamp: number;

            componentDidMount() {
                this.mountTimestamp = Date.now();
            }
            componentWillUnmount() {
                const timeOnPageMs = Date.now() - this.mountTimestamp;
                const timeOnPageSec = timeOnPageMs / 1000;
                this.props.analytics.dispatcher
                    .withExtra(analyticName, timeOnPageSec)
                    .dispatch(analyticName);
            }

            render() {
                return <Comp {...this.props} />;
            }
        };
};
