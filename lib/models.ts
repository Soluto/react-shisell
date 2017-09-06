import { AnalyticsDispatcher } from 'shisell';
export type Predicate = (obj: any) => boolean;
export type AnalyticsProps = { analytics: { dispatcher: AnalyticsDispatcher } };
