import { ComponentEnhancer, compose } from 'recompose';
import doOnChangeProps from './doOnChangeProps';
import { withAnalytics, withoutAnalytics } from './withAnalytics';
import { AnalyticsProps, MapPropsToExtras, Predicate } from '../models';

const withOnChangeAnalytic = <TProps extends {}, TPropName extends keyof TProps>(
    changedPropName: TPropName,
    valueBeforeChangeFilter: Predicate<TProps[TPropName]>,
    valueAfterChangeFilter: Predicate<TProps[TPropName]>,
    analyticName: string,
    propsToExtras: MapPropsToExtras = () => ({})
) =>
    compose<TProps, TProps>(
        withAnalytics,
        doOnChangeProps<
            TProps & AnalyticsProps,
            TPropName
        >(changedPropName, valueBeforeChangeFilter, valueAfterChangeFilter, props => {
            const otherProps = Object.assign({}, props);
            delete otherProps.analytics;

            props.analytics.dispatcher.withExtras(propsToExtras(otherProps)).dispatch(analyticName);
        }),
        withoutAnalytics
    );

export default withOnChangeAnalytic;
