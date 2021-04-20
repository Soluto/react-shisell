import {render} from '@testing-library/react';
import React from 'react';
import {ShisellContext} from '../shisell-context';
import {withAnalytics, WithAnalyticsProps} from './with-analytics';

describe('withAnalytics', () => {
    const ANALYTICS: any = 'some analytics';

    it('Adds analytics to props', () => {
        const InnerComponent = (props: WithAnalyticsProps) => {
            expect(props).toEqual({analytics: ANALYTICS});
            return null;
        };
        const EnhancedComponent = withAnalytics(InnerComponent);

        render(
            <ShisellContext.Provider value={ANALYTICS}>
                <EnhancedComponent />
            </ShisellContext.Provider>,
        );

        expect.assertions(1);
    });
});
