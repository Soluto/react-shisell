import * as React from 'react';
import { Requireable } from 'prop-types';
import { analyticsContextTypes, AnalyticsProps, MapPropsToExtras } from '../models';

const withDispatchOnceAnalytic = <TProps extends {}>(
    analyticName: string,
    propsToExtras: MapPropsToExtras<TProps> = () => ({})
) => (WrappedComponent: React.ComponentType<TProps>) =>
    class DispatchOnceAnalyticComponent extends React.Component<TProps> {
        context: AnalyticsProps;

        static contextTypes = analyticsContextTypes;

        componentDidMount() {
            this.context.analytics.dispatcher
                .withExtras(propsToExtras(this.props))
                .dispatch(analyticName);
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

export default withDispatchOnceAnalytic;
