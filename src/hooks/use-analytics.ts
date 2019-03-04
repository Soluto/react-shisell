import * as React from 'react';
import {ShisellContext, Analytics} from '../shisell-context';

export function useAnalytics(): Analytics {
    if (typeof React.useContext === 'undefined') {
        throw new Error('Hooks are not supported in this react version. use `withAnalytics` instead.');
    }

    return React.useContext(ShisellContext);
}
