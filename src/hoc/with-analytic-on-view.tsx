import * as React from 'react';
import {Component, ComponentClass, ReactType} from 'react';
import {ShisellContext} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';

export interface WithAnalyticOnViewConfiguration<T> {
    analyticName: string;
    predicate?: (props: T) => boolean;
    mapPropsToExtras?: (props: T) => object;
}

const defaultPropsToExtrasMapper = () => ({});
const defaultPredicate = () => true;

export const withAnalyticOnView = <TProps extends object>({
    analyticName,
    predicate = defaultPredicate,
    mapPropsToExtras = defaultPropsToExtrasMapper,
}: WithAnalyticOnViewConfiguration<TProps>) => (BaseComponent: ReactType<TProps>): ComponentClass<TProps> =>
    class WithAnalyticOnView extends Component<TProps> {
        static contextType = ShisellContext;

        static displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnView');

        didSendAnalytic = false;

        trySendAnalytic() {
            if (this.didSendAnalytic || !predicate(this.props as TProps)) return;

            this.context.dispatcher.withExtras(mapPropsToExtras(this.props as TProps)).dispatch(analyticName);
            this.didSendAnalytic = true;
        }

        componentDidMount() {
            this.trySendAnalytic();
        }

        componentDidUpdate() {
            this.trySendAnalytic();
        }

        render() {
            // @ts-ignore
            return <BaseComponent {...this.props} />;
        }
    };
