import {render} from '@testing-library/react';
import React from 'react';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {withOnPropChangedAnalytic} from './with-on-prop-changed-analytic';

interface Props {
    prop1?: number;
}
const Empty = (_: Props) => null;
const falseProvider = () => false;

describe('withOnPropChangedAnalytic', () => {
    const writer = jest.fn();

    beforeAll(() => {
        Analytics.setWriter(writer);
    });

    beforeEach(() => {
        writer.mockReset();
    });

    it('Sends an analytic when the selected prop changes', async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({propName: 'prop1', analyticName: 'TestAnalytic'})(
            Empty,
        );

        const {rerender} = render(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        rerender(<EnhancedComponent prop1={2} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer).toHaveBeenCalledWith(
            expect.objectContaining({
                Name: 'TestAnalytic',
            }),
        );
    });

    it("Don't send an analytic when the selected prop does not change value", async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({propName: 'prop1', analyticName: 'TestAnalytic'})(
            Empty,
        );

        const {rerender} = render(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        rerender(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).not.toHaveBeenCalled();
    });

    it('Respects change predicate returning false when deciding if to send analytics', async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({
            propName: 'prop1',
            analyticName: 'TestAnalytic',
            valueFilter: falseProvider,
        })(Empty);

        const {rerender} = render(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(0);

        rerender(<EnhancedComponent prop1={2} />);
        await runImmediate();
        expect(writer).not.toHaveBeenCalled();
    });

    it('Sends an analytic when component mounts if includeFirstValue set to true and prop meets filter', async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({
            propName: 'prop1',
            analyticName: 'TestAnalytic',
            includeFirstValue: true,
            valueFilter: (_, b) => b,
        })(Empty);

        render(<EnhancedComponent prop1={1} />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
    });

    it("Don't send an analytic when component mounts if includeFirstValue set to true and prop doesn't meet filter", async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({
            propName: 'prop1',
            analyticName: 'TestAnalytic',
            includeFirstValue: true,
            valueFilter: (_, b) => b,
        })(Empty);

        render(<EnhancedComponent />);
        await runImmediate();
        expect(writer).not.toHaveBeenCalled();
    });

    it('Sends an analytic when component mounts if includeFirstValue set to true and valueFilter not provided', async () => {
        const EnhancedComponent = withOnPropChangedAnalytic<Props>({
            propName: 'prop1',
            analyticName: 'TestAnalytic',
            includeFirstValue: true,
        })(Empty);

        render(<EnhancedComponent />);
        await runImmediate();
        expect(writer).toHaveBeenCalledTimes(1);
    });
});
