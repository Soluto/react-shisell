import {useCallback, useRef} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {useAnalytics} from './use-analytics';

type EventDispatcher<Params extends any[] = []> = (dispatcher: AnalyticsDispatcher<void>, ...args: Params) => void;
type AnyFn = (...args: any[]) => any;

export function useEventAnalytic(dispatch: EventDispatcher): () => void;
export function useEventAnalytic<Event extends AnyFn>(
    dispatch: EventDispatcher<Parameters<Event>>,
    eventHandler: Event,
): Event;
export function useEventAnalytic<Event extends AnyFn>(
    dispatch: EventDispatcher<Parameters<Event>>,
    eventHandler?: Event,
) {
    const analytics = useAnalytics();

    const ref = useRef({dispatch, eventHandler});
    ref.current = {dispatch, eventHandler};

    return useCallback(
        (...args: Parameters<Event>) => {
            const {dispatch, eventHandler} = ref.current;
            dispatch(analytics.dispatcher, ...args);

            if (typeof eventHandler === 'function') {
                return eventHandler(...args);
            }
        },
        [analytics],
    );
}
