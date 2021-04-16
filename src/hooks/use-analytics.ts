import {useContext} from 'react';
import {Analytics, ShisellContext} from '../shisell-context';

export function useAnalytics(): Analytics {
    return useContext(ShisellContext);
}
