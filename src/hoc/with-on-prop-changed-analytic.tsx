import * as React from 'react';
import {Component, FunctionComponent, ReactType} from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {ShisellContext} from '../shisell-context';
import {WithAnalyticsProps} from './with-analytics';
import {withExtras} from 'shisell/extenders';

type Predicate<T1, T2> = (val1: T1, val2: T2) => boolean;

export type WithOnPropsChangedConfiguration<T> = {
    propName: keyof T;
    analyticName: string;
    valueFilter?: Predicate<any, any>;
    mapPropsToExtras?: (props: T) => {};
    includeFirstValue?: boolean;
};

const defaultMapPropsToExtras = () => ({});
const defaultValueFilter = () => true;

type OnPropChangedAnalyticProps = WithAnalyticsProps & {
    analyticName: string;
    valueFilter: Predicate<any, any>;
    includeFirstValue?: boolean;
    getExtraData: () => {};
    value: any;
};

class OnPropChangedAnalytic extends Component<OnPropChangedAnalyticProps> {
    componentDidMount() {
        const {includeFirstValue, valueFilter, value, analytics, getExtraData, analyticName} = this.props;
        if (includeFirstValue && valueFilter(undefined, value)) {
            analytics.dispatcher.extend(withExtras(getExtraData())).dispatch(analyticName);
        }
    }

    componentDidUpdate({value: prevValue}: OnPropChangedAnalyticProps) {
        const {value: nextValue, valueFilter, analytics, getExtraData, analyticName} = this.props;

        if (prevValue !== nextValue && valueFilter(prevValue, nextValue)) {
            analytics.dispatcher.extend(withExtras(getExtraData())).dispatch(analyticName);
        }
    }

    render() {
        return this.props.children;
    }
}

export const withOnPropChangedAnalytic = <TProps extends {}>({
    propName,
    analyticName,
    valueFilter = defaultValueFilter,
    mapPropsToExtras = defaultMapPropsToExtras,
    includeFirstValue = false,
}: WithOnPropsChangedConfiguration<TProps>) => (BaseComponent: ReactType<TProps>) => {
    const EnhancedComponent: FunctionComponent<TProps> = props => (
        <ShisellContext.Consumer>
            {analytics => (
                <OnPropChangedAnalytic
                    analytics={analytics}
                    analyticName={analyticName}
                    valueFilter={valueFilter}
                    includeFirstValue={includeFirstValue}
                    getExtraData={() => mapPropsToExtras(props)}
                    value={props[propName]}
                >
                    {
                        // @ts-ignore
                        <BaseComponent {...props} />
                    }
                </OnPropChangedAnalytic>
            )}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withOnPropChangedAnalytic');

    return EnhancedComponent;
};
