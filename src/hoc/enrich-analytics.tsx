import React, {ComponentType, FunctionComponent} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {wrapDisplayName} from '../wrapDisplayName';
import {AnalyticsProvider} from '../analytics-provider';

type TransformAnalyticsFunc<T> = (dispatcher: AnalyticsDispatcher<void>, props: T) => AnalyticsDispatcher<void>;

export function enrichAnalytics<Props>(transformAnalyticsFunc: TransformAnalyticsFunc<Props>) {
    return (BaseComponent: ComponentType<Props>) => {
        const EnhancedComponent: FunctionComponent<Props> = (props) => (
            <AnalyticsProvider dispatcher={(dispatcher) => transformAnalyticsFunc(dispatcher, props)}>
                <BaseComponent {...props} />
            </AnalyticsProvider>
        );

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'enrichAnalytics');

        return EnhancedComponent;
    };
}
