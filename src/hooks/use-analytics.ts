import * as React from 'react';
import {ShisellContext} from '../shisell-context';

export function useAnalytics() {
    if (typeof React.useContext === 'undefined') {
        throw new Error('Hooks are not supported in this react version. use `withAnalytics` instead.');
    }

    return React.useContext(ShisellContext);
}
