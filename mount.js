var runningInBrowser = !require('is-node');
var createMonkey = require('./create');
var VineHill = require('vinehill');
var window = require('global');
var document = window.document;

function addRefreshButton() {
  var refreshLink = document.createElement('a');
  refreshLink.href = window.location.href;
  refreshLink.innerText = 'refresh';
  document.body.appendChild(refreshLink);
  document.body.appendChild(document.createElement('hr'));
}

var div;
function createTestDiv() {
  if (div) {
    div.parentNode.removeChild(div);
  }
  div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

if (runningInBrowser) {
  if (/\/debug\.html$/.test(window.location.pathname)) {
    localStorage['debug'] = 'browser-monkey';
    addRefreshButton();
  }
} else {
  require('./stubBrowser');
}

function Mount(options) {
  this.vinehill = new VineHill();
  this.startApp = options.startApp.bind(this);
  this.stopApp = options.stopApp.bind(this);
}

Mount.prototype.setOrigin = function(host) {
  this.vinehill.setOrigin(host);
  return this;
}

Mount.prototype.withServer = function(host, app) {
  this.vinehill.add(host, app);
  return this;
}

Mount.prototype.withApp = function(getApp) {
  this.getApp = getApp;
  return this;
}

Mount.prototype.start = function() {
  this.vinehill.start();
  this.app = this.getApp();
  var monkey = this.startApp();
  monkey.set({
    app: this.app,
    mount: this,
  })
  return monkey;
}

Mount.prototype.stop = function(){
  this.stopApp();
  this.vinehill.stop();
}

module.exports = {
  angular: function() {
    return new Mount({
      stopApp: function(){},
      startApp: function(){
        var app = this.app;

        var div = createTestDiv();
        div.setAttribute(app.directiveName, '');
        angular.bootstrap(div, [app.moduleName]);

        return createMonkey(document.body);
      }
    });
  },

  hyperdom: function() {
    var hyperdom = require('hyperdom');
    var router = require('hyperdom-router');
    var vquery = require('vdom-query');
    router.start();

    return new Mount({
      stopApp: function(){
        router.clear();
      },
      startApp: function(){
        var app = this.app;

        if (runningInBrowser) {
          hyperdom.append(createTestDiv(), app);
          return createMonkey(document.body);
        } else {
          var vdom = hyperdom.html('body');

          var monkey = createMonkey(vdom);
          monkey.set({$: vquery, visibleOnly: false, document: {}});

          hyperdom.appendVDom(vdom, app, { requestRender: setTimeout, window: window });
          return monkey;
        }
      }
    });
  },

  react: function() {
    var React = require('react')
    var ReactDOM = require('react-dom')

    return new Mount({
      stopApp: function() {

      },
      startApp: function() {
        var div = createTestDiv()
        ReactDOM.render(React.createElement(this.app.constructor, null), div)

        return createMonkey(document.body);
      }
    })
  }
}