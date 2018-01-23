import * as React from 'react';
import {wrapDisplayName as realWrapDisplayName} from 'recompose';

// Recompose's types are broken. wrapDisplayName accepts strings but the type doesn't reflect that.
// Need to send a PR to DefinitelyTyped, this will do meanwhile
export function wrapDisplayName<T>(component: React.ReactType<T>, wrapperName: string) {
    return realWrapDisplayName((component as any) as React.ComponentType<T>, wrapperName);
}
