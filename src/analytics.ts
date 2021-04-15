import * as shisell from 'shisell';

let customWriter: shisell.EventModelWriter<void> = () => {};
let analyticsDispatcher: shisell.AnalyticsDispatcher<void> = shisell.createRootDispatcher(eventModel =>
    customWriter(eventModel),
);

export default {
    get dispatcher() {
        return analyticsDispatcher;
    },
    transformDispatcher(
        dispatcherTransformFunc: (dispatcher: shisell.AnalyticsDispatcher<void>) => shisell.AnalyticsDispatcher<void>,
    ) {
        analyticsDispatcher = dispatcherTransformFunc(analyticsDispatcher);
    },
    setWriter(func: shisell.EventModelWriter<void>) {
        customWriter = func;
    },
};
