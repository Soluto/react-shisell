import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';

export interface AnalyticsContext {
    analytics: {
        dispatcher: shisell.AnalyticsDispatcher;
    };
}

export default {analytics: PropTypes.object};
