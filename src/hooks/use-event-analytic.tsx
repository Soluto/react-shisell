import {EventHandler, SyntheticEvent, useCallback} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {useAnalytics} from './use-analytics';

export function useEventAnalytic<EventType extends SyntheticEvent>(
    dispatch: (dispatcher: AnalyticsDispatcher<void>) => void,
    eventHandler?: EventHandler<EventType> | null,
    deps: ReadonlyArray<any> = [],
) {
    const analytics = useAnalytics();
    return useCallback(
        (event: EventType) => {
            dispatch(analytics.dispatcher);

            if (typeof eventHandler === 'function') {
                eventHandler(event);
            }
        },
        [analytics, ...deps],
    );
}
