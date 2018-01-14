import { compose, mapProps, withHandlers, ComponentEnhancer } from 'recompose';
import { withAnalytics } from './with-analytics'
import { withoutAnalytics } from './without-analytics'

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
                ...props
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