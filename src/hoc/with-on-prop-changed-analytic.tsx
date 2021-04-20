import React, {ElementType, FunctionComponent, useEffect, useRef} from 'react';
import {useAnalytics} from '../hooks/use-analytics';
import {wrapDisplayName} from '../wrapDisplayName';
import {ExtendEventAnalytics} from './with-analytic-on-event';

export type WithOnPropsChangedConfiguration<
    PropName extends string,
    PropValue,
    Props extends Record<PropName, PropValue> = Record<PropName, PropValue>
> = {
    propName: PropName;
    analyticName: string;
    valueFilter?: (val1: PropValue | undefined, val2: PropValue) => boolean;
    includeFirstValue?: boolean;
    extendAnalytics?: ExtendEventAnalytics<[Props]>;
};

const defaultValueFilter = () => true;

export function withOnPropChangedAnalytic<
    PropName extends string,
    PropValue,
    BaseProps extends Record<PropName, PropValue> = Record<PropName, PropValue>
>({
    propName,
    analyticName,
    valueFilter = defaultValueFilter,
    includeFirstValue = false,
    extendAnalytics,
}: WithOnPropsChangedConfiguration<PropName, PropValue, BaseProps>) {
    return <Props extends BaseProps>(BaseComponent: ElementType<Props>) => {
        const EnhancedComponent: FunctionComponent<Props> = (props) => {
            const analytics = useAnalytics();

            const value = props[propName];
            const prevValue = useRef(value);

            useEffect(() => {
                const isFirstValue = prevValue.current === value;

                if (isFirstValue && !includeFirstValue) {
                    return;
                }

                if (valueFilter(isFirstValue ? undefined : prevValue.current, value)) {
                    let {dispatcher} = analytics;
                    if (extendAnalytics) {
                        dispatcher = dispatcher.extend(extendAnalytics(props));
                    }
                    dispatcher.dispatch(analyticName);
                }

                prevValue.current = value;
            }, [value]);

            // @ts-ignore
            return <BaseComponent {...props} />;
        };

        EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withOnPropChangedAnalytic');

        return EnhancedComponent;
    };
}
