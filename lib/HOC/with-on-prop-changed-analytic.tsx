import * as React from 'react';
import {Requireable} from 'prop-types';

import {TransformPropsFunc} from './types';
import analyticsContextTypes, {AnalyticsContext} from './analytics-context-types';

type Predicate2 = (val1: any, val2: any) => boolean;

const defaultMapPropsToExtras = () => ({});

export const withOnPropChangedAnalytic = (
    propName: string,
    valueFilter: Predicate2,
    analyticName: string,
    mapPropsToExtras: TransformPropsFunc = defaultMapPropsToExtras
) => <Props extends {[_: string]: any}>(InnerComponent: React.ComponentType<Props>) =>
    class WithOnPropChangedAnalytic extends React.Component<Props> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;

        componentWillReceiveProps(nextProps: Props) {
            const prevProps = this.props;

            const prevValue = prevProps[propName];
            const nextValue = nextProps[propName];

            if (prevValue !== nextValue && valueFilter(prevValue, nextValue)) {
                this.context.analytics.dispatcher.withExtras(mapPropsToExtras(nextProps)).dispatch(analyticName);
            }
        }

        render() {
            return <InnerComponent {...this.props} />;
        }
    };
