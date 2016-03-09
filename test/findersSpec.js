var domTest = require('./domTest');

describe.only('find', function () {
  domTest('should eventually find an element', function (browser, dom) {
    var promise = browser.find('.element').shouldExist();

    dom.eventuallyInsert('<div class="element"></div>');

    return promise;
  });

  domTest('should eventually find an element using a filter', function (browser, dom) {
    var promise = browser.find('.element').filter(function (element) {
      return element.hasClass('correct');
    }, 'has class "correct"').element();

    dom.insert('<div class="element"></div>');
    dom.eventuallyInsert('<div class="element correct"></div>');

    return promise.then(function (element) {
      expect(element.attr('class')).to.equal('element correct');
    });
  });

  domTest('should eventually find an element with the right text', function (browser, dom) {
    var promise = browser.find('.element', {text: 'green'}).element();

    dom.insert('<div class="element"></div>');
    dom.eventuallyInsert('<div class="element">red</div><div class="element">blue</div><div class="element">green</div>');

    return promise.then(function (element) {
      expect(element.text()).to.equal('green');
    });
  });

  domTest('filter fails with the right message', function (browser, dom) {
    var promise = browser.find('.element').filter(function (element) {
      return element.hasClass('correct');
    }, 'has class "correct"').element();

    dom.insert('<div class="element"></div>');
    dom.eventuallyInsert('<div class="element"></div>');

    return expect(promise).to.be.rejectedWith('has class "correct"');
  });

  xit('should eventually find an element in an iframe', function(){
    var iframe = document.createElement('iframe');
    iframe.src = '/base/test/page1.html';
    iframe.width = 700;
    iframe.height = 1000;
    dom.el.append(iframe);
    var iframeScope = browser.scope(iframe);
    return iframeScope.find('a', {text: 'page 2'}).click().then(function(){
      return iframeScope.find('h1').shouldHave({text: 'Hello World'});
    });
  });

  domTest('calls a function for each element found', function(browser, dom){
    var promise = browser.find('span').elements();

    dom.insert('<div><span>a</span><span>b</span></div>');

    return promise.then(function(elements){
      expect(elements.length).to.equal(2);
    });
  });


  xdescribe('visibility', function(){
    it('should not find an element that is visually hidden', function(){
      dom.insert('<div class="element">hello <span style="display:none;">world</span></div>');

      return browser.find('.element > span').shouldNotExist();
    });

    it('should find an element that is visually hidden when visibleOnly = false', function(){
      dom.insert('<div class="element">hello <span style="display:none;">world</span></div>');

      return browser.set({visibleOnly: false}).find('.element > span').shouldExist();
    });

    it('should find elements that are visually hidden because of how html renders them', function(){
      dom.insert('<select><option>First</option><option>Second</option></select>');
      return browser.find('select option').shouldHave({text: ['First', 'Second']});
    });
  });
  describe('containing', function () {
    domTest('eventually finds an element containing another element', function (browser, dom) {
      var promise = browser.find('.outer').containing('.inner').shouldExist();

      setTimeout(function () {
        dom.insert('<div class="outer"><div>bad</div></div>');
        dom.insert('<div class="outer"><div class="inner">good</div></div>');
      }, 10);

      return promise;
    });

    domTest('element returns the outer element', function (browser, dom) {
      var promise = browser.find('.outer').containing('.inner').element();

      setTimeout(function () {
        dom.insert('<div class="outer"><div>bad</div></div>');
        dom.insert('<div class="outer"><div class="inner">good</div></div>');
      }, 10);

      return promise.then(function (element) {
        expect(element.hasClass('outer')).to.be.true;
      });
    });

    domTest("fails if it can't find an element containing another", function (browser, dom) {
      var promise = browser.find('.outer').containing('.inner').shouldExist();

      setTimeout(function () {
        dom.insert('<div class="outer"><div>bad</div></div>');
      }, 10);

      return expect(promise).to.be.rejected;
    });
  });
  describe('chains', function () {
    domTest('eventually finds the inner element, even if the outer element exists', function (browser, dom) {
      var promise = browser.find('.outer').find('.inner').shouldExist();

      setTimeout(function () {
        var outer = dom.insert('<div class="outer"></div>');
        setTimeout(function () {
          outer.append('<div class="inner">good</div>');
        }, 10);
      }, 10);

      return promise;
    });

    domTest('fails to find the inner element if it never arrives', function (browser, dom) {
      var promise = browser.find('.outer').find('.inner').shouldExist();

      setTimeout(function () {
        var outer = dom.insert('<div class="outer"></div>');
      }, 10);

      return expect(promise).to.be.rejected;
    });
  });
});
