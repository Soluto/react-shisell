import { AnalyticsDispatcher } from 'shisell';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import setAnalyticsScope, { LazyAnalytics } from './setAnalyticsScope';
import { analyticsContextTypes } from '../models';

describe('setAnalyticsScope', () => {
    it('Should enhance the dispatcher in the context', () => {
        const InnerComponent = jest.fn().mockReturnValue(null);
        (InnerComponent as React.ComponentType).contextTypes = analyticsContextTypes;

        const Component = setAnalyticsScope(dispatcher => dispatcher.createScoped('Scope1'))(
            InnerComponent
        );

        const result = renderer.create(<Component />);

        const receivedContext = InnerComponent.mock.calls[0][1];
        expect(receivedContext).toEqual({ analytics: expect.any(LazyAnalytics) });
        expect(receivedContext.analytics.dispatcher.Context.Scopes).toEqual(['Scope1']);
    });
});
