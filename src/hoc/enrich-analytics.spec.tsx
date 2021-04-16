import React from 'react';
import renderer from 'react-test-renderer';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {ShisellContext} from '../shisell-context';
import {enrichAnalytics} from './enrich-analytics';
import {createScoped} from 'shisell/extenders';
import {useContext} from 'react';

const AnalyticsSender = () => {
    const analytics = useContext(ShisellContext);
    analytics.dispatcher.dispatch('TestAnalytic');
    return null;
};

describe('enrichAnalytics', () => {
    const writer = jest.fn();

    beforeAll(() => {
        Analytics.setWriter(writer);
    });

    it('Applies transformation to dispatchers below in context', async () => {
        const EnhancedComponent = enrichAnalytics((dispatcher) => dispatcher.extend(createScoped('Rawr')))(
            AnalyticsSender,
        );

        renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
                Scope: 'Rawr',
            }),
        );
    });
});
