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

        result.current();

        expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('Both dispatcher and inner event handler are called when event is triggered', () => {
        const eventHandler = jest.fn();
        const dispatcher = jest.fn();
        const expectedArgs = [1, 2, 3];

        const {result} = renderHook(() => useEventAnalytic(dispatcher, eventHandler));

        result.current(...expectedArgs);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledWith(expect.anything(), ...expectedArgs);
        expect(eventHandler).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledWith(...expectedArgs);
    });

    it('Dispatcher gets shisell dispatcher from context', () => {
        const shisellDispatcher = jest.fn();
        const dispatcher = jest.fn();

        const {result} = renderHook(() => useEventAnalytic(dispatcher), {
            wrapper: ShisellContext.Provider,
            initialProps: {value: {dispatcher: shisellDispatcher as any}},
        });

        result.current();

        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toBeCalledWith(shisellDispatcher);
    });

    it('Use latest callbacks after render', () => {
        const {result, rerender} = renderHook(() => {
            const eventHandler = jest.fn();
            const dispatcher = jest.fn();

            const wrappedEvent = useEventAnalytic(dispatcher, eventHandler);

            return {eventHandler, dispatcher, wrappedEvent};
        });

        const assert = () => {
            result.current.wrappedEvent();
            expect(result.current.dispatcher).toHaveBeenCalledTimes(1);
            expect(result.current.eventHandler).toHaveBeenCalledTimes(1);
        };

        assert();

        rerender();

        assert();
    });

    it('Returns new event handler only when context changes', () => {
        const Wrapper: FunctionComponent<{context?: any}> = ({context, children}) =>
            context ? <ShisellContext.Provider value={context}>{children}</ShisellContext.Provider> : <>{children}</>;

        const {result, rerender} = renderHook(() => useEventAnalytic(jest.fn(), jest.fn()), {
            wrapper: Wrapper,
        });

        rerender();

        rerender({context: {dispatcher: jest.fn()}});

        expect(result.all[0]).toBe(result.all[1]);
        expect(result.all[1]).not.toBe(result.all[2]);
        result.all.forEach((fn) => expect(fn).toEqual(expect.any(Function)));
    });
});
