import {useCallback} from 'react';
import {verifyHooksExist} from './verify-hooks-exist';
import {AnalyticsDispatcher} from 'shisell';
import {useAnalytics} from './use-analytics';

export function useEventAnalytic<EventType extends React.SyntheticEvent>(
    eventHandler: React.EventHandler<EventType> | null | undefined,
    dispatch: (dispatcher: AnalyticsDispatcher) => void,
    deps: ReadonlyArray<any> = [],
) {
    verifyHooksExist('withAnalyticOnEvent');

    const analytics = useAnalytics();
    const handlerWithAnalytics = useCallback(
        (event: EventType) => {
            dispatch(analytics.dispatcher);

            if (typeof eventHandler === 'function') {
                eventHandler(event);
            }
        },
        [analytics, ...deps],
    );

    return handlerWithAnalytics;
}
