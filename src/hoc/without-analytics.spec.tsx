import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {compose, withContext} from 'recompose';

import {withoutAnalytics} from './without-analytics';
import analyticsContextTypes from '../analytics-context-types';

describe('withoutAnalytics', () => {
    const ANALYTICS = Object.create(null);

    it("Don't send an analytic when the selected prop does not change value", () => {
        const InnerComponent = jest.fn().mockImplementation(() => null);
        const EnhancedComponent = withoutAnalytics(InnerComponent);

        const result = renderer.create(<EnhancedComponent analytics={ANALYTICS} />);
        expect(InnerComponent).toHaveBeenCalledTimes(1);
        expect(InnerComponent.mock.calls[0][0].analytics).toBeUndefined();
    });
});
