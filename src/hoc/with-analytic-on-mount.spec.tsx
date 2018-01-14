import * as React from 'react';
import * as renderer from 'react-test-renderer';
import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import {compose} from 'recompose';

import {withAnalyticOnMount} from './with-analytic-on-mount';
import {enrichAnalytics} from './enrich-analytics';
import Analytics from '../analytics';

import {runImmediate} from '../testUtils';

const Empty = () => null;
const identity = <T extends any>(f: T) => f;

describe('withAnalyticOnMount', () => {
    let writer = jest.fn();

    beforeAll(() => {
        Analytics.setWriter(writer);
    });

    it('Actually sends the analytic on mount', async () => {
        const EnhancedComponent = compose(
            enrichAnalytics(identity),
            withAnalyticOnMount('TestAnalytic')
        )(Empty);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });
});
