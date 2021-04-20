import React, {ElementType, FunctionComponent, useEffect, useRef} from 'react';
import {useAnalytics} from '../hooks/use-analytics';
import {wrapDisplayName} from '../wrapDisplayName';
import {ExtendEventAnalytics} from './with-analytic-on-event';

export interface WithAnalyticOnViewConfiguration<T> {
    analyticName: string;
    extendAnalytics?: ExtendEventAnalytics<[T]>;
    shouldDispatchAnalytics?: (props: T) => boolean;
}

export const withAnalyticOnView = <BaseProps extends {} = {}>({
    analyticName,
    extendAnalytics,
    shouldDispatchAnalytics,
}: WithAnalyticOnViewConfiguration<BaseProps>) => <Props extends BaseProps>(BaseComponent: ElementType<Props>) => {
    const EnhancedComponent: FunctionComponent<Props> = (props) => {
        const analytics = useAnalytics();
        const didSendAnalytic = useRef(false);

        useEffect(() => {
            if (didSendAnalytic.current || (shouldDispatchAnalytics && !shouldDispatchAnalytics(props))) {
                return;
            }

            let {dispatcher} = analytics;
            if (extendAnalytics) {
                dispatcher = dispatcher.extend(extendAnalytics(props));
            }

            dispatcher.dispatch(analyticName);
            didSendAnalytic.current = true;
        });

        // @ts-ignore
        return <BaseComponent {...props} />;
    };

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnView');
    return EnhancedComponent;
};
