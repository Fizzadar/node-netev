#!/usr/bin/env node

// NetEv
// File: index.js
// Desc: network events for Node

'use strict';

var events = require('events'),
    util = require('util');


var NetEv = function(stream, debug) {
    events.EventEmitter.call(this);

    var log = function() {
        if(debug) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift('[NetEv]');
            console.log.apply(console, args);
        }
    }
    if(debug)
        log('Debug enabled');

    // Copy original emit to send when receive net-events
    var emit = this.emit,
        buffer = '',
        self = this;

    // Listen for data and emit events
    var callback = function(data) {
        buffer += data.toString();
        if(buffer.indexOf('}END') > 0) {
            var evs = buffer.split('}END');
            for(var i=0; i<evs.length; i++) {
                if(evs[i].length < 2) continue;

                var json = evs[i] + '}';
                var data = JSON.parse(json);
                log('incoming event: ' + data.name, data.data);

                // Prepare normal emit
                data.data.unshift(data.name);
                emit.apply(self, data.data);
            }
        }
    };
    stream.on('data', callback);

    // Overwrite emit and instead send => stream
    this.emit = function(event_name) {
        var data = [];
        for(var key in arguments) {
            if(parseInt(key) > 0) {
                var argument = arguments[key];
                data.push(arguments[key]);
            }
        }

        var event_data = {
            data: data,
            name: event_name
        }
        stream.write(JSON.stringify(event_data) + 'END');
        log('outgoing event: ' + event_name, data);
    };
};
util.inherits(NetEv, events.EventEmitter);


// The netev wrapper
var wrap = function(stream, debug) {
    return new NetEv(stream, debug);
};
module.exports = wrap;
