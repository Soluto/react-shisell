import {render} from '@testing-library/react';
import React, {FunctionComponent} from 'react';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {withAnalyticOnEvent} from './with-analytic-on-event';
import {withExtras} from 'shisell/extenders';

type Event = {source: string; user: string};
type Props = {onClick: (e: Event) => void};

describe('withAnalyticOnEvent', () => {
    const writer = jest.fn();
    const BaseComponent: FunctionComponent<Props> = jest.fn((props) => {
        props.onClick({
            source: 'MyBaseComponent',
            user: 'McCree',
        });
        return null;
    });

    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Analytic sent when event handler is triggered', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });

    it('Analytic not sent when shouldDispatchAnalytics is false', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent shouldDispatchAnalytics={false} />);

        await runImmediate();

        expect(writer).not.toHaveBeenCalled();
    });

    it('Analytic not sent when shouldDispatchAnalytics returns false', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent shouldDispatchAnalytics={() => false} />);

        await runImmediate();

        expect(writer).not.toHaveBeenCalled();
    });

    it('Sends analytic when triggered and calls inner event handler', async () => {
        const eventHandler = jest.fn();
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent onClick={eventHandler} />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
        expect(eventHandler).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledWith({source: 'MyBaseComponent', user: 'McCree'});
    });

    it('Analytic sent with extender', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent extendAnalytics={() => withExtras({Name: 'Me'})} />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                ExtraData: expect.objectContaining({
                    Name: 'Me',
                }),
            }),
        );
    });

    it('Analytic sent with data from event', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        render(<EnhancedComponent extendAnalytics={(e) => withExtras({Source: e.source})} />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                ExtraData: expect.objectContaining({
                    Source: 'MyBaseComponent',
                }),
            }),
        );
    });

    it('Analytic sent with static extender', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
            extendAnalytics: (_: {}, e: Event) => withExtras({Source: e.source}),
        })(BaseComponent);

        render(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                ExtraData: expect.objectContaining({
                    Source: 'MyBaseComponent',
                }),
            }),
        );
    });

    it('Correctly ignores nulls in extenders', async () => {
        const EnhancedComponent = withAnalyticOnEvent({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
            // @ts-expect-error
            extendAnalytics: null,
        })(BaseComponent);

        render(
            <EnhancedComponent
                // @ts-expect-error
                extendAnalytics={null}
                // @ts-expect-error
                onClick={0}
            />,
        );

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });
});
