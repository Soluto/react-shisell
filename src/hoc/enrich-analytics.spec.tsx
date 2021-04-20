import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {createScoped} from 'shisell/extenders';
import Analytics from '../analytics';
import {ShisellContext} from '../shisell-context';
import {runImmediate} from '../testUtils';
import {enrichAnalytics} from './enrich-analytics';

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

        render(<EnhancedComponent />);

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
