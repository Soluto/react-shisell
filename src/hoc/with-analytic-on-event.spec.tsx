import React from 'react';
import renderer from 'react-test-renderer';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {withAnalyticOnEvent} from './with-analytic-on-event';

type Props = {onClick?: Function};
type Event = {source: string; user: string};

describe('withAnalyticOnEvent', () => {
    const writer = jest.fn();
    const BaseComponent = jest.fn((props) => {
        props.onClick({
            source: 'MyBaseComponent',
            user: 'McCree',
        });
        return null;
    });

    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Analytic sent when event handler is triggered', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });

    it('Analytic not sent when shouldDispatchAnalytics returns false', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent shouldDispatchAnalytics={false} />);

        await runImmediate();

        expect(writer).not.toHaveBeenCalled();
    });

    it('Sends analytic when triggered and calls inner event handler', async () => {
        const eventHandler = jest.fn();
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent onClick={eventHandler} />);

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

    it('Analytic sent with extra data from analyticsExtras as an object', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent analyticsExtras={{Name: 'Me'}} />);

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

    it('Analytic sent with extra data from analyticsExtras as a function with data from event', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props, Event>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent analyticsExtras={(e) => ({Source: e.source})} />);

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

    it('Analytic sent with identities from analyticsIdentities as an object', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent analyticsIdentities={{User: 'Me'}} />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                Identities: {
                    User: 'Me',
                },
            }),
        );
    });

    it('Analytic sent with identities from analyticsIdentities as a function with data from event', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props, Event>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
        })(BaseComponent);

        renderer.create(<EnhancedComponent analyticsIdentities={(e) => ({User: e.user})} />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                Identities: {
                    User: 'McCree',
                },
            }),
        );
    });

    it('Analytic sent with static identities', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
            identities: {
                User: 'McCree',
            },
        })(BaseComponent);

        renderer.create(<EnhancedComponent />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                Identities: {
                    User: 'McCree',
                },
            }),
        );
    });

    it('Analytic sent with static extras', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
            extras: {
                Source: 'Some source',
            },
        })(BaseComponent);

        renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                ExtraData: expect.objectContaining({
                    Source: 'Some source',
                }),
            }),
        );
    });

    it('Correctly ignores nulls in extras/identities', async () => {
        const EnhancedComponent = withAnalyticOnEvent<Props>({
            eventName: 'onClick',
            analyticName: 'TestAnalytic',
            // @ts-expect-error
            extras: null,
            identities: undefined,
        })(BaseComponent);

        renderer.create(
            <EnhancedComponent
                analyticsExtras={undefined}
                // @ts-expect-error
                analyticsIdentities={null}
                shouldDispatchAnalytics={true}
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
