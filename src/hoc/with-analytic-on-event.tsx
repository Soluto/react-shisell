import React, {ElementType, FunctionComponent} from 'react';
import {AnalyticsExtender} from 'shisell';
import {wrapDisplayName} from '../wrapDisplayName';
import {useEventAnalytic} from '../hooks/use-event-analytic';

type AnyFn<Args extends any[]> = (...args: Args) => any;

export type ExtendEventAnalytics<Params extends any[]> = (...params: Params) => AnalyticsExtender<void>;

export type WithAnalyticOnEventConfiguration<EventName extends string, EventParams extends any[], Props> = {
    eventName: EventName;
    analyticName: string;
    extendAnalytics?: ExtendEventAnalytics<[Omit<Props, EventName>, ...EventParams]>;
};

export interface WithAnalyticOnEventProps<Params extends any[]> {
    extendAnalytics?: ExtendEventAnalytics<Params>;
    shouldDispatchAnalytics?: boolean | ((...params: Params) => boolean);
}

type CombinedProps<EventName extends string, Props> = Props extends Record<EventName, any>
    ? Omit<Props, EventName> &
          Partial<Record<EventName, Props[EventName] | undefined>> &
          WithAnalyticOnEventProps<Parameters<Props[EventName]>>
    : Props & WithAnalyticOnEventProps<[]>;

export function withAnalyticOnEvent<EventName extends string, EventParams extends any[], BaseProps>({
    eventName,
    analyticName,
    extendAnalytics: extendAnalyticsFromConfig,
}: WithAnalyticOnEventConfiguration<EventName, EventParams, BaseProps>) {
    return <Props extends BaseProps>(BaseComponent: ElementType<Props>) => {
        const EnhancedComponent: FunctionComponent<CombinedProps<EventName, Props>> = ({
            [eventName]: rawEvent,
            extendAnalytics,
            shouldDispatchAnalytics,
            ...props
        }) => {
            const onEvent = useEventAnalytic((dispatcher, ...args) => {
                const shouldDispatch =
                    typeof shouldDispatchAnalytics === 'function'
                        ? (shouldDispatchAnalytics as AnyFn<any[]>)(...args)
                        : shouldDispatchAnalytics == null || shouldDispatchAnalytics;

                if (shouldDispatch) {
                    if (extendAnalyticsFromConfig) {
                        dispatcher = dispatcher.extend((extendAnalyticsFromConfig as AnyFn<any[]>)(props, ...args));
                    }
                    if (extendAnalytics) {
                        dispatcher = dispatcher.extend((extendAnalytics as AnyFn<any[]>)(...args));
                    }
                    dispatcher.dispatch(analyticName);
                }
            }, rawEvent as AnyFn<any[]>);

            // @ts-ignore
            return <BaseComponent {...{[eventName]: onEvent}} {...props} />;
        };

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnEvent');

        return EnhancedComponent;
    };
}
