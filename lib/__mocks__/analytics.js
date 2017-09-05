var stub = {};
stub.withExtra = () => stub;
stub.withContext = () => stub;
stub.createScoped = () => stub;
stub.withFilter = () => stub;
stub.withFilters = () => stub;
stub.withMeta = () => stub;
stub.withIdentity = () => stub;
stub.dispatch = eventName => console.log(`analytics.dispatch: ${eventName}`);

let customWriter = () => {};

export default class {
    static get dispatcher() {
        return stub;
    }
    static transformDispatcher(dispatcherTransformFunc) {
        analyticsDispatcher = dispatcherTransformFunc(analyticsDispatcher);
    }
    static setWriter(func) {
        customWriter = func;
    }
}
