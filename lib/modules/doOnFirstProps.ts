import { Observable } from 'rxjs/Observable';
import { ComponentEnhancer } from 'recompose';
import { Predicate, AnalyticsProps } from '../models';
import mapPropsStream from '../utils/mapPropsStream';

const doOnFirstProps = <T extends AnalyticsProps>(
    filter: Predicate,
    onFirstProps: (props: T) => void
) =>
    mapPropsStream(props$ => {
        const onFirstProps$ = (props$ as Observable<T>)
            .first(filter)
            .do(onFirstProps)
            .ignoreElements();

        return Observable.merge(props$, onFirstProps$);
    });

export default doOnFirstProps;
