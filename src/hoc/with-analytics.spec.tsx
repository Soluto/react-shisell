import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {compose, withContext} from 'recompose';

import {withAnalytics} from './with-analytics';
import analyticsContextTypes from '../analytics-context-types';

describe('withAnalytics', () => {
    const ANALYTICS = Object.create(null);
    const contextProvider = withContext(analyticsContextTypes, props => ({analytics: ANALYTICS}));

    it("Don't send an analytic when the selected prop does not change value", () => {
        const InnerComponent = jest.fn().mockImplementation(() => null);
        const EnhancedComponent = compose(
            contextProvider,
            withAnalytics,
        )(InnerComponent);

        const result = renderer.create(<EnhancedComponent />);
        expect(InnerComponent).toHaveBeenCalledTimes(1);
        expect(InnerComponent.mock.calls[0][0].analytics).toBe(ANALYTICS);
    });
});
