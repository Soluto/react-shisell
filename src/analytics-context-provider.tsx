import {Component, ReactNode} from 'react';
import {Requireable} from 'prop-types';
import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import {default as analyticsContextType} from './analytics-context-types';
import analytics from './analytics';

export interface AnalyticsContextProviderProps {
    analytics?: any;
}

export default class AnalyticsContextProvider extends Component<AnalyticsContextProviderProps> {
    static displayName = 'AnalyticsContextProvider';
    static childContextTypes = analyticsContextType;
    static defaultProps = {analytics};

    getChildContext = () => ({analytics: this.props.analytics});

    render() {
        return this.props.children;
    }
}
