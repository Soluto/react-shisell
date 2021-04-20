import {renderHook} from '@testing-library/react-hooks';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {useAnalyticCallback} from './use-analytic-callback';

describe('useAnalyticCallback', () => {
    const writer = jest.fn();
    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Returns a function that dispatches an analytic when called', async () => {
        const {result} = renderHook(() => useAnalyticCallback('eventName'));

        result.current();

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(expect.objectContaining({Name: 'eventName'}));
    });

    it('Wraps the given function to dispatch an analytic when called', async () => {
        const testFn = jest.fn((arg: string) => arg);
        const expected = 'test';

        const {result} = renderHook(() => useAnalyticCallback('eventName', testFn));

        const fnResult = result.current(expected);

        await runImmediate();

        expect(testFn).toHaveBeenCalledTimes(1);
        expect(fnResult).toEqual(expected);
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(expect.objectContaining({Name: 'eventName'}));
    });
});
