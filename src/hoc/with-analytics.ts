import analyticsContextTypes, {AnalyticsContext} from '../analytics-context-types';
import getContext, {InferableComponentEnhancerWithProps} from 'recompose/getContext';

export const withAnalytics = getContext<AnalyticsContext>(analyticsContextTypes);
