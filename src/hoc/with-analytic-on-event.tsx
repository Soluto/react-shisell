import * as React from 'react';
import * as PropTypes from 'prop-types';
import {wrapDisplayName} from 'recompose';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

export interface ExtraAnalyticsData {
    [key: string]: any;
}
export interface ExtraAnalyticsDataProvider<Event> {
    (event: Event): ExtraAnalyticsData;
}
export type DataMapper<Event> = ExtraAnalyticsData | ExtraAnalyticsDataProvider<Event>;
export type Predicate<T> = (val: T) => boolean;
export interface WithAnalyticOnEventConfiguration<TProps, TEvent> {
    eventName: string;
    analyticName: string;
    extras?: DataMapper<TEvent>;
    identities?: DataMapper<TEvent>;
}
export interface WithAnalyticOnEventProps<Event> {
    analyticsExtras?: DataMapper<Event>;
    analyticsIdentities?: DataMapper<Event>;
    shouldDispatch?: boolean | Predicate<Event>;
}

const dataMapperPropType = PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.func.isRequired]);

const withAnalyticOnEventDefaultProps = {
    shouldDispatch: true,
};
const withAnalyticOnEventPropTypes = {
    analyticsExtras: dataMapperPropType,
    analyticsIdentities: dataMapperPropType,
    shouldDispatch: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
};

const getPossibleFunctionValue = <Event, FuncOrValue>(e: Event, f: FuncOrValue) => (typeof f === 'function' ? f(e) : f);
const isDefined = (val: any) => typeof val !== 'undefined' && val !== null;
const isBoolean = (val: any) => typeof val === 'boolean';

export const withAnalyticOnEvent = <
    Props extends {[_: string]: any},
    Event extends object,
    CombinedProps extends Props & WithAnalyticOnEventProps<Event>
>({
    eventName,
    analyticName,
    extras: staticExtras,
    identities: staticIdentities,
}: WithAnalyticOnEventConfiguration<Props, Event>) => (BaseComponent: React.ComponentType<Props>) =>
    class WithAnalyticOnEvent extends React.Component<CombinedProps> {
        context: AnalyticsContext;

        static defaultProps = withAnalyticOnEventDefaultProps;
        static propTypes = withAnalyticOnEventPropTypes;
        static contextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, WithAnalyticOnEvent.name);

        constructor(props: CombinedProps) {
            super(props);

            this.onEvent = this.onEvent.bind(this);
        }

        onEvent(e: Event) {
            const {shouldDispatch, analyticsExtras: propExtras, analyticsIdentities: propIdentities} = this.props;
            const actualShouldDispatch = getPossibleFunctionValue<Event, typeof shouldDispatch>(e, shouldDispatch);

            if ((isBoolean(actualShouldDispatch) && actualShouldDispatch) || !isBoolean(actualShouldDispatch)) {
                const actualPropsExtras: ExtraAnalyticsData = getPossibleFunctionValue(e, propExtras);
                const actualPropsIdentities: ExtraAnalyticsData = getPossibleFunctionValue(e, propIdentities);
                const actualStaticExtras: ExtraAnalyticsData = getPossibleFunctionValue(e, staticExtras);
                const actualStaticIdentities: ExtraAnalyticsData = getPossibleFunctionValue(e, staticIdentities);

                let {dispatcher} = this.context.analytics;
                dispatcher = actualStaticExtras ? dispatcher.withExtras(actualStaticExtras) : dispatcher;
                dispatcher = actualStaticIdentities ? dispatcher.withIdentities(actualStaticIdentities) : dispatcher;
                dispatcher = actualPropsExtras ? dispatcher.withExtras(actualPropsExtras) : dispatcher;
                dispatcher = actualPropsIdentities ? dispatcher.withIdentities(actualPropsIdentities) : dispatcher;
                dispatcher.dispatch(analyticName);
            }

            if (typeof this.props[eventName] === 'function') {
                this.props[eventName](e);
            } else if (process.env.NODE_ENV !== 'prodution' && this.props[eventName]) {
                console.warn(
                    `Expected function as an "${eventName}" prop in ${this.constructor.name}, instead got ${typeof this
                        .props[eventName]}`
                );
            }
        }

        render() {
            const newProps: CombinedProps = {...(this.props as any), [eventName]: this.onEvent};
            delete newProps.shouldDispatch;
            delete newProps.analyticsExtras;
            delete newProps.analyticsIdentities;

            return <BaseComponent {...newProps as Props} />;
        }
    };
