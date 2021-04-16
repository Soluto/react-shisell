import * as React from 'react';
import * as renderer from 'react-test-renderer';
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

        renderer.create(<EnhancedComponent />);

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
            predicate: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true),
        })(Empty);

        const result = renderer.create(<EnhancedComponent />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        result.update(<EnhancedComponent />);
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
            mapPropsToIdentities: () => ({sessionId: 'a1b2c3', deviceId: 'd4e5f6'}),
        })(Empty);

        renderer.create(<EnhancedComponent />);
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
