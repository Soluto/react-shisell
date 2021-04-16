import {AnalyticsDispatcher, createRootDispatcher, EventModelWriter} from 'shisell';

let customWriter: EventModelWriter<void> = () => {};
let analyticsDispatcher: AnalyticsDispatcher<void> = createRootDispatcher((eventModel) => customWriter(eventModel));

export default {
    get dispatcher() {
        return analyticsDispatcher;
    },
    transformDispatcher(dispatcherTransformFunc: (dispatcher: AnalyticsDispatcher<void>) => AnalyticsDispatcher<void>) {
        analyticsDispatcher = dispatcherTransformFunc(analyticsDispatcher);
    },
    setWriter(func: EventModelWriter<void>) {
        customWriter = func;
    },
};
