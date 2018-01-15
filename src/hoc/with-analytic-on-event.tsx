import * as React from 'react';
import {Requireable} from 'prop-types';

import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';

const emptyObjectProvider = () => ({});
const trueProvider = () => true;

type ExtraAnalyticsData = {[key: string]: any};
type ExtraAnalyticsDataProvider<Props, Event> = (props: Props, event: Event) => ExtraAnalyticsData;
type DataMapper<Props, Event> = ExtraAnalyticsData | ExtraAnalyticsDataProvider<Props, Event>;
type Predicate2<T1, T2> = (val1: T1, val2: T2) => boolean;
type EventHocConfiguration<Props, Event> = {
    eventName: string;
    analyticName: string;
    mapPropsToExtras: DataMapper<Props, Event>;
    mapPropsToIdentities: DataMapper<Props, Event>;
    shouldDispatch: Predicate2<Props, Event>;
};

export const withAnalyticOnEvent = <Props extends object, Event extends object>({
    eventName,
    analyticName,
    mapPropsToExtras = emptyObjectProvider,
    mapPropsToIdentities = emptyObjectProvider,
    shouldDispatch = trueProvider,
}: EventHocConfiguration<Props, Event>) => (BaseComponent: React.ComponentType<Props>) =>
    class WithAnalyticOnEvent extends React.Component<Props> {
        context: AnalyticsContext;

        static contextTypes = analyticsContextTypes;

        constructor(props: Props) {
            super(props);

            this.onEvent = this.onEvent.bind(this);
        }

        onEvent(e: Event) {
            if (shouldDispatch(this.props, e)) {
                const extraData =
                    typeof mapPropsToExtras === 'function' 
                    ? mapPropsToExtras(this.props, e) 
                    : mapPropsToExtras;

                const identities =
                    typeof mapPropsToIdentities === 'function'
                        ? mapPropsToIdentities(this.props, e)
                        : mapPropsToIdentities;

                this.context.analytics.dispatcher
                    .withExtras(extraData)
                    .withIdentities(identities)
                    .dispatch(analyticName);
            }

            if ((this.props as any)[eventName]) {
                (this.props as any)[eventName](e);
            }
        }

        render() {
            const newProps = Object.assign({}, this.props, {[eventName]: this.onEvent});

            return <BaseComponent {...newProps} />;
        }
    };