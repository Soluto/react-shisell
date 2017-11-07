import { compose, mapPropsStreamWithConfig, ComponentEnhancer } from 'recompose';
import rxjsconfig from 'recompose/rxjsObservableConfig';
import { Observable } from 'rxjs';

import { propsToExtras, predicate, propsWithAnalytics } from './types';
import { withAnalytics } from './with-analytics'
import { withoutAnalytics } from './without-analytics'

const doOnFirstProps = (filter: predicate, onFirstProps: (props: propsWithAnalytics) => {}) =>
    mapPropsStreamWithConfig(rxjsconfig)(props$ => {
        const rxStream = props$ as Observable<{}>;
        const onFirstProps$ = rxStream.first(filter).do(onFirstProps).ignoreElements();
        return Observable.merge(rxStream, onFirstProps$);
    });

export const withAnalyticOnMount = (analyticName: string, propsToExtras: propsToExtras = () => ({})) =>
    compose(
        withAnalytics,
        doOnFirstProps(
            props => props,
            ({ analytics, ...otherProps }) =>
                analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName)
        ),
        withoutAnalytics
    );