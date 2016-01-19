# activity.js

Know when your users are using your site.

## Features

* Detects inactive keyboard.
* Detects inactive mouse movement.
* Detects no window visibility.
* Detects lost window focus.

## Why use it?

* Easily enable/disable features that only need to be active when a user is using your site.

## Installation

Download [the script](https://raw.githubusercontent.com/typerandom/activity.js/master/dist/activity.min.js) and include it on your site:

```html
<script src="activity.min.js"></script>
```

Or install it with bower:

```
$ bower install activity --save
```

## Usage

At the end of your code, right before `</body>`, call the following:

```javascript
Activity.detect();
```

Once this is done, you'll be able to detect user activity by listening to either the `user_active` or `user_inactive` events, as shown below:

```javascript
Activity.on('active', function () {
  console.log("The user is active!");
});

Activity.on('inactive', function () {
  console.log("The user is inactive!");
});
```

## Build

If you want to build `/src` files to `/dist`, then simply run:

```term
$ npm install
$ npm run build
```

## License

MIT, see [LICENSE](LICENSE).
