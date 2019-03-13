import * as React from 'react';

export function verifyHooksExist(alternative: string) {
    if (typeof React.useContext === 'undefined') {
        throw new Error(`Hooks are not supported in this react version. use '${alternative}' instead.`);
    }
}
