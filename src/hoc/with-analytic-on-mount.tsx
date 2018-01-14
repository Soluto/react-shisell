import * as React from 'react';
import {Requireable} from 'prop-types';

import {TransformPropsFunc} from './types';
import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

const defaultPropsToExtrasMapper = () => ({});

export const withAnalyticOnMount = (
    analyticName: string,
    mapPropsToExtras: TransformPropsFunc = defaultPropsToExtrasMapper
) => <P extends object>(InnerComponent: React.ComponentType<P>) =>
    class WithAnalyticOnMount extends React.Component<P> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;

        componentDidMount() {
            this.context.analytics.dispatcher.withExtras(mapPropsToExtras(this.props)).dispatch(analyticName);
        }

        render() {
            return <InnerComponent {...this.props} />;
        }
    };
