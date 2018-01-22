// Type definitions for Recompose 0.24
// Project: https://github.com/acdlite/recompose
// Definitions by: Iskander Sierra <https://github.com/iskandersierra>
//                 Samuel DeSota <https://github.com/mrapogee>
//                 Curtis Layne <https://github.com/clayne11>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

///<reference types="react" />

// Higher-order components: https://github.com/acdlite/recompose/blob/master/docs/API.md#higher-order-components

declare module 'recompose/getContext' {
    import * as React from 'react';
    import {ComponentType as Component, ComponentClass, ValidationMap} from 'react';
    
    // Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
    type Diff<T extends string, U extends string> = ({[P in T]: P} & {[P in U]: never} & {[x: string]: never})[T];
    type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
    
    export interface ComponentEnhancer<TInner, TOutter> {
        (component: Component<TInner>): ComponentClass<TOutter>;
    }
    
    // Injects props and removes them from the prop requirements.
    // Will not pass through the injected props if they are passed in during
    // render. Also adds new prop requirements from TNeedsProps.
    export interface InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> {
        <P extends TInjectedProps>(component: Component<P>): React.ComponentType<
            Omit<P, keyof TInjectedProps> & TNeedsProps
        >;
    }
    
    // Injects props and removes them from the prop requirements.
    // Will not pass through the injected props if they are passed in during
    // render.
    export type InferableComponentEnhancer<TInjectedProps> = InferableComponentEnhancerWithProps<TInjectedProps, {}>;

    // getContext: https://github.com/acdlite/recompose/blob/master/docs/API.md#getContext
    function getContext<TContext>(contextTypes: ValidationMap<TContext>): InferableComponentEnhancer<TContext>;

    const getContextInstance: getContext;

    export default getContextInstance;
}
