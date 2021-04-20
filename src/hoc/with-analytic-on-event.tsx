import React, {Component, ElementType, FunctionComponent, ReactElement} from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {ShisellContext} from '../shisell-context';
import {WithAnalyticsProps} from './with-analytics';
import {withExtras, withIdentities} from 'shisell/extenders';

export interface ExtraAnalyticsDataProvider<Event> {
    (event: Event): {};
}

type DataMapper<Event> = {} | ExtraAnalyticsDataProvider<Event>;

type Predicate<T> = (val: T) => boolean;

export interface WithAnalyticOnEventConfiguration<TEventName extends string, TEvent> {
    eventName: TEventName;
    analyticName: string;
    extras?: DataMapper<TEvent>;
    identities?: DataMapper<TEvent>;
}

export interface WithAnalyticOnEventProps<Event> {
    analyticsExtras?: DataMapper<Event>;
    analyticsIdentities?: DataMapper<Event>;
    shouldDispatchAnalytics?: boolean | Predicate<Event>;
}

export type EventProp<EventName extends string, Event> = Record<EventName, undefined | ((e: Event) => void)>;

const getPossibleFunctionValue = <Event, Value>(e: Event, f: ((e: Event) => Value) | Value | undefined) =>
    typeof f === 'function' ? (f as Function)(e) : f;
const isBoolean = (val: any) => typeof val === 'boolean';

type AnalyticOnEventProps = WithAnalyticsProps & {
    children: (event: Function) => ReactElement;
    event?: Function;
    eventName: string;
    analyticName: string;
    analyticsExtras?: DataMapper<any>;
    analyticsIdentities?: DataMapper<any>;
    shouldDispatchAnalytics?: boolean | Predicate<any>;
    staticExtras?: DataMapper<any>;
    staticIdentities?: DataMapper<any>;
    displayName: string;
};

class AnalyticOnEvent extends Component<AnalyticOnEventProps> {
    onEvent = (e: Event) => {
        const {
            event,
            eventName,
            shouldDispatchAnalytics,
            analyticsExtras,
            analyticsIdentities,
            staticExtras: rawStaticExtras,
            staticIdentities: rawStaticIdentities,
            analyticName,
            analytics,
            displayName,
        } = this.props;
        const shouldDispatch = getPossibleFunctionValue<Event, boolean>(e, shouldDispatchAnalytics);

        if ((isBoolean(shouldDispatch) && shouldDispatch) || !isBoolean(shouldDispatch)) {
            const propsExtras = getPossibleFunctionValue(e, analyticsExtras);
            const propsIdentities = getPossibleFunctionValue(e, analyticsIdentities);
            const staticExtras = getPossibleFunctionValue(e, rawStaticExtras);
            const staticIdentities = getPossibleFunctionValue(e, rawStaticIdentities);

            let {dispatcher} = analytics;
            dispatcher = staticExtras ? dispatcher.extend(withExtras(staticExtras)) : dispatcher;
            dispatcher = staticIdentities ? dispatcher.extend(withIdentities(staticIdentities)) : dispatcher;
            dispatcher = propsExtras ? dispatcher.extend(withExtras(propsExtras)) : dispatcher;
            dispatcher = propsIdentities ? dispatcher.extend(withIdentities(propsIdentities)) : dispatcher;
            dispatcher.dispatch(analyticName);
        }

        if (typeof event === 'function') {
            event(e);
        } else if (process.env.NODE_ENV !== 'prodution' && event) {
            console.warn(`Expected function as an "${eventName}" prop in ${displayName}, instead got ${typeof event}`);
        }
    };

    render() {
        return this.props.children(this.onEvent);
    }
}

export const withAnalyticOnEvent = <EventName extends string, Event = any>({
    eventName,
    analyticName,
    extras,
    identities,
}: WithAnalyticOnEventConfiguration<EventName, Event>) => <
    Props extends EventProp<EventName, Event> = EventProp<EventName, Event>
>(
    BaseComponent: ElementType<Props>,
) => {
    type ResolvedEvent = Props[EventName] extends Function ? Parameters<Props[EventName]>[0] : Event;

    type CombinedProps = Omit<Props, EventName> &
        Partial<Record<EventName, Props[EventName]>> &
        WithAnalyticOnEventProps<ResolvedEvent>;

    const EnhancedComponent: FunctionComponent<CombinedProps> = ({
        [eventName]: rawEvent,
        analyticsExtras,
        analyticsIdentities,
        shouldDispatchAnalytics,
        ...props
    }) => (
        <ShisellContext.Consumer>
            {(analytics) => (
                <AnalyticOnEvent
                    analytics={analytics}
                    event={rawEvent as Function}
                    eventName={eventName as string}
                    analyticName={analyticName}
                    analyticsExtras={analyticsExtras}
                    analyticsIdentities={analyticsIdentities}
                    shouldDispatchAnalytics={shouldDispatchAnalytics}
                    staticExtras={extras}
                    staticIdentities={identities}
                    displayName={EnhancedComponent.displayName!}
                >
                    {(event) => (
                        // @ts-ignore
                        <BaseComponent {...{[eventName]: event}} {...props} />
                    )}
                </AnalyticOnEvent>
            )}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnEvent');

    return EnhancedComponent;
};
