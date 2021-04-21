import {renderHook} from '@testing-library/react-hooks';
import {ShisellContext} from '../shisell-context';
import {useAnalytics} from './use-analytics';

describe('useAnalytics', () => {
    const ANALYTICS: any = 'some analytics';

    it('Should return analytics object from context', () => {
        const {result} = renderHook(useAnalytics, {wrapper: ShisellContext.Provider, initialProps: {value: ANALYTICS}});
        expect(result.current).toEqual(ANALYTICS);
    });
});
