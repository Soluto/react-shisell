import { InferableComponentEnhancerWithProps, getContext, mapProps } from 'recompose';
import { AnalyticsProps, analyticsContextTypes } from '../models';

export const withAnalytics = getContext<AnalyticsProps>(analyticsContextTypes);
export const withoutAnalytics = mapProps(({ analytics, ...otherProps }) => otherProps);
