import React, {ElementType, FunctionComponent, useCallback} from 'react';
import {AnalyticsExtender} from 'shisell';
import {useAnalytics} from '../hooks/use-analytics';
import {wrapDisplayName} from '../wrapDisplayName';

type AnyFn<Args extends any[]> = (...args: Args) => void;

export type ExtendEventAnalytics<Params extends any[]> = (...params: Params) => AnalyticsExtender<void>;

export type WithAnalyticOnEventConfiguration<
    EventName extends string,
    EventParams extends any[],
    Props extends Record<EventName, AnyFn<EventParams>>
> = {
    eventName: EventName;
    analyticName: string;
    extendAnalytics?: ExtendEventAnalytics<[Omit<Props, EventName>, ...EventParams]>;
};

export interface WithAnalyticOnEventProps<Params extends any[]> {
    extendAnalytics?: ExtendEventAnalytics<Params>;
    shouldDispatchAnalytics?: boolean | ((...params: Params) => boolean);
}

type CombinedProps<
    EventName extends string,
    EventParams extends any[],
    Props extends Record<EventName, AnyFn<EventParams>>
> = Omit<Props, EventName> &
    Partial<Record<EventName, Props[EventName] | undefined>> &
    WithAnalyticOnEventProps<Parameters<Props[EventName]>>;

export function withAnalyticOnEvent<
    EventName extends string,
    EventParams extends any[],
    BaseProps extends Record<EventName, AnyFn<EventParams>>
>({
    eventName,
    analyticName,
    extendAnalytics: extendAnalyticsFromConfig,
}: WithAnalyticOnEventConfiguration<EventName, EventParams, BaseProps>) {
    return <Props extends BaseProps>(BaseComponent: ElementType<Props>) => {
        const EnhancedComponent: FunctionComponent<CombinedProps<EventName, EventParams, Props>> = ({
            [eventName]: rawEvent,
            extendAnalytics,
            shouldDispatchAnalytics,
            ...props
        }) => {
            const analytics = useAnalytics();

            const onEvent = useCallback(
                (...args: Parameters<Props[EventName]>) => {
                    const shouldDispatch =
                        typeof shouldDispatchAnalytics === 'function'
                            ? shouldDispatchAnalytics(...args)
                            : shouldDispatchAnalytics == null || shouldDispatchAnalytics;

                    if (shouldDispatch) {
                        let {dispatcher} = analytics;

                        if (extendAnalyticsFromConfig) {
                            dispatcher = dispatcher.extend(
                                extendAnalyticsFromConfig(props as Omit<Props, EventName>, ...args),
                            );
                        }
                        if (extendAnalytics) {
                            dispatcher = dispatcher.extend(extendAnalytics(...args));
                        }
                        dispatcher.dispatch(analyticName);
                    }

                    if (typeof rawEvent === 'function') {
                        return rawEvent(...args);
                    } else if (process.env.NODE_ENV !== 'production' && rawEvent) {
                        console.warn(
                            `Expected function as an "${eventName}" prop in ${EnhancedComponent.displayName!}, instead got ${typeof rawEvent}`,
                        );
                    }
                },
                [analytics, rawEvent],
            );

            // @ts-ignore
            return <BaseComponent {...{[eventName]: onEvent}} {...props} />;
        };

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnEvent');

        return EnhancedComponent;
    };
}
