import * as React from 'react';
import {ShisellContext, Analytics} from '../shisell-context';
import {verifyHooksExist} from './verify-hooks-exist';

export function useAnalytics(): Analytics {
    verifyHooksExist('withAnalytics');

    return React.useContext(ShisellContext);
}
