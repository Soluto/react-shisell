import * as React from 'react';
import {Component, FunctionComponent, ReactType} from 'react';
import {ShisellContext} from '../shisell-context';
import {wrapDisplayName} from '../wrapDisplayName';
import {WithAnalyticsProps} from './with-analytics';
import {withExtras, withIdentities} from 'shisell/extenders';

export interface WithAnalyticOnViewConfiguration<T> {
    analyticName: string;
    predicate?: (props: T) => boolean;
    mapPropsToExtras?: (props: T) => object;
    mapPropsToIdentities?: (props: T) => object;
}

const defaultPropsToExtrasMapper = () => ({});
const defaultPropsToIdentitiesMapper = () => ({});
const defaultPredicate = () => true;

type AnalyticOnViewProps = WithAnalyticsProps & {
    predicate: () => boolean;
    getExtraData: () => {};
    analyticName: string;
    getIdentities: () => {};
};

class AnalyticOnView extends Component<AnalyticOnViewProps> {
    didSendAnalytic = false;

    trySendAnalytic() {
        const {predicate, getExtraData, analyticName, analytics, getIdentities} = this.props;
        if (this.didSendAnalytic || !predicate()) return;

        analytics.dispatcher.extend(withExtras(getExtraData()), withIdentities(getIdentities())).dispatch(analyticName);
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
    mapPropsToIdentities = defaultPropsToIdentitiesMapper,
}: WithAnalyticOnViewConfiguration<TProps>) => (BaseComponent: ReactType<TProps>) => {
    const EnhancedComponent: FunctionComponent<TProps> = props => (
        <ShisellContext.Consumer>
            {analytics => (
                <AnalyticOnView
                    analytics={analytics}
                    predicate={() => predicate(props)}
                    getExtraData={() => mapPropsToExtras(props)}
                    analyticName={analyticName}
                    getIdentities={() => mapPropsToIdentities(props)}
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
