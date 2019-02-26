import * as React from 'react';
import * as renderer from 'react-test-renderer';

import AnalyticsContextProvider from './analytics-context-provider';
import analytics from './analytics';
import {withAnalytics} from './hoc/with-analytics';

describe('AnalyticsContextProvider', () => {
    it('Adds analytics to context', () => {
        const ANALYTICS = Object.create(null);
        const InnerComponent = jest.fn().mockImplementation(() => null);
        const EnhancedComponent = withAnalytics(InnerComponent);

        const result = renderer.create(
            <AnalyticsContextProvider analytics={ANALYTICS}>
                <EnhancedComponent />
            </AnalyticsContextProvider>,
        );
        expect(InnerComponent).toHaveBeenCalledTimes(1);
        expect(InnerComponent.mock.calls[0][0].analytics).toBe(ANALYTICS);
    });

    it('Adds default analytics to context', () => {
        const InnerComponent = jest.fn().mockImplementation(() => null);
        const EnhancedComponent = withAnalytics(InnerComponent);

        const result = renderer.create(
            <AnalyticsContextProvider>
                <EnhancedComponent />
            </AnalyticsContextProvider>,
        );
        expect(InnerComponent).toHaveBeenCalledTimes(1);
        expect(InnerComponent.mock.calls[0][0].analytics).toBe(analytics);
    });
});
