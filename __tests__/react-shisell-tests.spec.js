jest.mock('../lib/analytics');
import analytics from 'tech-app-common/analytics/analytics';
import renderer from 'react-test-renderer';
import {setAnalyticsScope, withAnalytics, TransformAnalyticsFunc} from 'tech-app-common/analytics/reactShisell';
import {Text, View} from 'react-native';

import PropTypes from 'prop-types';

import React from 'react';
import {getContext, compose} from 'recompose';
import sinon from 'sinon';

const AnalyticsDispatchingComponent = ({analytics}) => {
    analytics.dispatcher.dispatch('Component_Rendered');
    return <View />;
};

const Component = () => {
    return <View />;
};

describe('setAnalyticsScope', () => {
    beforeEach(function() {
        sinon.spy(analytics.dispatcher, 'createScoped');
    });

    afterEach(function() {
        analytics.dispatcher.createScoped.restore();
    });

    const transformAnalyticsFunc: TransformAnalyticsFunc = dispatcher => {
        return dispatcher.createScoped('IdanScope');
    };

    it('applies the dispatcher transformation before dispatch is called', () => {
        const EnhancedComponent = compose(setAnalyticsScope(transformAnalyticsFunc), withAnalytics)(
            AnalyticsDispatchingComponent
        );

        const result = renderer.create(<EnhancedComponent />);

        const createScoped = analytics.dispatcher.createScoped;
        expect(createScoped.calledOnce).toBe(true);
        expect(createScoped.getCall(0).args[0]).toBe('IdanScope');
    });

    it('does not apply the dispatcher transformation if dispatch is not called', () => {
        const EnhancedComponent = compose(setAnalyticsScope(transformAnalyticsFunc), withAnalytics)(Component);

        const result = renderer.create(<EnhancedComponent />);

        const createScoped = analytics.dispatcher.createScoped;
        expect(createScoped.notCalled).toBe(true);
    });
});