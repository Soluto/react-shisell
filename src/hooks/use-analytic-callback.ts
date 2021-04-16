import {useCallback} from 'react';
import {useAnalytics} from './use-analytics';

type AnyFn = (...args: any[]) => any;

export function useAnalyticCallback(eventName: string): () => void;
export function useAnalyticCallback<T extends AnyFn>(
    eventName: string,
    fn: T,
): (...args: Parameters<T>) => ReturnType<T>;
export function useAnalyticCallback(eventName: string, fn?: AnyFn): AnyFn {
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
