import {ReactType} from 'react';

const getDisplayName = (Component: ReactType) => {
    if (typeof Component === 'string') {
        return Component;
    }

    if (!Component) {
        return undefined;
    }

    return Component.displayName || Component.name || 'Component';
};

export function wrapDisplayName<T>(BaseComponent: ReactType<T>, hocName: string) {
    return `${hocName}(${getDisplayName(BaseComponent)})`;
}
