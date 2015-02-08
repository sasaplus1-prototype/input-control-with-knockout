(function(){

  'use strict';

  // base code from:
  //   http://stackoverflow.com/questions/26263169/how-to-retain-cursor-position-when-updating-a-knockout-js-observable-in-an-exten
  function getCaretPosition(element) {
    var caretPos = 0,
        sel;

    if (!!document.selection) {
      // for IE
      element.focus();

      sel = document.selection.createRange();
      sel.moveStart('character', -element.value.length);

      caretPos = sel.text.length;
    } else if (!!element.selectionStart || element.selectionStart === 0) {
      // for modern browsers
      caretPos = element.selectionStart;
    }

    return caretPos;
  }

  // base code from:
  //   http://stackoverflow.com/questions/26263169/how-to-retain-cursor-position-when-updating-a-knockout-js-observable-in-an-exten
  function setCaretPosition(element, caretPos) {
    var range;

    if (!!element.createTextRange) {
      // for IE
      range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      // for modern browsers
      element.focus();

      if (!!element.selectionStart) {
        element.setSelectionRange(caretPos, caretPos);
      }
    }
  }

  ko.extenders.validate = function(target, options) {
    var result = ko.pureComputed({
      read: target,
      write: function(newValue) {
        if (options.regexp.test(newValue)) {
          target(newValue);
        } else {
          target.notifySubscribers(newValue);
        }
      }
    }).extend({
      notify: 'always'
    });

    return result;
  };

  ko.extenders.control = function(target, options) {
    var result = ko.pureComputed({
      read: target,
      write: function(newValue) {
        options.callback(target, newValue, options.element);
      }
    }).extend({
      notify: 'always'
    });

    return result;
  };

  function ViewModel() {
    this.text1 = ko.observable('').extend({
      validate: {
        regexp: /^[A-Z]*$/
      }
    });
    this.text2 = ko.observable('').extend({
      control: {
        element: document.getElementById('input-name'),
        callback: function(target, newValue, element) {
          var caretPos;

          if (newValue === '') {
            target('');
          } else {
            // save caret position
            caretPos = getCaretPosition(element);

            // convert
            target(
                newValue[0].toUpperCase() +
                newValue.slice(1).toLowerCase());

            // revert caret position
            setCaretPosition(element, caretPos);
          }
        }
      }
    });
  }

  ko.applyBindings(new ViewModel);

}());
