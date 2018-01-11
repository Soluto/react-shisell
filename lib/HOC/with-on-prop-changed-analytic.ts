import { compose, mapPropsStreamWithConfig, ComponentEnhancer } from 'recompose';
import { Observable } from 'rxjs';
import rxjsconfig from 'recompose/rxjsObservableConfig';

import { TransformPropsFunc } from './types';
import { withAnalytics } from './with-analytics';
import { withoutAnalytics } from './without-analytics';

const doOnChangeProps = (changedPropName: string, valueBeforeChangeFilter: any, valueAfterChangeFilter: any, doFunc: (prop: any) => void) =>
    mapPropsStreamWithConfig(rxjsconfig)(props$ => {
        const rxStream = props$ as Observable<{}>;

        return Observable.combineLatest(
            rxStream,
            rxStream
                .pairwise()
                .filter(
                (propsPair: Array<{ [key: string]: any }>) =>
                    valueBeforeChangeFilter(propsPair[0][changedPropName]) &&
                    valueAfterChangeFilter(propsPair[1][changedPropName])
                )
                .do((propsPair: Array<object>) => doFunc(propsPair[1]))
                .startWith(null),
            (props, _) => props
        );
    }
    );

export const withOnPropChangedAnalytic = (
    changedPropName: string,
    valueBeforeChangeFilter: any,
    valueAfterChangeFilter: any,
    analyticName: string,
    propsToExtras: TransformPropsFunc = () => ({})) =>
    compose(
        withAnalytics,
        doOnChangeProps(
            changedPropName,
            valueBeforeChangeFilter,
            valueAfterChangeFilter,
            ({ analytics, ...otherProps }) =>
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName)
        ),
        withoutAnalytics
    );