import {renderHook} from '@testing-library/react-hooks';
import React, {FunctionComponent} from 'react';
import Analytics from '../analytics';
import {ShisellContext} from '../shisell-context';
import {useEventAnalytic} from './use-event-analytic';

describe('withAnalyticOnEvent', () => {
    const writer = jest.fn();
    beforeEach(() => writer.mockReset());
    beforeAll(() => Analytics.setWriter(writer));

    it('Dispatcher is called when event is triggered', () => {
        const dispatcher = jest.fn();

        const {result} = renderHook(() => useEventAnalytic(dispatcher));

        result.current(undefined as any);

        expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('Both dispatcher and inner event handler are called when event is triggered', () => {
        const eventHandler = jest.fn();
        const dispatcher = jest.fn();

        const {result} = renderHook(() => useEventAnalytic(dispatcher, eventHandler));

        result.current(undefined);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('Dispatcher gets shisell dispatcher from context', () => {
        const shisellDispatcher = jest.fn();
        const dispatcher = jest.fn();

        const {result} = renderHook(() => useEventAnalytic(dispatcher), {
            wrapper: ShisellContext.Provider,
            initialProps: {value: {dispatcher: shisellDispatcher as any}},
        });

        result.current(undefined as any);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toBeCalledWith(shisellDispatcher);
    });

    it('Returns new event handler only when deps or context changes', () => {
        const Wrapper: FunctionComponent<{context?: any; value: number}> = ({context, children}) =>
            context ? <ShisellContext.Provider value={context}>{children}</ShisellContext.Provider> : <>{children}</>;

        const {result, rerender} = renderHook(({value}) => useEventAnalytic(() => {}, null, [value]), {
            wrapper: Wrapper,
            initialProps: {value: 1},
        });

        rerender({value: 1});

        rerender({value: 2});

        rerender({value: 2, context: {dispatcher: jest.fn()}});

        expect(result.all[0]).toBe(result.all[1]);
        expect(result.all[1]).not.toBe(result.all[2]);
        expect(result.all[2]).not.toBe(result.all[3]);
        result.all.forEach((fn) => expect(fn).toEqual(expect.any(Function)));
    });
});
