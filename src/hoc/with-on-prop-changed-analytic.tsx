import * as React from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

export type Predicate2<T1, T2> = (val1: T1, val2: T2) => boolean;
export type TransformPropsFunc<In, Out> = (props: In) => Out;

export interface WithOnPropsChangedConfiguration<T> {
    propName: string;
    analyticName: string;
    valueFilter?: Predicate2<any, any>;
    mapPropsToExtras?: TransformPropsFunc<T, object>;
    includeFirstValue?: boolean;
}

const defaultMapPropsToExtras = () => ({});
const defaultValueFilter = () => true;

export const withOnPropChangedAnalytic = <TProps extends {[_: string]: any}>({
    propName,
    analyticName,
    valueFilter = defaultValueFilter,
    mapPropsToExtras = defaultMapPropsToExtras,
    includeFirstValue = false,
}: WithOnPropsChangedConfiguration<TProps>) => (BaseComponent: React.ReactType<TProps>) =>
    class WithOnPropChangedAnalytic extends React.Component<TProps> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, WithOnPropChangedAnalytic.name);

        componentWillMount() {
            if (includeFirstValue && valueFilter(undefined, this.props[propName])) {
                this.context.analytics.dispatcher.withExtras(mapPropsToExtras(this.props)).dispatch(analyticName);
            }
        }

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
    } as React.ComponentClass<TProps>;
