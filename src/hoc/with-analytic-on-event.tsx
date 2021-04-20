import React, {ElementType, FunctionComponent, useCallback} from 'react';
import {AnalyticsExtender} from 'shisell';
import {useAnalytics} from '../hooks/use-analytics';
import {wrapDisplayName} from '../wrapDisplayName';

type AnyFn = (...args: any[]) => any;

export type ExtendEventAnalytics<Params extends any[]> = (...params: Params) => AnalyticsExtender<void>;

export interface WithAnalyticOnEventConfiguration<
    EventName extends string,
    EventType extends AnyFn = () => void,
    Props extends Record<EventName, EventType> = Record<EventName, EventType>
> {
    eventName: EventName;
    analyticName: string;
    extendAnalytics?: ExtendEventAnalytics<[Omit<Props, EventName>, ...Parameters<EventType>]>;
}

export interface WithAnalyticOnEventProps<Params extends any[]> {
    extendAnalytics?: ExtendEventAnalytics<Params>;
    shouldDispatchAnalytics?: boolean | ((...params: Params) => boolean);
}

export const withAnalyticOnEvent = <
    EventName extends string,
    EventType extends AnyFn,
    BaseProps extends Record<EventName, EventType> = Record<EventName, EventType>
>({
    eventName,
    analyticName,
    extendAnalytics: extendAnalyticsFromConfig,
}: WithAnalyticOnEventConfiguration<EventName, EventType, BaseProps>) => <Props extends BaseProps = BaseProps>(
    BaseComponent: ElementType<Props>,
) => {
    type CombinedProps = Omit<Props, EventName> &
        Partial<Record<EventName, Props[EventName]>> &
        WithAnalyticOnEventProps<Parameters<Props[EventName]>>;

    const EnhancedComponent: FunctionComponent<CombinedProps> = ({
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
                        dispatcher = dispatcher.extend(extendAnalyticsFromConfig(props as any, ...args));
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
