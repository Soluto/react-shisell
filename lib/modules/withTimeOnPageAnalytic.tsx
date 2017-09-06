import * as React from 'React';
import { Requireable } from 'prop-types';
import { AnalyticsProps } from '../models';
import { analyticsContextTypes } from '../all';

const withTimeOnPageAnalytic = (analyticName: string) => {
    return <T extends {}>(WrappedComponent: React.ComponentType<T>) =>
        class ComponentWithTimeOnPageAnalytics extends React.Component {
            mountTimestamp: number;
            context: AnalyticsProps;

            static contextTypes = analyticsContextTypes;

            componentDidMount() {
                this.mountTimestamp = Date.now();
            }

            componentWillUnmount() {
                const timeOnPageMs = Date.now() - this.mountTimestamp;
                const timeOnPageSec = timeOnPageMs / 1000;
                this.context.analytics.dispatcher
                    .withExtra(analyticName, timeOnPageSec)
                    .dispatch(analyticName);
            }

            render() {
                return <WrappedComponent {...this.props} />;
            }
        };
};

export default withTimeOnPageAnalytic;
