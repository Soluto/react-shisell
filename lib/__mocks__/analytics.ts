var stub: any = {};
stub.withExtra = () => stub;
stub.withContext = () => stub;
stub.createScoped = () => stub;
stub.withFilter = () => stub;
stub.withFilters = () => stub;
stub.withMeta = () => stub;
stub.withIdentity = () => stub;
stub.dispatch = (eventName: string) => console.log(`analytics.dispatch: ${eventName}`);

export type writer = () => void;

let customWriter: writer = () => { };
export default class {
    static get dispatcher() {
        return stub
    }

    static setWriter(func: writer) {
        customWriter = func;
    }
}
