import * as React from 'react';
import {Component, ComponentClass, ReactType, SyntheticEvent} from 'react';
import * as PropTypes from 'prop-types';
import {wrapDisplayName} from '../wrapDisplayName';
import {ShisellContext} from '../shisell-context';

export interface ExtraAnalyticsDataProvider<Event> {
    (event: Event): {};
}

type DataMapper<Event> = {} | ExtraAnalyticsDataProvider<Event>;

type Predicate<T> = (val: T) => boolean;

export interface WithAnalyticOnEventConfiguration<TProps, TEvent> {
    eventName: keyof TProps;
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

const getPossibleFunctionValue = <Event, Value>(e: Event, f: ((e: Event) => Value) | Value | undefined) =>
    typeof f === 'function' ? f(e) : f;
const isBoolean = (val: any) => typeof val === 'boolean';

export const withAnalyticOnEvent = <Props extends {}, Event extends object = SyntheticEvent<any>>({
    eventName,
    analyticName,
    extras: rawStaticExtras,
    identities: rawStaticIdentities,
}: WithAnalyticOnEventConfiguration<Props, Event>) => (
    BaseComponent: ReactType<Props>,
): ComponentClass<Props & WithAnalyticOnEventProps<Event>> => {
    type CombinedProps = Props & WithAnalyticOnEventProps<Event>;
    let shouldWarnDeprecatedApi = process.env.NODE_ENV !== 'production';

    return class WithAnalyticOnEvent extends Component<CombinedProps> {
        static contextType = ShisellContext;

        static defaultProps = withAnalyticOnEventDefaultProps as any;
        static propTypes = withAnalyticOnEventPropTypes as any;
        static displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnEvent');

        constructor(props: CombinedProps) {
            super(props);

            this.onEvent = this.onEvent.bind(this);
        }

        componentDidMount() {
            // @ts-ignore
            if (shouldWarnDeprecatedApi && (this.props.extras || this.props.identities || this.props.extrasProps)) {
                console.warn(
                    `Using deprecated API in ${
                        WithAnalyticOnEvent.displayName
                    }. withAnalyticOnEvent does not support extras/identities/extrasProps anymore. Please review the documentation in https://www.npmjs.com/package/react-shisell#withanalyticonevent`,
                );

                // Warn only once
                shouldWarnDeprecatedApi = false;
            }
        }

        onEvent(e: Event) {
            const {shouldDispatchAnalytics, analyticsExtras, analyticsIdentities} = this.props;
            const shouldDispatch = getPossibleFunctionValue<Event, boolean>(e, shouldDispatchAnalytics);

            if ((isBoolean(shouldDispatch) && shouldDispatch) || !isBoolean(shouldDispatch)) {
                const propsExtras = getPossibleFunctionValue(e, analyticsExtras);
                const propsIdentities = getPossibleFunctionValue(e, analyticsIdentities);
                const staticExtras = getPossibleFunctionValue(e, rawStaticExtras);
                const staticIdentities = getPossibleFunctionValue(e, rawStaticIdentities);

                let {dispatcher} = this.context;
                dispatcher = staticExtras ? dispatcher.withExtras(staticExtras) : dispatcher;
                dispatcher = staticIdentities ? dispatcher.withIdentities(staticIdentities) : dispatcher;
                dispatcher = propsExtras ? dispatcher.withExtras(propsExtras) : dispatcher;
                dispatcher = propsIdentities ? dispatcher.withIdentities(propsIdentities) : dispatcher;
                dispatcher.dispatch(analyticName);
            }

            const event = this.props[eventName];

            if (typeof event === 'function') {
                (event as Function)(e);
            } else if (process.env.NODE_ENV !== 'prodution' && event) {
                console.warn(
                    `Expected function as an "${eventName}" prop in ${
                        WithAnalyticOnEvent.displayName
                    }, instead got ${typeof event}`,
                );
            }
        }

        render() {
            const newProps: CombinedProps = {...(this.props as any), [eventName]: this.onEvent};
            delete newProps.shouldDispatchAnalytics;
            delete newProps.analyticsExtras;
            delete newProps.analyticsIdentities;

            // @ts-ignore
            return <BaseComponent {...newProps as Props} />;
        }
    };
};
