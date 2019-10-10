import {useCallback} from 'react';
import {verifyHooksExist} from './verify-hooks-exist';
import {AnalyticsDispatcher} from 'shisell';
import {useAnalytics} from './use-analytics';

export function useEventAnalytic<EventType extends React.SyntheticEvent>(
    dispatch: (dispatcher: AnalyticsDispatcher<void>) => void,
    eventHandler?: React.EventHandler<EventType> | null,
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
