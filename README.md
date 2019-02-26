# React Shisell

## Overview

React Shisell builds on [shisell](https://github.com/Soluto/shisell-js) and lets you easily integrate analytics into [react](https://github.com/facebook/react) apps.

Its most basic design principle is that at the root of the react tree is the writer which does the actual writing to your favorite analytics service, and any component in the react tree enhance the shisell analytics dispatcher and add another Scope/ExtraData/Identity/etc.

## API

-   Higher order components
    -   [`withAnalytics`](#withanalytics)
    -   [`enrichAnalytics`](#enrichanalytics)
    -   [`withAnalyticOnView`](#withanalyticonview)
    -   [`withAnalyticOnEvent`](#withanalyticonevent)
    -   [`withOnPropChangedAnalytic`](#withonpropchangedanalytic)
-   Others

    -   [`analytics`](#analytics)
    -   [`ShisellContext`](#shisellcontext)

### `withAnalytics`

Adds a prop called `analytics` which contains a `dispatcher` of type `shisell.AnalyticsDispatcher` which lets any component freely dispatch analytics using the dispatcher currently in context.

Example usage:

```js
class LoginPage extends React.Component {
    componentDidMount() {
        this.props.analytics.dispatcher
          .withExtra('key', 'value')
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
  (analytics: shisell.AnalyticsDispatcher) => shisell.AnalyticsDispatcher
): HigherOrderComponent;
```

With `enrichAnalytics` you can extend the existing analytics dispatcher and add whatever you want to it using `shisell`'s standard capabilities.
Usually used for adding a subscope or some data you want all subcomponents to include in their analytics.

Example usage:

```js
class LoginPage extends React.Component {
    componentDidMount() {
        this.props.analytics.dispatcher
          .withExtraData('key', 'value')
          .dispatch('Rendered');
    }

    ...
}

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = compose(
  enrichAnalytics(
    dispatcher => dispatcher.createScoped('LoginPage')
  ),
  withAnalytics,
)(MyComponent);
ReactDOM.render(<EnhancedLoginPage />);
```

### `withAnalyticOnView`

```js
withAnalyticOnView({
    analyticName: string,
    predicate?: (props: object) => boolean
    mapPropsToExtras?: (props: object) => object,
}): HigherOrderComponent;
```

`withAnalyticOnView` is used for the very common case of wanting to dispatch an analytic whenever a component mounts.
For example, dispatching an analytic whenever someone enters a specific page, or views a modal, etc.
It's also possible to supply a `predicate` to only dispatch the analytic after a certain prop has a value (for example, data loaded from an async fetch).

Example usage:

```js
const LoginPage = (props) => ...;

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = withAnalyticOnView({
  analyticName: 'LoginPage_Entered',
  mapPropsToExtras: (props) => ({
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
    extras?: object | (event) => object,
    identities?: object | (event) => object,
}): HigherOrderComponent;
```

`withAnalyticOnEvent` is used when we need an event handler that dispatches analytics.
For example, a button that triggers some action, and dispatches an analytic.
The `eventName` is also the name of the prop the event handler will be injected into (if it already exists, it will be wrapped).
There are two ways to add data to the sent analytic:

1. Statically - with `extras` and `identities` which will let you add extras/identities from the event itself, or just as a static object.
2. Dynamically with props - the resulting component will accept an `analyticsExtras` and `analyticsIdentities` props which behave the same as their static counterparts.
   In addition, the component will receive a `shouldDispatchAnalytics` prop which can be a boolean or an (event) => boolean predicate.

Example usage:

```js
const LoginPage = props => <button onClick={onButtonClick}>Login here</button>;

// The sent analytic will be LoginPage_Rendered as opposed to Rendered, because the scope was enhanced.
const EnhancedLoginPage = withAnalyticOnEvent({
    eventName: 'onButtonClick',
    analyticName: 'LoginButton_Clicked',
    identities: {
        User: localStorage.userName,
    },
})(LoginPage);
ReactDOM.render(
    <EnhancedLoginPage
        analyticsExtras={{Source: 'Button'}}
        onButtonClick={e => console.log(e)}
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
    mapPropsToExtras?: (props) => object,
    includeFirstValue?: boolean
}): HigherOrderComponent;
```

`withOnPropChangedAnalytic` triggers an analytic dispatch whenever a specified property changes.
It's meant for cases where there's a property which signals a change in state, and that state change should be recorded as an analytic.
For example, 'LoggingIn' becoming 'LoginFailure'.
In these cases you usually only want to send the analytic once when the property changes, and not on every subsequent re-render.

`includeFirstValue` is set to false by default. If set to true, the valueFilter function will be tested on (undefined, firstPropValue) and will dispatch if true.  
_Notice: providing `includeFirstValue: true` and not providing a valueFilter function will always result in dispatching on mount, regardless what's the specified prop value is._

Example usage:

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

### `analytics`

```js
analytics: {
  dispatcher: shisell.AnalyticsDispatcher,
  transformDispatcher: (dispatcher: shisell.AnalyticsDispatcher) => shisell.AnalyticsDispatcher,
  setWriter(writer: shisell.EventModelWriter<void>) => void,
}
```

The `analytics` object is the connection between `shisell` and `react-shisell`, essentially.
It holds the event writer and the current root dispatcher.
It's used to dynamically set the event writer, and to transform the dispatcher for all analytics sent.
For example, after successfuly logging in, you'd want all analytics sent to include a `UserId` identity.

Example usage:

```js
login().then(user => analytics.transformDispatcher(dispatcher => dispatcher.withExtra('UserId', user.id)));
```

### `ShisellContext`

All the Higher ordered components are base on react's Context. this package exposes the `ShisellContext` object that can be used to create other HOC's, and in react hooks.

Example usage:

```js
const MyComponent = props => {
    const analytics = useContext(ShisellContext);
    useEffect(() => analytics.dispatcher.createScoped('MyComponent').dispatch('Loaded'), []);

    return <div>Hello Shisell</div>;
};
```
