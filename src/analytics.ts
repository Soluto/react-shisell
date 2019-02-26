import * as shisell from 'shisell';

let customWriter: shisell.EventModelWriter<void> = () => {};
let analyticsDispatcher = shisell.createRootDispatcher(eventModel => customWriter(eventModel));

export default {
    get dispatcher() {
        return analyticsDispatcher;
    },
    transformDispatcher(
        dispatcherTransformFunc: (dispatcher: shisell.AnalyticsDispatcher) => shisell.AnalyticsDispatcher,
    ) {
        analyticsDispatcher = dispatcherTransformFunc(analyticsDispatcher);
    },
    setWriter(func: shisell.EventModelWriter<void>) {
        customWriter = func;
    },
};
