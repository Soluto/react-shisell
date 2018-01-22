import {AnalyticsContext} from '../analytics-context-types';
import {mapProps, InferableComponentEnhancerWithProps} from 'recompose';

export const withoutAnalytics = mapProps<object, AnalyticsContext>(({analytics, ...otherProps}) => otherProps);
