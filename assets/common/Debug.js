const CONSOLE_METHOD = ['error', 'info', 'warn', 'assert'];

var Debug = cc.Class({

    ctor: function () {
        console.info("ctor Debug");

    },

    init: function (channel) {
        this.tag = new Date().getTime() % 1000;

        var consolere = {
            channel: channel,
            api: '//console.re/connector.js',
            ready: function (c) {
                var d = document,
                    s = d.createElement('script'),
                    l;
                s.src = this.api;
                s.id = 'consolerescript';
                s.setAttribute('data-channel', this.channel);
                //enable_redirect_default_console_methods_to_remote
                //disable_default_console_output
                s.setAttribute('data-options', ["disable_default_console_output"]);
                s.onreadystatechange = s.onload = function () {
                    if (!l) {
                        c();
                    }
                    l = true;
                };
                d.getElementsByTagName('head')[0].appendChild(s);
            }
        };

        var self = this;
        consolere.ready(function () {
            self.overrideConsole();
            console.log("console.re ready on:" + channel);
        });
        // self.overrideConsole()

    },

    overrideConsole: function () {
        var self = this;
        var origConsole = this._origConsole = {},
            winConsole = window.console;
        CONSOLE_METHOD.forEach(name => {
            var origin = origConsole[name] = function () {};
            if (winConsole[name]) {
                origin = origConsole[name] = winConsole[name].bind(winConsole);
            }
            winConsole[name] = function (...args) {
                //     // logger[name](...args);
                if (console.re != null && console.re[name] != null) {
                    if (self.tag != null) {
                        console.re[name]("[TAG:" + self.tag + "]" + self.formatDateTime(), ...args);
                    } else {
                        console.re[name](self.formatDateTime(), ...args);
                    }

                }
                origin(...args);
            };
        });

        return this;
    },

    restoreConsole: function () {
        if (!this._origConsole) return this;

        CONSOLE_METHOD.forEach(name => window.console[name] = this._origConsole[name]);
        delete this._origConsole;

        return this;
    },

    formatDateTime: function () {    
        var date =  new Date();    
        var y =  date.getFullYear();    
        var m =  date.getMonth() +  1;    
        m =  m <  10 ?  ('0' +  m) :  m;    
        var d =  date.getDate();    
        d =  d <  10 ?  ('0' +  d) :  d;    
        var h =  date.getHours();    
        h =  h <  10 ?  ('0' +  h) :  h;    
        var minute =  date.getMinutes();    
        var second = date.getSeconds();   
        minute =  minute <  10 ?  ('0' +  minute) :  minute;    
        second = second < 10 ? ('0' + second) : second;    
        //y +  '-' +  m +  '-' +  d + ' ' + h + ':' + 
        return h + ':' + minute + ':' + second + "." + date.getMilliseconds();
    },

});

module.exports = Debug;