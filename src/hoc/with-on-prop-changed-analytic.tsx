import * as React from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

type Predicate2<T1, T2> = (val1: T1, val2: T2) => boolean;
type TransformPropsFunc<In extends object, Out extends object> = (props: In) => Out;

const defaultMapPropsToExtras = () => ({});
const defaultValueFilter = () => true;

export const withOnPropChangedAnalytic = <TProps extends {[_: string]: any}, TProp extends keyof TProps>(
    propName: TProp,
    analyticName: string,
    valueFilter: Predicate2<TProp, TProp> = defaultValueFilter,
    mapPropsToExtras: TransformPropsFunc<TProps, object> = defaultMapPropsToExtras
) => (BaseComponent: React.ReactType<TProps>) =>
    class WithOnPropChangedAnalytic extends React.Component<TProps> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, WithOnPropChangedAnalytic.name);

        componentWillReceiveProps(nextProps: TProps) {
            const prevProps = this.props;

            const prevValue = prevProps[propName];
            const nextValue = nextProps[propName];

            if (prevValue !== nextValue && valueFilter(prevValue, nextValue)) {
                this.context.analytics.dispatcher.withExtras(mapPropsToExtras(nextProps)).dispatch(analyticName);
            }
        }

        render() {
            return <BaseComponent {...this.props} />;
        }
    };
