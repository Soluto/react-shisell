import * as React from 'react';
import {ComponentType, FunctionComponent} from 'react';
import {AnalyticsDispatcher} from 'shisell';
import {wrapDisplayName} from '../wrapDisplayName';
import {ShisellContext} from '../shisell-context';

type TransformAnalyticsFunc<T> = (dispatcher: AnalyticsDispatcher, props: T) => AnalyticsDispatcher;

export function enrichAnalytics<Props>(transformAnalyticsFunc: TransformAnalyticsFunc<Props>) {
    return (BaseComponent: ComponentType<Props>) => {
        const EnhancedComponent: FunctionComponent<Props> = props => (
            <ShisellContext.Consumer>
                {analytics => (
                    <ShisellContext.Provider
                        value={{
                            get dispatcher() {
                                return transformAnalyticsFunc(analytics.dispatcher, props);
                            },
                        }}
                    >
                        <BaseComponent {...props} />
                    </ShisellContext.Provider>
                )}
            </ShisellContext.Consumer>
        );

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'enrichAnalytics');

        return EnhancedComponent;
    };
}
