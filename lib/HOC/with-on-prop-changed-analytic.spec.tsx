import * as React from 'react';
import * as renderer from 'react-test-renderer';
import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import {compose} from 'recompose';

import {withOnPropChangedAnalytic} from './with-on-prop-changed-analytic';
import {enrichAnalytics} from './enrich-analytics';
import Analytics from '../analytics';

import {runImmediate} from '../testUtils';

interface Props {
    prop1: number;
}
const Empty = (props: Props) => null;
const identity = <T extends any>(f: T) => f;
const trueProvider = () => true;
const falseProvider = () => false;

describe('withOnPropChangedAnalytic', () => {
    let writer = jest.fn();

    beforeAll(() => {
        Analytics.setWriter(writer);
    });

    beforeEach(() => {
        writer.mockReset();
    });

    it('Sends an analytic when the selected prop changes', async () => {
        const EnhancedComponent = compose<Props, Props>(
            enrichAnalytics(identity),
            withOnPropChangedAnalytic('prop1', trueProvider, 'TestAnalytic')
        )(Empty);

        const result = renderer.create(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        result.update(<EnhancedComponent prop1={2} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
        });
    });

    it("Don't send an analytic when the selected prop does not change value", async () => {
        const EnhancedComponent = compose<Props, Props>(
            enrichAnalytics(identity),
            withOnPropChangedAnalytic('prop1', trueProvider, 'TestAnalytic')
        )(Empty);

        const result = renderer.create(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        result.update(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);
    });

    it('Respects change predicate returning false when deciding if to send analytics', async () => {
        const EnhancedComponent = compose<Props, Props>(
            enrichAnalytics(identity),
            withOnPropChangedAnalytic('prop1', falseProvider, 'TestAnalytic')
        )(Empty);

        const result = renderer.create(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        result.update(<EnhancedComponent prop1={2} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);
    });
});
