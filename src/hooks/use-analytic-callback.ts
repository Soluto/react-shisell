import * as React from 'react';
import {useAnalytics} from './use-analytics';

type AnyFn = (...args: any[]) => any;

export function useAnalyticCallback(eventName: string): () => void;
export function useAnalyticCallback<T extends AnyFn>(
    eventName: string,
    fn: T,
): (...args: Parameters<T>) => ReturnType<T>;
export function useAnalyticCallback(eventName: string, fn?: AnyFn): AnyFn {
    const {dispatcher} = useAnalytics();

    return React.useCallback(
        fn === undefined
            ? () => dispatcher.dispatch(eventName)
            : (...args) => {
                  const result = fn(...args);
                  dispatcher.dispatch(eventName);
                  return result;
              },
        [fn, eventName, dispatcher.dispatch],
    );
}
