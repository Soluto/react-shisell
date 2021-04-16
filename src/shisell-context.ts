import {createContext} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import analytics from './analytics';

export type Analytics = {
    dispatcher: AnalyticsDispatcher<void>;
};

export const ShisellContext = createContext<Analytics>({
    get dispatcher() {
        return analytics.dispatcher;
    },
});

ShisellContext.displayName = 'Analytics';

export const AnalyticsConsumer = ShisellContext.Consumer;
