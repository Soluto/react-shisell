import * as React from 'React';
import { Requireable } from 'prop-types';
import { analyticsContextTypes, AnalyticsProps, MapPropsToExtras, Predicate } from '../models';

const defaultMapPropsToExtras = () => ({});

const withViewAnalytic = <TProps extends {}>(
    where: Predicate<TProps>,
    propsToExtras: MapPropsToExtras = defaultMapPropsToExtras
) => {
    return (WrappedComponent: React.ComponentType<TProps>) =>
        class WithViewAnalytic extends React.Component<TProps> {
            didSendViewAnalytic: boolean = false;
            context: AnalyticsProps;

            static contextTypes = analyticsContextTypes;

            sendViewAnalyticIfNeeded() {
                const { analytics: { dispatcher } } = this.context;

                if (where(this.props)) {
                    dispatcher.withExtras(propsToExtras(this.props)).dispatch('View');
                    this.didSendViewAnalytic = true;
                }
            }

            componentDidMount() {
                this.sendViewAnalyticIfNeeded();
            }

            componentDidUpdate() {
                if (!this.didSendViewAnalytic) {
                    this.sendViewAnalyticIfNeeded();
                }
            }

            render() {
                return <WrappedComponent {...this.props} />;
            }
        };
};

export default withViewAnalytic;
