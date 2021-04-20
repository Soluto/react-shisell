import {useCallback} from 'react';
import {useAnalytics} from './use-analytics';

export function useAnalyticCallback(eventName: string): () => void;
export function useAnalyticCallback<T extends Function>(eventName: string, fn: T): T;
export function useAnalyticCallback(eventName: string, fn?: Function): Function {
    const analytics = useAnalytics();

    return useCallback(
        fn === undefined
            ? () => analytics.dispatcher.dispatch(eventName)
            : (...args) => {
                  const result = fn(...args);
                  analytics.dispatcher.dispatch(eventName);
                  return result;
              },
        [fn, eventName, analytics],
    );
}
