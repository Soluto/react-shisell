jest.mock('../lib/analytics');
import Analytics from '../lib/analytics';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { enrichAnalytics, withAnalytics, analytics } from '../lib/index';

import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import { getContext, compose } from 'recompose';
import * as sinon from 'sinon';

type propsWithAnalytics = { analytics: { dispatcher: shisell.AnalyticsDispatcher } };

const AnalyticsDispatchingComponent: React.StatelessComponent<propsWithAnalytics> = (props: propsWithAnalytics) => {
    props.analytics.dispatcher.dispatch('Component_Rendered');
    return <div />;
};

describe('enrichAnalytics', () => {
    beforeEach(function () {
        sinon.spy(Analytics.dispatcher, 'createScoped');
    });

    afterEach(function () {
        (Analytics.dispatcher.createScoped as sinon.SinonSpy).restore();
    });

    const transformAnalyticsFunc = dispatcher => {
        return dispatcher.createScoped('IdanScope');
    };

    it('applies the dispatcher transformation before dispatch is called', () => {
        const EnhancedComponent = compose(enrichAnalytics(transformAnalyticsFunc), withAnalytics)(
            AnalyticsDispatchingComponent
        );

        const result = renderer.create(<EnhancedComponent />);

        const createScoped = Analytics.dispatcher.createScoped as sinon.SinonSpy;
        expect(createScoped.calledOnce).toBe(true);
        expect(createScoped.getCall(0).args[0]).toBe('IdanScope');
    });

    it('does not apply the dispatcher transformation if dispatch is not called', () => {
        const Component = () => <div />
        const EnhancedComponent = compose(enrichAnalytics(transformAnalyticsFunc), withAnalytics)(Component);

        const result = renderer.create(<EnhancedComponent />);

        const createScoped = Analytics.dispatcher.createScoped as sinon.SinonSpy;
        expect((createScoped).notCalled).toBe(true);
    });
});