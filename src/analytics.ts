import * as shisell from 'shisell';

let customWriter: shisell.EventModelWriter<void> = () => { };
let analyticsDispatcher = shisell.createRootDispatcher(eventModel => customWriter(eventModel));

export default class {
    static get dispatcher() {
        return analyticsDispatcher;
    }
    static transformDispatcher(dispatcherTransformFunc: (dispatcher: shisell.AnalyticsDispatcher) => shisell.AnalyticsDispatcher) {
        analyticsDispatcher = dispatcherTransformFunc(analyticsDispatcher);
    }
    static setWriter(func: shisell.EventModelWriter<void>) {
        customWriter = func;
    }
}
