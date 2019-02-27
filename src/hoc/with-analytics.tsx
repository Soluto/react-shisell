import * as React from 'react';
import {ComponentType, FunctionComponent} from 'react';
import {ShisellContext, Analytics} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';

export type WithAnalyticsProps = {
    analytics: Analytics;
};

export function withAnalytics<TProps>(BaseComponent: ComponentType<TProps & WithAnalyticsProps>) {
    const EnhancedComponent: FunctionComponent<TProps> = props => (
        <ShisellContext.Consumer>
            {analytics => <BaseComponent {...props} analytics={analytics} />}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalytics');

    return EnhancedComponent;
}
