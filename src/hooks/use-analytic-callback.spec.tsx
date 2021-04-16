import React from 'react';
import renderer from 'react-test-renderer';
import Analytics from '../analytics';
import {useAnalyticCallback} from './use-analytic-callback';
import {runImmediate} from '../testUtils';

describe('useAnalyticCallback', () => {
    const writer = jest.fn();
    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Returns a function that dispatches an analytic when called', async () => {
        const TestComponent = () => {
            const onClick = useAnalyticCallback('eventName');

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(<TestComponent />);
        dom.root.findByType('span').props.onClick();

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(expect.objectContaining({Name: 'eventName'}));
    });

    it('Wraps the given function to dispatch an analytic when called', async () => {
        const testFn = jest.fn().mockImplementation((arg: string) => arg);

        const TestComponent = () => {
            const onClick = useAnalyticCallback('eventName', testFn);

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(<TestComponent />);
        const result = dom.root.findByType('span').props.onClick('test');

        await runImmediate();
        expect(testFn).toHaveBeenCalledTimes(1);
        expect(result).toEqual('test');
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(expect.objectContaining({Name: 'eventName'}));
    });
});
