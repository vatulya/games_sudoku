MixinEvent = {

    listeners: {},

    addListener: function (eventName, listener) {
        if (!this.listeners.hasOwnProperty(eventName)) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
    },

    getListeners: function (eventName) {
        if (eventName) {
            if (!this.listeners.hasOwnProperty(eventName)) {
                throw new Error('Unknown event name "' + eventName + '"');
            }
            return this.listeners[eventName];
        } else {
            return this.listeners;
        }
    },

    trigger: function (eventName, data) {
        if (!this.listeners.hasOwnProperty(eventName)) {
            return this.listeners[eventName];
        }
        this.listeners[eventName].each(function (i, listener) {
            listener.apply(this, data);
        });
    }

};