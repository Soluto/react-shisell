import * as React from 'react';
import {Component, FunctionComponent, ReactType} from 'react';
import {ShisellContext} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';
import {WithAnalyticsProps} from './with-analytics';

export interface WithAnalyticOnViewConfiguration<T> {
    analyticName: string;
    predicate?: (props: T) => boolean;
    mapPropsToExtras?: (props: T) => object;
}

const defaultPropsToExtrasMapper = () => ({});
const defaultPredicate = () => true;

type AnalyticOnViewProps = WithAnalyticsProps & {
    predicate: () => boolean;
    getExtraData: () => {};
    analyticName: string;
};

class AnalyticOnView extends Component<AnalyticOnViewProps> {
    didSendAnalytic = false;

    trySendAnalytic() {
        const {predicate, getExtraData, analyticName, analytics} = this.props;
        if (this.didSendAnalytic || !predicate()) return;

        analytics.dispatcher.withExtras(getExtraData()).dispatch(analyticName);
        this.didSendAnalytic = true;
    }

    componentDidMount() {
        this.trySendAnalytic();
    }

    componentDidUpdate() {
        this.trySendAnalytic();
    }

    render() {
        return this.props.children;
    }
}

export const withAnalyticOnView = <TProps extends object>({
    analyticName,
    predicate = defaultPredicate,
    mapPropsToExtras = defaultPropsToExtrasMapper,
}: WithAnalyticOnViewConfiguration<TProps>) => (BaseComponent: ReactType<TProps>) => {
    const EnhancedComponent: FunctionComponent<TProps> = props => (
        <ShisellContext.Consumer>
            {analytics => (
                <AnalyticOnView
                    analytics={analytics}
                    predicate={() => predicate(props)}
                    getExtraData={() => mapPropsToExtras(props)}
                    analyticName={analyticName}
                >
                    {
                        // @ts-ignore
                        <BaseComponent {...props} />
                    }
                </AnalyticOnView>
            )}
        </ShisellContext.Consumer>
    );

    EnhancedComponent.displayName = wrapDisplayName(BaseComponent, 'withAnalyticOnView');
    return EnhancedComponent;
};
