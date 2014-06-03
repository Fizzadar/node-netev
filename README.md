# netev - Node.js events over streams

`netev` allows you to wrap streams as normal event emitters, for both sending & recieving data.


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
