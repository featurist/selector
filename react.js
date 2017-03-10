var Mount = require('./mount');
var React = require('react')
var ReactDOM = require('react-dom')
var createMonkey = require('./create');

module.exports = function(app) {
  return new Mount(app, {
    stopApp: function() {
    },
    startApp: function() {
      var div = Mount.createTestDiv()
      ReactDOM.render(React.createElement(this.app.constructor, null), div)

      return createMonkey(document.body);
    }
  }).start()
}
