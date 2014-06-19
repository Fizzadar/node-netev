# netev - Node.js events over streams

netev allows you to wrap streams as event emitters, for both sending & recieving data. It overwrites the `.emit` function and sends them over the network, and it captures network data and triggers original `.emit` calls. It's very "low level" and you'll need to ensure that both streams are wrapped (and authed) before sending any events. Because the emitted data is serialized as JSON, only ints/strings/bools/arrays/objects will be transferred.


## Install

    npm install netev


## Usage

```js
    var netev = require('netev', <debug=false>);
    
    // Wrap a stream, returns an EventEmitter
    var events = netev(stream);
    
    // Bind to events as normal
    events.on('incoming', function() {
        console.log(arguments);
    });
    
    // Send events as normal
    events.emit('outgoing', {some: 'data'}, 'some more');
```

## Full example with auth

Here we are turning `stream` into an `event_stream`, connecting `master.js` with `client.js`, the flow is:

+ Client connects to master
+ Client immediately sends a shared key to the master
+ Master verifies, writes back a hello statement and wraps the stream with `netev`, and subscribes to its `activate` event
+ Client sees hello statement, wraps the stream with `netev` and sends down an `activate` event

##### shared function (imported as utils.js/similar)

```js
    receiveUntil = function(stream, want, callback, options) {
        var buffer = '';

        if(options.timeout) {
            var timeout = setTimeout(function() {
                stream.end();
            }, options.timeout * 1000);
        }

        var onData = function(data) {
            buffer += data.toString();
            if(buffer.length >= want.length) {
                if(buffer == want) {
                    if(options.timeout)
                        clearTimeout(timeout);

                    stream.removeListener('data', onData);
                    callback(stream);
                } else {
                    // Rejected!
                    stream.end();
                }
            }
        }
        stream.on('data', onData);
    };
```

##### master.js

```js
    // Wait for a known shared key
    utils.receiveUntil(stream, this.share_key, function(stream) {
            var cleint_events = netev(stream, self.debug_netev);

            // Notify via stream, expect event back
            stream.write('HELLO CLIENT');
            cleint_events.on('activate', function() {
                // do something with cleint_events here
            });
        }, {timeout: 10});
    };
```

##### client.js

```js
    // Connect to master
    var connection = net.connect(...);
    var stream = connection.on('connect', function() {
        // Send the shared key immediately
        stream.write(self.share_key);

        // Sent upon correct share_key, master's already netev wrapped
        utils.receiveUntil(stream, 'HELLO CLIENT', function(stream) {
            // Wrap  the stream for incoming events
            var master_events = netev(stream, self.debug_netev);

            // Immediately activate event
            master_events.emit('activate');
        }, {timeout: 10});
    });
```