import { AnalyticsDispatcher } from 'shisell';
import { propsWithAnalytics } from './HOC/types'
import * as Types from './HOC/types';
import * as PropTypes from 'prop-types';

import { ComponentEnhancer, InferableComponentEnhancerWithProps } from 'recompose'

export * from './HOC/analytics-context-types';
export * from './HOC/with-analytics';
export * from './HOC/without-analytics';
export {enrichAnalytics} from './HOC/enrich-analytics';
export * from './HOC/with-analytic-on-event';
export * from './HOC/with-analytic-on-mount';
export * from './HOC/with-on-prop-changed-analytic';

import Analytics from './analytics';

export const analytics = Analytics ;

