import * as React from 'react';
import * as PropTypes from 'prop-types';
import {wrapDisplayName} from '../wrapDisplayName';

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
    shouldDispatchAnalytics?: boolean | Predicate<Event>;
}

const dataMapperPropType = PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.func.isRequired]);

const withAnalyticOnEventDefaultProps = {
    shouldDispatchAnalytics: true,
};
const withAnalyticOnEventPropTypes = {
    analyticsExtras: dataMapperPropType,
    analyticsIdentities: dataMapperPropType,
    shouldDispatchAnalytics: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
};

const getPossibleFunctionValue = <Event, FuncOrValue>(e: Event, f: FuncOrValue) => (typeof f === 'function' ? f(e) : f);
const isDefined = (val: any) => typeof val !== 'undefined' && val !== null;
const isBoolean = (val: any) => typeof val === 'boolean';
const addOldApiWarning = <T extends any>(Component: T) => {
    if (process.env.NODE_ENV !== 'production') {
        Component.prototype.componentDidMount = Component.prototype.componentDidUpdate = function() {
            if (this.props.extras || this.props.identities || this.props.extrasProps) {
                console.warn(
                    `Using old API in ${
                        Component.displayName
                    }. withAnalyticOnEvent does not support extras/identities/extrasProps anymore. Please review the documentation in https://www.npmjs.com/package/react-shisell#withanalyticonevent`
                );

                // Warn only once
                delete Component.prototype.componentDidMount;
                delete Component.prototype.componentDidUpdate;
            }
        };
    }

    return Component;
};

export const withAnalyticOnEvent = <
    Props extends {[_: string]: any},
    Event extends object,
    CombinedProps extends Props & WithAnalyticOnEventProps<Event>
>({
    eventName,
    analyticName,
    extras: rawStaticExtras,
    identities: rawStaticIdentities,
}: WithAnalyticOnEventConfiguration<Props, Event>) => (BaseComponent: React.ReactType<Props>) =>
    addOldApiWarning(
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
                const {
                    shouldDispatchAnalytics: rawShouldDispatch,
                    analyticsExtras: rawPropExtras,
                    analyticsIdentities: rawPropIdentities,
                } = this.props;
                const shouldDispatch = getPossibleFunctionValue<Event, typeof rawShouldDispatch>(e, rawShouldDispatch);

                if ((isBoolean(shouldDispatch) && shouldDispatch) || !isBoolean(shouldDispatch)) {
                    const propsExtras: ExtraAnalyticsData = getPossibleFunctionValue(e, rawPropExtras);
                    const propsIdentities: ExtraAnalyticsData = getPossibleFunctionValue(e, rawPropIdentities);
                    const staticExtras: ExtraAnalyticsData = getPossibleFunctionValue(e, rawStaticExtras);
                    const staticIdentities: ExtraAnalyticsData = getPossibleFunctionValue(e, rawStaticIdentities);

                    let {dispatcher} = this.context.analytics;
                    dispatcher = staticExtras ? dispatcher.withExtras(staticExtras) : dispatcher;
                    dispatcher = staticIdentities ? dispatcher.withIdentities(staticIdentities) : dispatcher;
                    dispatcher = propsExtras ? dispatcher.withExtras(propsExtras) : dispatcher;
                    dispatcher = propsIdentities ? dispatcher.withIdentities(propsIdentities) : dispatcher;
                    dispatcher.dispatch(analyticName);
                }

                if (typeof this.props[eventName] === 'function') {
                    this.props[eventName](e);
                } else if (process.env.NODE_ENV !== 'prodution' && this.props[eventName]) {
                    console.warn(
                        `Expected function as an "${eventName}" prop in ${
                            this.constructor.name
                        }, instead got ${typeof this.props[eventName]}`
                    );
                }
            }

            render() {
                const newProps: CombinedProps = {...(this.props as any), [eventName]: this.onEvent};
                delete newProps.shouldDispatchAnalytics;
                delete newProps.analyticsExtras;
                delete newProps.analyticsIdentities;

                return <BaseComponent {...newProps as Props} />;
            }
        }
    );
