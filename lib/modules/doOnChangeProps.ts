import { InferableComponentEnhancerWithProps, lifecycle } from 'recompose';
import { Predicate } from '../models';

const doOnChangeProps = <TProps extends {}, TPropName extends keyof TProps>(
    changedPropName: TPropName,
    valueBeforeChangeFilter: Predicate<TProps[TPropName]>,
    valueAfterChangeFilter: Predicate<TProps[TPropName]>,
    doFunc: (prop: TProps) => void
) =>
    lifecycle<TProps, {}>({
        componentWillReceiveProps(nextProps) {
            const prevProps = this.props;

            if (
                valueBeforeChangeFilter(prevProps[changedPropName]) &&
                valueAfterChangeFilter(nextProps[changedPropName])
            ) {
                doFunc(nextProps);
            }
        },
    });
export default doOnChangeProps;
