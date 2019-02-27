import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {Analytics, ShisellContext} from '../shisell-context';
import {useAnalytics} from './use-analytics';
import {FunctionComponent} from 'react';

describe('useAnalytics', () => {
    const ANALYTICS: any = 'some analytics';

    it("Don't send an analytic when the selected prop does not change value", () => {
        const InnerComponent: FunctionComponent<{analytics: Analytics}> = () => null;
        const HookComponent = () => {
            const analytics = useAnalytics();
            return <InnerComponent analytics={analytics} />;
        };

        const result = renderer.create(
            <ShisellContext.Provider value={ANALYTICS}>
                <HookComponent />
            </ShisellContext.Provider>,
        );

        const component = result.root.findByType(InnerComponent);

        expect(component.props).toEqual({analytics: ANALYTICS});
    });
});
