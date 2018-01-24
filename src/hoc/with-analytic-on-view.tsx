import * as React from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

export type TransformPropsFunc<In, Out> = (props: In) => Out;
export interface WithAnalyticOnViewConfiguration<T> {
    analyticName: string;
    predicate?: (props: T) => boolean;
    mapPropsToExtras?: TransformPropsFunc<T, object>;
}

const defaultPropsToExtrasMapper = () => ({});
const defaultPredicate = () => true;

export const withAnalyticOnView = <TProps extends object>({
    analyticName,
    predicate = defaultPredicate,
    mapPropsToExtras = defaultPropsToExtrasMapper,
}: WithAnalyticOnViewConfiguration<TProps>) => (BaseComponent: React.ReactType<TProps>) =>
    class WithAnalyticOnView extends React.Component<TProps> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;
        static displayName = wrapDisplayName(BaseComponent, WithAnalyticOnView.name);

        didSendAnalytic = false;

        trySendAnalytic() {
            if (this.didSendAnalytic || !predicate(this.props)) return;

            this.context.analytics.dispatcher.withExtras(mapPropsToExtras(this.props)).dispatch(analyticName);
            this.didSendAnalytic = true;
        }

        componentDidMount() {
            this.trySendAnalytic();
        }

        componentDidUpdate() {
            this.trySendAnalytic();
        }

        render() {
            return <BaseComponent {...this.props} />;
        }
    } as React.ComponentClass<TProps>;
