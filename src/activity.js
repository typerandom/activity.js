// Activity.js
// Know when your users are using your site.
// Author: Robin Orheden
// License: MIT

(function () {
  function Activity(options) {
    var State = Activity.State;

    var listeners = {};
    var started = false;

    var currentState = State.Unknown;

    var inactiveSince = 0;
    var inactiveSinceTimeoutId = null;
    var flagInactiveTimeoutId = null;

    // Setup options
    if (!options) {
      options = {};
    }

    var defaultOptions = {
      inactiveAfter: 60,
      inactiveOnLostFocus: true,
      inactiveOnNoVisibility: true,
      inactiveOnMouseInactivity: true,
      inactiveOnKeyboardInactivity: true
    };

    // Iterate default options and fill in the gaps
    // where there are options missing.
    for (var key in defaultOptions) {
      var value = defaultOptions[key];
      if (!(key in options)) {
        options[key] = value;
      }
    }

    function emit(name, args) {
      if (!args) {
        args = [];
      }
      if (name in listeners) {
        for (var i = 0; i < listeners[name].length; i++) {
          listeners[name][i].apply(null, args);
        }
      }
    }

    function transitionState(newState, force) {
      if (currentState !== newState || force === true) {
        currentState = newState;
        switch (currentState) {
          case State.Inactive:
            emit('inactive');
            break;
          case State.Active:
            emit('active');
            break;
        }
      }
    }

    function inactiveSinceTick() {
      var newState = null;

      if (++inactiveSince >= options.inactiveAfter) {
        newState = State.Inactive;
      } else {
        newState = State.Active;
      }

      transitionState(newState);
    }

    function flagUserAsActive() {
      inactiveSince = 0;
      clearTimeout(flagInactiveTimeoutId);
      transitionState(State.Active);
    }

    function flagUserAsInactive() {
      clearTimeout(flagInactiveTimeoutId);
      flagInactiveTimeoutId = setTimeout(function () {
        transitionState(State.Inactive);
      }, 50);
    }

    function onVisibilityChanged() {
      if (document.hidden) {
        flagUserAsActive();
      } else {
        transitionState(State.Inactive);
      }
    }

    function addElementListener(element, name, listener) {
      if (element.addEventListener) {
        element.addEventListener(name, listener);
      } else if (element.attachEvent) {
        element.attachEvent(name, listener);
      }
    }

    function removeElementListener(element, name, listener) {
      if (element.removeEventListener) {
        element.removeEventListener(name, listener);
      } else if (element.detachEvent) {
        element.detachEvent(name, listener);
      }
    }

    return {
      // Start monitoring user activity.
      start: function start() {
        if (started) {
          return false;
        }

        started = true;
        inactiveSinceTimeoutId = setInterval(inactiveSinceTick, 1 * 1000);
        
        if (options.inactiveOnMouseInactivity) {
          addElementListener(window, 'mousemove', flagUserAsActive);
        }

        if (options.inactiveOnKeyboardInactivity) {
          addElementListener(window, 'keypress', flagUserAsActive);
        }

        if (options.inactiveOnLostFocus) {
          addElementListener(window, 'blur', flagUserAsInactive);
          addElementListener(window, 'focus', flagUserAsActive);
        }
        
        if (options.inactiveOnNoVisibility) {
          addElementListener(document, 'visibilitychange', onVisibilityChanged);
        }

        emit('started');

        return true;
      },

      // Get the current user state (see State for exactly what is available).
      state: function state() {
        return currentState;
      },

      // Listen to a event. Events currently supported:
      // started: The service has started.
      // stopped: The service has stopped.
      // inactive: When a user is inactive.
      // active: When a user is active.
      on: function on(name, listener) {
        if (!(name in listeners)) {
          listeners[name] = [];
        }
        listeners[name].push(listener);
      },

      // Replays the current user state to all event listeners.
      replayState: function replayState() {
        transitionState(currentState, true);
      },

      // Stop monitoring user activity.
      stop: function stop() {
        if (!started) {
          return false;
        }

        started = false;
        currentState = State.Unknown;
        clearTimeout(inactiveSinceTimeoutId);

        if (options.inactiveOnMouseInactivity) {
          removeElementListener(window, 'mousemove', flagUserAsActive);
        }

        if (options.inactiveOnKeyboardInactivity) {
          removeElementListener(window, 'keypress', flagUserAsActive);
        }

        if (options.inactiveOnLostFocus) {
          removeElementListener(window, 'blur', flagUserAsInactive);
          removeElementListener(window, 'focus', flagUserAsActive);
        };

        if (options.inactiveOnNoVisibility) {
          removeElementListener(document, 'visibilitychange', onVisibilityChanged);
        }

        emit('stopped');

        return true;
      }
    };
  };

  // Expose state enum.
  Activity.State = {
    Unknown: 0,
    Inactive: 1,
    Active: 2
  };

  Object.freeze(Activity.State);

  var instance = null;
  function resolveInstance(options) {
    return !instance ? instance = new Activity(options) : instance;
  }

  Activity.configure = function configure(options) {
    return resolveInstance(options);
  };

  Activity.detect = function detect() {
    var instance = resolveInstance();

    if (instance.initialized) {
      return true;
    }

    instance.initialized = true;

    instance.on('inactive', function () {
      window.dispatchEvent(new CustomEvent('user_inactive'));
    });

    instance.on('active', function () {
      window.dispatchEvent(new CustomEvent('user_active'));
    });

    instance.start();

    return true;
  };

  Activity.on = function on(name, listener) {
    return resolveInstance().on(name, listener);
  };

  Activity.state = function state() {
    return resolveInstance().state();
  };

  // Replays the current user state to all event listeners.
  Activity.replayState = function replayState() {
    var instance = Activity._instance;

    if (!instance) {
      throw new Error('Activity.detect() hasn\'t been called.');
    }

    return instance.replayState();
  };

  window.Activity = Activity;
})();