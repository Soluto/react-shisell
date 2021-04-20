import React, {ComponentType, FunctionComponent} from 'react';
import {Analytics} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';
import {useAnalytics} from '../hooks/use-analytics';

export type WithAnalyticsProps = {
    analytics: Analytics;
};

export function withAnalytics<Props extends WithAnalyticsProps>(BaseComponent: ComponentType<Props>) {
    const EnhancedComponent: FunctionComponent<Omit<Props, keyof WithAnalyticsProps>> = (props) => {
        const analytics = useAnalytics();
        return <BaseComponent {...(props as Props)} analytics={analytics} />;
    };

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalytics');

    return EnhancedComponent;
}
