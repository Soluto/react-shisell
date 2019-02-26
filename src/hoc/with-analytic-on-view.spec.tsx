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

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });

    it('Sends the analytic only after predicate is true', async () => {
        const EnhancedComponent = withAnalyticOnView({
            analyticName: 'TestAnalytic',
            predicate: jest
                .fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true),
        })(Empty);

        const result = renderer.create(<EnhancedComponent />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        result.update(<EnhancedComponent />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });
});
