import * as React from 'react';
import {Component, ComponentClass, ReactType} from 'react';
import {wrapDisplayName} from '../wrapDisplayName';
import {ShisellContext} from '../shisell-context';

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

export const withOnPropChangedAnalytic = <TProps extends {}>({
    propName,
    analyticName,
    valueFilter = defaultValueFilter,
    mapPropsToExtras = defaultMapPropsToExtras,
    includeFirstValue = false,
}: WithOnPropsChangedConfiguration<TProps>) => (BaseComponent: ReactType<TProps>): ComponentClass<TProps> =>
    class extends Component<TProps> {
        static contextType = ShisellContext;
        static displayName = wrapDisplayName(BaseComponent, 'withOnPropChangedAnalytic');

        componentDidMount() {
            if (includeFirstValue && valueFilter(undefined, this.props[propName])) {
                this.context.dispatcher.withExtras(mapPropsToExtras(this.props as any)).dispatch(analyticName);
            }
        }

        componentDidUpdate(nextProps: TProps) {
            const prevProps = this.props;

            const prevValue = prevProps[propName];
            const nextValue = nextProps[propName];

            if (prevValue !== nextValue && valueFilter(prevValue, nextValue)) {
                this.context.dispatcher.withExtras(mapPropsToExtras(nextProps)).dispatch(analyticName);
            }
        }

        render() {
            // @ts-ignore
            return <BaseComponent {...this.props} />;
        }
    };
