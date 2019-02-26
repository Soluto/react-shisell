import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {compose} from 'recompose';

import {withAnalyticOnView} from './with-analytic-on-view';
import {enrichAnalytics} from './enrich-analytics';
import Analytics from '../analytics';

import {runImmediate} from '../testUtils';

const Empty = () => null;
const identity = <T extends any>(f: T) => f;

describe('withAnalyticOnMount', () => {
    const writer = jest.fn();

    beforeAll(() => Analytics.setWriter(writer));
    beforeEach(() => writer.mockReset());

    it('Sends the analytic on mount', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnView({
                analyticName: 'TestAnalytic',
            }),
        )(Empty);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });

    it('Sends the analytic only after predicate is true', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnView({
                analyticName: 'TestAnalytic',
                predicate: jest
                    .fn()
                    .mockReturnValueOnce(false)
                    .mockReturnValueOnce(true),
            }),
        )(Empty);

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
