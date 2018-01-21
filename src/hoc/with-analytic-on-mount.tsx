import * as React from 'react';
import {wrapDisplayName} from 'recompose';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

type TransformPropsFunc = (props: object) => object;

const defaultPropsToExtrasMapper = () => ({});

export const withAnalyticOnMount = (
    analyticName: string,
    mapPropsToExtras: TransformPropsFunc = defaultPropsToExtrasMapper
) => <P extends object>(BaseComponent: React.ComponentType<P>) =>
    class WithAnalyticOnMount extends React.Component<P> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, WithAnalyticOnMount.name);

        componentDidMount() {
            this.context.analytics.dispatcher.withExtras(mapPropsToExtras(this.props)).dispatch(analyticName);
        }

        render() {
            return <BaseComponent {...this.props} />;
        }
    };
