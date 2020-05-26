import * as React from 'react';
import {useAnalytics} from './use-analytics';

type AnyFn = (...args: any[]) => any;

export function useAnalytic(eventName: string): () => void;
export function useAnalytic<T extends AnyFn>(eventName: string, fn: T): (...args: Parameters<T>) => ReturnType<T>;
export function useAnalytic(eventName: string, fn?: AnyFn): AnyFn {
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
