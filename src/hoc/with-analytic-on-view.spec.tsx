import {render} from '@testing-library/react';
import React from 'react';
import {withIdentities} from 'shisell/extenders';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {withAnalyticOnView} from './with-analytic-on-view';

const Empty = () => null;

describe('withAnalyticOnMount', () => {
    const writer = jest.fn();

    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Sends the analytic on mount', async () => {
        const EnhancedComponent = withAnalyticOnView({
            analyticName: 'TestAnalytic',
        })(Empty);

        render(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });

    it('Sends the analytic only after predicate is true', async () => {
        const EnhancedComponent = withAnalyticOnView({
            analyticName: 'TestAnalytic',
            shouldDispatchAnalytics: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true),
        })(Empty);

        const {rerender} = render(<EnhancedComponent />);
        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(0);

        rerender(<EnhancedComponent />);
        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });

    it('Sends the analytic with identities', async () => {
        const EnhancedComponent = withAnalyticOnView({
            analyticName: 'TestAnalytic',
            extendAnalytics: () => withIdentities({sessionId: 'a1b2c3', deviceId: 'd4e5f6'}),
        })(Empty);

        render(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                Identities: {sessionId: 'a1b2c3', deviceId: 'd4e5f6'},
            }),
        );
    });
});
