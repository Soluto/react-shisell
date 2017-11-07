import * as React from 'react';

import { propsWithAnalytics } from './types'

export const withTimeOnPageAnalytic = (analyticName: string) => {
    return (Comp: new () => React.Component<any, any>) => 
        class ComponentWithTimeOnPageAnalytics extends React.Component<propsWithAnalytics> {    
            mountTimestamp: number;

            componentDidMount() {
                this.mountTimestamp = Date.now();
            }
            componentWillUnmount() {
                const timeOnPageMs = Date.now() - this.mountTimestamp;
                const timeOnPageSec = timeOnPageMs / 1000;
                this.props.analytics.dispatcher.withExtra(analyticName, timeOnPageSec).dispatch(analyticName);
            }

            render() {
                return <Comp {...this.props } />;
            }
        }
};