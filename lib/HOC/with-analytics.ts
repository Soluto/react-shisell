import analyticsContextTypes from './analytics-context-types';
import { getContext, InferableComponentEnhancerWithProps } from 'recompose';

export const withAnalytics = getContext(analyticsContextTypes);
