import * as React from 'react';
import {ComponentType, FunctionComponent} from 'react';
import {ShisellContext, Analytics} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';

export type WithAnalyticsProps = {
    analytics: Analytics;
};

export function withAnalytics<TProps extends WithAnalyticsProps>(BaseComponent: ComponentType<TProps>) {
    const EnhancedComponent: FunctionComponent<
        Pick<TProps, Exclude<keyof TProps, keyof WithAnalyticsProps>>
    > = props => (
        <ShisellContext.Consumer>
            {analytics => <BaseComponent {...props} analytics={analytics} />}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalytics');

    return EnhancedComponent;
}
