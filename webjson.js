/* json2all.js: display json.
 * Copyright (c) 2010 Thaddee Tyl. All rights reserved.
 */

JSON.getweb = {};
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
   *    var locat = JSON.web({hello:'world'}, 'locat');
   *    if( locat() ) {  // if it has changed...
   *      alert( JSON.getweb['locat'] );
   *    }
   *   </script>
   *  </html>  */
  if (typeof obj === 'string') {
    obj = JSON.parse(obj, opts.reviver);
  }

  /* where is data located? */
  var hasChanged = false;
  JSON.getweb[id] = obj;
  
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
      'obj': function(obj, path) {
        /* this function uses the path of the current object to alter
         * the value of its elements. */
        /* path: string, eg, '["hello"][4][2]'. */
        /* id: string of container id, eg, 'show'. */
        var html = '';
        html += '<dl>';
        var i;
        for (i in obj) {
          html += '<dt><span style="border:1px solid black">%</span>' +
            /* remove: 1. Data; 2. Graphics. */
            '<button onclick="delete JSON.getweb[\'' + id + '\']' +
            path + '[\''+i+'\']; ' +
            'this.parentNode.parentNode.removeChild(' +
                'this.parentNode.nextSibling);' +
            'this.parentNode.parentNode.removeChild(this.parentNode);' +
            '">x</button>' +
            /* modification of a key! 1. Copy key; 2. Remove old key. */
            '<input value="' + i + '" ' +
            'oninput="JSON.getweb[\'' + id + '\']' +
            path + '[this.value] = JSON.getweb[\'' + id + '\']' +
            path + '[\''+i+'\']; delete JSON.getweb[\'' + id + '\']' +
            path + '[\''+i+'\']"' +
            '/>:</dt><dd>' +
            /* the subpath is updated. */
            parseObj(obj[i], path + '[\''+i+'\']') + '</dd>';
        }
        html += '<dt><button>+</button></dt>';
        html += '</dl>';
        return html;
      },
      'list': function(obj, path) {
        var html = '';
        html += '<ul>';
        for (var i=0; i<obj.length; i++) {
          html += '<li><span style="border:1px solid black">::</span>' +
            /* remove: 1. Data; 2. Graphics. */
            '<button onclick="delete JSON.getweb[\'' + id + '\']' +
            path + '['+i+']; ' +
            'this.parentNode.parentNode.removeChild(this.parentNode)' +
            '">x</button>' +
            /* the subpath is updated. */
            parseObj(obj[i], path + '['+i+']') + '</li>';
        }
        html += '<li><button>+</button></li>';
        html += '</ul>';
        return html;
      },
      'str': function(obj, path) {
        return '<input value="' + obj + '" ' +
          /* change the string. */
          'oninput="JSON.getweb[\'' + id + '\']' +
          path + ' = this.value;"/>';
      },
      'num': function(obj, path) {
        return '<input type="number" value="' + obj + '" ' +
          /* change a number. */
          'oninput="JSON.getweb[\'' + id + '\']' +
          path + ' = parseInt(this.value,10);"/>';
      },
      'bool': function(obj, path) {
        return '<select ' +
          /* change the value. */
          'onchange="JSON.getweb[\'' + id + '\']' +
          path + ' = this.value==\'true\'?true:false;">' +
          '<option' + (obj?' selected':'') + '>true</option>' +
          '<option' + (!obj?' selected':'') +'>false</option></select>';
      },
      'null':function(obj) {
        return 'null';
      }
    }
  };

  function parseObj(obj, path) {
    /* Parse obj and return an html string. */
    /* first, let's treat the opts. */
    var deal = (opts.rewrite? flags.rewrite: flags.readonly);
    /* we put it all in html. */
    var html = '';
    if (typeof obj === 'object') {
      if (obj.indexOf !== undefined) {
        /* here, obj is a list. */
        html += deal.list(obj, path);
      } else {
        /* here, obj is an object. */
        html += deal.obj(obj, path);
      }
    } else if (typeof obj === 'string') {
      /* here, obj is a string. */
      html += deal.str(obj, path);
    } else if (typeof obj === 'number') {
      /* here, obj is a number. */
      html += deal.num(obj, path);
    } else if (typeof obj === 'boolean') {
      /* here, obj is a boolean. */
      html += deal.bool(obj, path);
    } else if (obj === null) {
      /* here, obj is null. */
      html += deal['null'](obj);
    }
    return html;
  }
  
  /* display in struct. */
  var html = parseObj(JSON.getweb[id], '');  // the path is empty.
  var struct = document.getElementById(id);
  struct.innerHTML = html;

  /* return a function to check changes. */
  return function () {
    if (hasChanged) {
      /* data has changed. */
      hasChanged = false;
      return true;
    } else {
      /* data has not changed. */
      hasChanged = false;
      return false;
    }
  };
}
