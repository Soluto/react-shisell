import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';
import {getContext, InferableComponentEnhancerWithProps} from 'recompose';

export const withAnalytics = getContext<AnalyticsContext>(analyticsContextTypes);
