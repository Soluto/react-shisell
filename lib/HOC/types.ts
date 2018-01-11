import { AnalyticsDispatcher } from 'shisell';

export type TransformAnalyticsFunc = (dispatcher: AnalyticsDispatcher, otherProps: any) => AnalyticsDispatcher;
export type TransformPropsFunc = (props: {}) => {};
export type predicate = (obj: any) => boolean;
export type propsWithAnalytics = { analytics: { dispatcher: AnalyticsDispatcher } }