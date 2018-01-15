import * as React from 'react';
import * as renderer from 'react-test-renderer';
import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import {compose} from 'recompose';

import {withAnalyticOnEvent} from './with-analytic-on-event';
import {enrichAnalytics} from './enrich-analytics';
import Analytics from '../analytics';

import {runImmediate} from '../testUtils';

const identity = <T extends any>(f: T) => f;

describe('withAnalyticOnEvent', () => {
    const writer = jest.fn();
    const BaseComponent = jest.fn().mockImplementation((props) => {
        props.onClick();
        return null;
    })

    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Analytic sent when event handler is triggered', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });

    it('Analytic not sent when shouldDispatch returns false', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
                shouldDispatch: () => false
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);
    });

    it('Analytic sent with extra data from mapPropsToExtras as an object', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
                mapPropsToExtras: {Name: 'Me'}
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
            ExtraData: {
                Name: 'Me'
            }
        });
    });

    it('Analytic sent with extra data from mapPropsToExtras as a function', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
                mapPropsToExtras: (props) => ({Something: props.something})
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent something={123} />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
            ExtraData: {
                Something: 123
            }
        });
    });

    it('Analytic sent with identities from mapPropsToIdentities as an object', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
                mapPropsToIdentities: ({User: 'Me'})
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
            Identities: {
                User: 'Me'
            }
        });
    });

    it('Analytic sent with identities from mapPropsToIdentities as a function', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnEvent({
                eventName: 'onClick',
                analyticName: 'TestAnalytic',
                mapPropsToIdentities: (props) => ({User: props.userName})
            })
        )(BaseComponent);

        const result = renderer.create(<EnhancedComponent userName="McCree" />);

        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
            Identities: {
                User: 'McCree'
            }
        });
    });
});
