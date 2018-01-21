import * as React from 'react';
import * as PropTypes from 'prop-types';
import {wrapDisplayName} from 'recompose';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

export interface ExtraAnalyticsData {[key: string]: any};
export interface ExtraAnalyticsDataProvider<Event> {
    (event: Event): ExtraAnalyticsData;
}
export type DataMapper<Event> = ExtraAnalyticsData | ExtraAnalyticsDataProvider<Event>;
export type Predicate<T> = (val: T) => boolean;
export interface WithAnalyticOnEventConfiguration {
    eventName: string;
    analyticName: string;
};
export interface WithAnalyticOnEventProps<Event> {
    analyticsExtras: DataMapper<Event>,
    analyticsIdentities: DataMapper<Event>,
    shouldDispatch: boolean | Predicate<Event>
}

const dataMapperPropType = PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired
]);

const withAnalyticOnEventDefaultProps = {
    shouldDispatch: true
}
const withAnalyticOnEventPropTypes = {
    analyticsExtras: dataMapperPropType,
    analyticsIdentities: dataMapperPropType,
    shouldDispatch: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func,
    ])
}

const getPossibleFunctionValue = <Event, FuncOrValue>(e: Event, f: FuncOrValue) => typeof f === 'function' ? f(e) : f;

export const withAnalyticOnEvent =
    ({eventName, analyticName}: WithAnalyticOnEventConfiguration) =>
    <Props extends {[_: string]: any}, Event extends object, CombinedProps extends Props & WithAnalyticOnEventProps<Event>>(BaseComponent: React.ComponentType<Props>) =>
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
            const {shouldDispatch, analyticsExtras, analyticsIdentities} = this.props;
            const realShouldDispatch: boolean = getPossibleFunctionValue<Event, typeof shouldDispatch>(e, shouldDispatch);

            if (realShouldDispatch) {
                const realAnalyticsExtras: ExtraAnalyticsData = getPossibleFunctionValue(e, analyticsExtras);
                const realAnalyticsIdentities: ExtraAnalyticsData = getPossibleFunctionValue(e, analyticsIdentities);

                this.context.analytics.dispatcher
                    .withExtras(realAnalyticsExtras)
                    .withIdentities(realAnalyticsIdentities)
                    .dispatch(analyticName);
            }

            if (this.props[eventName]) {
                this.props[eventName](e);
            }
        }

        render() {
            const newProps: CombinedProps = {...this.props as any, [eventName]: this.onEvent};
            delete newProps.shouldDispatch;
            delete newProps.analyticsExtras;
            delete newProps.analyticsIdentities;

            return <BaseComponent {...newProps as Props} />;
        }
    };