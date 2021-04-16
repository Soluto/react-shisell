import React, {ComponentType, FunctionComponent} from 'react';
import {Analytics, ShisellContext} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';

export type WithAnalyticsProps = {
    analytics: Analytics;
};

export function withAnalytics<TProps extends WithAnalyticsProps>(BaseComponent: ComponentType<TProps>) {
    const EnhancedComponent: FunctionComponent<Pick<TProps, Exclude<keyof TProps, keyof WithAnalyticsProps>>> = (
        props,
    ) => (
        <ShisellContext.Consumer>
            {(analytics) => <BaseComponent {...(props as TProps)} analytics={analytics} />}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalytics');

    return EnhancedComponent;
}
