import {createContext, Context} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import analytics from './analytics';

export type Analytics = {
    dispatcher: AnalyticsDispatcher;
};

export const ShisellContext = createContext<Analytics>({
    get dispatcher() {
        return analytics.dispatcher;
    },
});

ShisellContext.displayName = 'Shisell';
