import React from 'react';
import renderer from 'react-test-renderer';
import {ShisellContext} from '../shisell-context';
import {withAnalytics} from './with-analytics';

describe('withAnalytics', () => {
    const ANALYTICS: any = 'some analytics';

    it("Don't send an analytic when the selected prop does not change value", () => {
        const InnerComponent = () => null;
        const EnhancedComponent = withAnalytics(InnerComponent);

        const result = renderer.create(
            <ShisellContext.Provider value={ANALYTICS}>
                <EnhancedComponent />
            </ShisellContext.Provider>,
        );

        const component = result.root.findByType(InnerComponent);

        expect(component.props).toEqual({analytics: ANALYTICS});
    });
});
