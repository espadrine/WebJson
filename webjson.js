/* json2all.js: display json.
 * Copyright (c) 2010 Thaddee Tyl. All rights reserved.
 */

JSON.web = function (obj, id, opts) {
  /* Display json object obj in html structure of id id.
   * If obj is a string, it is the location of a json file.
   * The optional parameters include opts.rewrite, which
   * activates the possibility to change it, and
   * opts.reviver, which is a function to filter the object.
   * Example of use:
   *  <html>
   *   <body id="locat"></body>
   *   <script>
   *    var getlocat = JSON.web({hello:'world'}, 'locat');
   *    if( getlocat('?') ) {  // if it has changed...
   *      alert( getlocat() );
   *    }
   *   </script>
   *  </html>  */
  if (typeof obj === 'string') {
    obj = JSON.parse(obj, opts.reviver);
  }

  /* where is data located? */
  data = {
    'hasChanged': false,
    'json': {}
  };
  
  var flags = {
    'readonly': {
      'obj': function(obj) {
        var html = '';
        html += '<dl>';
        var i;
        for (i in obj) {
          html += '<dt>' + i + ':<dd>' + parseObj(obj[i]);
        }
        if (i === undefined) {
          html += '<dd>Empty object here.';
        }
        html += '</dl>';
        return html;
      },
      'list': function(obj) {
        var html = '';
        html += '<ul>';
        for (var i=0; i<obj.length; i++) {
          html += '<li>' + parseObj(obj[i]);
        }
        if (i == 0) {
          html += '<li>Empty list here.';
        }
        html += '</ul>';
        return html;
      },
      'str': function(obj) {
        return obj;
      },
      'num': function(obj) {
        return obj;
      },
      'bool': function(obj) {
        return (obj? 'true': 'false');
      },
      'null':function(obj) {
        return 'null';
      }
    },
    'rewrite': {
      'obj': function(obj) {
        var html = '';
        html += '<dl>';
        var i;
        for (i in obj) {
          html += '<dt><span style="border:1px solid black">::::</span>' +
            '<button>x</button>' +
            '<input value="' + i + '">:</dt><dd>' + parseObj(obj[i]) + '</dd>';
        }
        html += '<dt><button>+</button></dt>';
        html += '</dl>';
        return html;
      },
      'list': function(obj) {
        var html = '';
        html += '<ul>';
        for (var i=0; i<obj.length; i++) {
          html += '<li><span style="border:1px solid black">::</span>' +
            '<button>x</button>' + parseObj(obj[i]) + '</li>';
        }
        html += '<li><button>+</button></li>';
        html += '</ul>';
        return html;
      },
      'str': function(obj) {
        return '<input value="' + obj + '"/>';
      },
      'num': function(obj) {
        return '<input type="number" value="' + obj + '"/>';
      },
      'bool': function(obj) {
        return '<select><option' + (obj?' selected':'') + '>true</option>' +
          '<option' + (!obj?' selected':'') +'>false</option></select>';
      },
      'null':function(obj) {
        return 'null';
      }
    }
  };

  function parseObj(obj) {
    /* Parse obj and return an html string. */
    /* first, let's treat the opts. */
    var deal = (opts.rewrite? flags.rewrite: flags.readonly);
    /* we put it all in html. */
    var html = '';
    if (typeof obj === 'object') {
      if (obj.indexOf !== undefined) {
        /* here, obj is a list. */
        html += deal.list(obj);
      } else {
        /* here, obj is an object. */
        html += deal.obj(obj);
      }
    } else if (typeof obj === 'string') {
      /* here, obj is a string. */
      html += deal.str(obj);
    } else if (typeof obj === 'number') {
      /* here, obj is a number. */
      html += deal.num(obj);
    } else if (typeof obj === 'boolean') {
      /* here, obj is a boolean. */
      html += deal.bool(obj);
    } else if (obj === null) {
      /* here, obj is null. */
      html += deal['null'](obj);
    }
    return html;
  }
  
  /* display in struct. */
  var html = parseObj(obj);
  var struct = document.getElementById(id);
  struct.innerHTML = html;

  /* return a function to check changes. */
  return function (query) {
    if (query === '?') {
      if (data.hasChanged) {
        /* data has changed. */
        data.hasChanged = false;
        return true;
      } else {
        /* data has not changed. */
        data.hasChanged = false;
        return false;
      }
    } else {
      /* query is not asking whether data has changed. */
      return data.json;
    }
  };
}
