import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Analytics from '../analytics';
import {useEventAnalytic} from './use-event-analytic';
import {ShisellContext} from '../shisell-context';

describe('withAnalyticOnEvent', () => {
    const writer = jest.fn();
    beforeEach(() => writer.mockReset());
    beforeAll(() => Analytics.setWriter(writer));

    it('Dispatcher is called when event is triggered', () => {
        const dispatcher = jest.fn();
        const TestComponent = () => {
            const onClick = useEventAnalytic(dispatcher);

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(<TestComponent />);
        dom.root.findByType('span').props.onClick();
        expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('Both dispatcher and inner event handler are called when event is triggered', () => {
        const eventHandler = jest.fn();
        const dispatcher = jest.fn();
        const TestComponent = () => {
            const onClick = useEventAnalytic(dispatcher, eventHandler);

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(<TestComponent />);
        dom.root.findByType('span').props.onClick();
        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('Dispatcher gets shisell dispatcher from context', () => {
        const shisellDispatcher = jest.fn();
        const dispatcher = jest.fn();
        const TestComponent = () => {
            const onClick = useEventAnalytic(dispatcher);

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(
            <ShisellContext.Provider value={{dispatcher: shisellDispatcher as any}}>
                <TestComponent />
            </ShisellContext.Provider>,
        );
        dom.root.findByType('span').props.onClick();
        expect(dispatcher).toHaveBeenCalledTimes(1);
        expect(dispatcher).toBeCalledWith(shisellDispatcher);
    });

    it('Returns new event handler only when deps or context changes', () => {
        const TestComponent = (props: {value: number}) => {
            const onClick = useEventAnalytic(() => {}, null, [props.value]);

            return <span onClick={onClick} />;
        };

        const dom = renderer.create(<TestComponent value={1} />);
        const onClick1 = dom.root.findByType('span').props.onClick;

        dom.update(<TestComponent value={1} />);
        const onClick2 = dom.root.findByType('span').props.onClick;

        dom.update(<TestComponent value={2} />);
        const onClick3 = dom.root.findByType('span').props.onClick;

        dom.update(
            <ShisellContext.Provider value={{dispatcher: jest.fn() as any}}>
                <TestComponent value={2} />
            </ShisellContext.Provider>,
        );
        const onClick4 = dom.root.findByType('span').props.onClick;

        expect(onClick1).toBe(onClick2);
        expect(onClick2).not.toBe(onClick3);
        expect(onClick3).not.toBe(onClick4);
    });
});
