# netev - Node.js events over streams

`netev` allows you to wrap streams as event emitters, for both sending & recieving data. It overwrites the `.emit` function and sends them over the network, and it captures network data and triggers original `.emit` calls. It's very "low level" and you'll need to ensure that both streams are wrapped (and authed) before sending any events.


## Install

    npm install netev


## Usage

    var netev = require('netev');
    
    // Wrap a stream, returns an EventEmitter
    var events = netev(stream);
    
    // Bind to events as normal
    events.on('incoming', function() {
        console.log(arguments);
    });
    
    // Send events as normal
    events.emit('outgoing', {some: 'data'}, 'some more');
