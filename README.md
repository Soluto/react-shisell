# React Shisell

## Overview

React Shisell builds on [shisell](https://github.com/Soluto/shisell-js) and lets you easily integrate analytics into [react](https://github.com/facebook/react) apps.

Its most basic design principle is that at the root of the react tree is the writer which does the actual writing to your favorite analytics service, and any component in the react tree enhances the shisell analytics dispatcher and adds another Scope/ExtraData/Identity/etc.

## API

-   Higher order components
    -   [`withAnalytics`](#withanalytics)
    -   [`enrichAnalytics`](#enrichanalytics)
    -   [`withAnalyticOnView`](#withanalyticonview)
    -   [`withAnalyticOnEvent`](#withanalyticonevent)
    -   [`withOnPropChangedAnalytic`](#withonpropchangedanalytic)
-   Hooks
    -   [`useAnalytics`](#useanalytics)
    -   [`useAnalyticCallback`](#useanalyticcallback)
-   Others
    -   [`AnalyticsProvider`](#analyticsprovider)
    -   [`analytics`](#analytics)

### `withAnalytics`

Adds a prop called `analytics` that contains a `dispatcher` of type `shisell.AnalyticsDispatcher`, which lets any component freely dispatch analytics using the dispatcher currently in context.

Usage example:

```js
class LoginPage extends React.Component {
    componentDidMount() {
        this.props.analytics.dispatcher
          .extend(withExtra('key', 'value'))
          .dispatch('Rendered');
    }

    ...
}

const EnhancedLoginPage = withAnalytics(LoginPage);
ReactDOM.render(<EnhancedLoginPage />);
```

### `enrichAnalytics`

```js
enrichAnalytics(
  (analytics: shisell.AnalyticsDispatcher, props: object) => shisell.AnalyticsDispatcher
): HigherOrderComponent;
```

With `enrichAnalytics` you can extend the existing analytics dispatcher and add whatever you want to it using `shisell`'s standard capabilities.
This is usually used for adding a sub-scope, or some data you want all subcomponents to include in their analytics.

Usage example:

```js
class LoginPage extends React.Component {
    componentDidMount() {
        this.props.analytics.dispatcher
          .extend(withExtraData('key', 'value'))
          .dispatch('Rendered');
    }

    ...
}

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = compose(
  enrichAnalytics(
    dispatcher => dispatcher.extend(createScoped('LoginPage'))
  ),
  withAnalytics,
)(MyComponent);
ReactDOM.render(<EnhancedLoginPage />);
```

### `withAnalyticOnView`

```js
withAnalyticOnView({
    analyticName: string,
    extendAnalytics?: (props: object) => shisell.AnalyticsExtender,
    shouldDispatchAnalytics?: (props: object) => boolean,
}): HigherOrderComponent;
```

`withAnalyticOnView` is used for the very common case of wanting to dispatch an analytic whenever a component mounts.
For example, dispatching an analytic whenever someone enters a specific page, views a modal, etc.
It's also possible to supply a `shouldDispatchAnalytics` to only dispatch the analytic after a certain prop has a value (for example, data loaded from an async fetch).

Usage example:

```js
const LoginPage = (props) => ...;

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = withAnalyticOnView({
  analyticName: 'LoginPage_Entered',
  extendAnalytics: (props) => withExtras({
    LoginAttempt: props.loginAttempt
  })
})(LoginPage);
ReactDOM.render(<EnhancedLoginPage />);
```

### `withAnalyticOnEvent`

```js
withAnalyticOnEvent({
    eventName: string,
    analyticName: string,
    extendAnalytics?: (props, ...eventArgs) => shisell.AnalyticsExtender,
}): HigherOrderComponent;
```

`withAnalyticOnEvent` is used when we need an event handler that dispatches analytics.
For example, a button that triggers some action and dispatches an analytic.
The `eventName` is also the name of the prop the event handler will be injected into (if it already exists, it will be wrapped).
There are two ways to add data to the sent analytic:

1. Statically - with `extendAnalytics`, which will let you add extras/identities from the event itself.
2. Dynamically with props - the resulting component will accept an `extendAnalytics` prop which behaves the same as the static counterpart.

In addition, the component will receive a `shouldDispatchAnalytics` prop which can be a `boolean` or a `(...params) => boolean` predicate.

Usage example:

```js
const LoginPage = (props) => <button onClick={onButtonClick}>Login here</button>;

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = withAnalyticOnEvent({
    eventName: 'onButtonClick',
    analyticName: 'LoginButton_Clicked',
    extendAnalytics: () => withIdentities({User: localStorage.userName}),
})(LoginPage);
ReactDOM.render(
    <EnhancedLoginPage
        extendAnalytics={() => withExtras({Source: 'Button'})}
        onButtonClick={(e) => console.log(e)}
        shouldDispatchAnalytics={someBooleanRule && true}
    />,
);
```

### `withOnPropChangedAnalytic`

```js
withOnPropChangedAnalytic({
    propName: string,
    analyticName: string,
    valueFilter?: (prevPropValue, nextPropValue) => boolean,
    includeFirstValue?: boolean,
    extendAnalytics?: (props: object) => shisell.AnalyticsExtender,
}): HigherOrderComponent;
```

`withOnPropChangedAnalytic` triggers an analytic dispatch whenever a specified property changes.
It's meant for cases where there's a property that signals a change in state, and that state change should be recorded as an analytic.
For example, 'LoggingIn' becoming 'LoginFailure'.
In these cases you usually only want to send the analytic once when the property changes, and not on every subsequent re-render.

`includeFirstValue` is set to false by default. If set to true, the valueFilter function will be tested on (undefined, firstPropValue) and will dispatch if true.  
_Notice: providing `includeFirstValue: true` and not providing a valueFilter function will always result in dispatching on mount, regardless of what the specified prop value is._

Usage example:

```js
const LoginPage = (props) => ...;

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = withOnPropChangedAnalytic({
  propName: 'loginState',
  analyticName: 'Login_Failure',
  valueFilter: (previousValue, nextValue) => previousValue === 'LoggingIn' && nextValue === 'LoginFailure'
})(LoginPage);
ReactDOM.render(<EnhancedLoginPage onButtonClick={(e) => console.log(e)} />);
```

### `useAnalytics`

React hook that returns an object which contains a `dispatcher` of type `shisell.AnalyticsDispatcher`, which lets any component freely dispatch analytics using the dispatcher currently in context.
Same as `withAnalytics` but with hooks.

Usage example:

```js
const MyComponent = (props) => {
    const analytics = useAnalytics();
    useEffect(() => analytics.dispatcher.extend(createScoped('MyComponent')).dispatch('Loaded'), []);

    return <div>Hello Shisell</div>;
};
```

### `useAnalyticCallback`

React hook to create analytic dispatcher functions. Simpler than using the analytics context from `useAnalytics()`.

Usage example:

```ts
// create function to dispatch event
const sendEvent = useAnalyticCallback('eventName');
sendEvent();

// wrap function to dispatch event, call wrapped function
const onClickWithAnalytic = useAnalyticCallback('eventName', onClick);
onClickWithAnalytic();

// wrapped function with args / return value
const fetchWithAnalytic = useAnalyticCallback('eventName', fetch);
const value = await fetchWithAnalytic('arg');
```

### `AnalyticsProvider`

React analytics context provider to override or transform the analytics dispatcher.

Usage example:

```tsx
const ExampleComponent = ({user, children}: ExampleComponentProps) => (
    <AnalyticsProvider dispatcher={(dispatcher) => dispatcher.extend(withExtra('UserId', user.id))}>
        {children}
    </AnalyticsProvider>
);
```

### `analytics`

```js
analytics: {
  dispatcher: shisell.AnalyticsDispatcher,
  transformDispatcher: (dispatcher: shisell.AnalyticsDispatcher) => shisell.AnalyticsDispatcher,
  setWriter(writer: shisell.EventModelWriter<void>) => void,
}
```

The `analytics` object is essentially the connection between `shisell` and `react-shisell`.
It holds the event writer and the current root dispatcher.
It's used to dynamically set the event writer, and to transform the dispatcher for all analytics sent.
For example, after successfuly logging in, you'd want all analytics sent to include a `UserId` identity.

Usage example:

```js
login().then((user) => analytics.transformDispatcher((dispatcher) => dispatcher.extend(withExtra('UserId', user.id))));
```
