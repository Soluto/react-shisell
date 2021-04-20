import React, {ElementType, FunctionComponent, useCallback} from 'react';
import {AnalyticsExtender} from 'shisell';
import {useAnalytics} from '../hooks/use-analytics';
import {wrapDisplayName} from '../wrapDisplayName';

type AnyFn = (...args: any[]) => any;

export type ExtendEventAnalytics<Params extends any[]> = (...params: Params) => AnalyticsExtender<void>;

export type WithAnalyticOnEventConfiguration<EventName extends string> = {
    eventName: EventName;
    analyticName: string;
};

type ExtenderConfig<EventName extends string, Props extends Record<EventName, AnyFn>> = {
    extendAnalytics: ExtendEventAnalytics<[Omit<Props, EventName>, ...Parameters<Props[EventName]>]>;
};

export type WithAnalyticOnEventConfigurationWithExtender<
    EventName extends string,
    Props extends Record<EventName, AnyFn>
> = WithAnalyticOnEventConfiguration<EventName> & ExtenderConfig<EventName, Props>;

export interface WithAnalyticOnEventProps<Params extends any[]> {
    extendAnalytics?: ExtendEventAnalytics<Params>;
    shouldDispatchAnalytics?: boolean | ((...params: Params) => boolean);
}

type CombinedProps<EventName extends string, Props extends Record<EventName, AnyFn>> = Omit<Props, EventName> &
    Partial<Record<EventName, Props[EventName] | undefined>> &
    WithAnalyticOnEventProps<Parameters<Props[EventName]>>;

export function withAnalyticOnEvent<EventName extends string>(
    config: WithAnalyticOnEventConfiguration<EventName>,
): <Props extends Record<EventName, AnyFn>>(
    Component: ElementType<Props>,
) => FunctionComponent<CombinedProps<EventName, Props>>;

export function withAnalyticOnEvent<EventName extends string, BaseProps extends Record<EventName, AnyFn>>(
    config: WithAnalyticOnEventConfigurationWithExtender<EventName, BaseProps>,
): <Props extends BaseProps>(Component: ElementType<Props>) => FunctionComponent<CombinedProps<EventName, Props>>;

export function withAnalyticOnEvent<EventName extends string, BaseProps extends Record<EventName, AnyFn>>({
    eventName,
    analyticName,
    extendAnalytics: extendAnalyticsFromConfig,
}: WithAnalyticOnEventConfiguration<EventName> & Partial<ExtenderConfig<EventName, BaseProps>>) {
    return <Props extends BaseProps>(BaseComponent: ElementType<Props>) => {
        const EnhancedComponent: FunctionComponent<CombinedProps<EventName, Props>> = ({
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
