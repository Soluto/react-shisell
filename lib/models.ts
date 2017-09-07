import { AnalyticsDispatcher } from 'shisell';
import * as PropTypes from 'prop-types';

export type Predicate<T = any> = (value: T) => boolean;
export type AnalyticsProps = { analytics: { dispatcher: AnalyticsDispatcher } };
export type MapPropsToExtras<T extends {} = {}> = (props: T) => object;
export const analyticsContextTypes = {
    analytics: PropTypes.object,
};
export type TransformAnalytics<T extends {}> = (
    dispatcher: AnalyticsDispatcher,
    props: T
) => AnalyticsDispatcher;
