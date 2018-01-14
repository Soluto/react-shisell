import { mapProps, InferableComponentEnhancerWithProps } from 'recompose';

export const withoutAnalytics = mapProps(({ analytics, ...otherProps }) => otherProps);
