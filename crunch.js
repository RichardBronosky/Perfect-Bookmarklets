//*****************************************************************************
// Do not remove this notice.
//
// Original code by Mike Hall of brainjar.com
// Modified by William T. Olson
// Modified by Richard Bronosky
//
// Offered under the terms of the GPLv2
//*****************************************************************************
// This script is able to execute embeded script in the same tag that references
// this external script. As described by John Resig at
// http://ejohn.org/blog/degrading-script-tags/
// Basic Example:
//   <p>Bookmark this link: <a id="foo" href="#">foo</a> <label for="foo"></label></p>
//   <script type='text/javascript' src='crunch.js'>
//     bookmarklet('foo', 'Greeting', function(){ alert('Hello World'); });
//   </script>

(function(window, undefined) {

  var literalStrings;  // For temporary storage of literal strings.

  function replaceLiteralStrings(s) {

    var i, c, t, lines, escaped, quoteChar, inQuote, literal;

    literalStrings = new Array();
    t = '';

    // Split script into individual lines.

    lines = s.split('\n');
    for (i = 0; i < lines.length; i++) {

      j = 0;
      inQuote = false;
      while (j <= lines[i].length) {
        c = lines[i].charAt(j);

        // If not already in a string, look for the start of one.

        if (!inQuote) {
          if (c == '"' || c == "'") {
            inQuote = true;
            escaped = false;
            quoteChar = c;
            literal = c;
          }
         else
           t += c;
        }

        // Already in a string, look for end and copy characters.

        else {
          if (c == quoteChar && !escaped) {
            inQuote = false;
            literal += quoteChar;
            t += '__' + literalStrings.length + '__';
            literalStrings[literalStrings.length] = literal;
          }
          else if (c == '\\' && !escaped)
            escaped = true;
          else
            escaped = false;
          literal += c;
        }
        j++;
      }
      t += '\n';
    }

    return t;
  };

  function removeComments(s) {

    var lines, i, t;

    // Remove '//' comments from each line.

    lines = s.split('\n');
    t = '';
    for (i = 0; i < lines.length; i++)
      t += lines[i].replace(/([^\x2f]*)\x2f\x2f.*$/, '$1');

    // Replace newline characters with spaces.

    t = t.replace(/(.*)\n(.*)/g, '$1 $2');

    // Remove '/* ... */' comments.

    lines = t.split('*/');
    t = '';
    for (i = 0; i < lines.length; i++)
      t += lines[i].replace(/(.*)\x2f\x2a(.*)$/g, '$1 ');

    return t;
  };

  function compressWhiteSpace(s) {

    // Condense white space.

    s = s.replace(/\s+/g, ' ');
    s = s.replace(/^\s(.*)/, '$1');
    s = s.replace(/(.*)\s$/, '$1');

    // Remove uneccessary white space around operators, braces and parentices.

    s = s.replace(/\s([\x21\x25\x26\x28\x29\x2a\x2b\x2c\x2d\x2f\x3a\x3b\x3c\x3d\x3e\x3f\x5b\x5d\x5c\x7b\x7c\x7d\x7e])/g, '$1');
    s = s.replace(/([\x21\x25\x26\x28\x29\x2a\x2b\x2c\x2d\x2f\x3a\x3b\x3c\x3d\x3e\x3f\x5b\x5d\x5c\x7b\x7c\x7d\x7e])\s/g, '$1');
    return s;
  };

  function combineLiteralStrings(s) {

    var i;

    s = s.replace(/"\+"/g, '');
    s = s.replace(/'\+'/g, '');

    return s;
  };

  function restoreLiteralStrings(s) {

    var i;

    for (i = 0; i < literalStrings.length; i++)
      s = s.replace(new RegExp('__' + i + '__'), literalStrings[i]);

    return s;
  };

  function findPos(obj) {
    var curleft = curtop = 0;
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return [curleft,curtop];
      }
  };

  function get_label_for(for_id){
    var labels = document.getElementsByTagName('label');
    for (var i = 0; i < labels.length; i++) {
      var attr = labels[i].attributes.getNamedItem('for');
      if (attr && attr.value == for_id) {
        return labels[i];
      }
    }
    return null;
  };

  function mobile_popup(el){
    // Only append the style sheet once.
    if(!mobile_popup.style){
      var head = document.getElementsByTagName('head')[0],
          style = document.createElement('style'),
          rules = document.createTextNode(
            '.mobile_bookmarklet_container { position:absolute; background-color: #888; border-radius: 7px; padding: 5px; } ' +
            '.mobile_bookmarklet_close a { color:#666; background:#DDD; text-decoration:none; opacity:.6; border-radius:3px; padding:0px 2px; font-size: 24pt; } ' +
            '.mobile_bookmarklet_close a:hover { opacity:1; } ' +
            '.mobile_bookmarklet_close { position:absolute; right:1px; } ' +
            '.mobile_bookmarklet_textarea { width:360px; height:140px; border-radius:3px; } ' +
            '.mobile_bookmarklet_textarea { width:360px; height:140px; border-radius:3px; } '
          );
      style.type = 'text/css';
      if(!style.styleSheet)
        style.appendChild(rules);
      else style.styleSheet.cssText = rules.nodeValue;
      head.appendChild(style);
      mobile_popup.style = style;
    }
    // Only create the popup once.
    if(document.getElementById(el.id+'_popup')){
      return false;
    }

    window.document.title = el.innerText
    var pos = findPos(el);
    var div = document.createElement('div');
    idAttr = document.createAttribute('id');
    idAttr.value=el.id+'_popup';
    div.attributes.setNamedItem(idAttr);

    div.classList.add('mobile_bookmarklet_container')
    div.style.left = (pos[0]+(el.offsetWidth/2))+'px';
    div.style.top = (pos[1]+(el.offsetHeight/2))+'px';
    div.innerHTML = '';

    var textarea = document.createElement('textarea');
    textarea.classList.add('mobile_bookmarklet_textarea')

    // TODO: mobile_bookmarklet_close must be dynamically ided to match the triggering anchor
    var close = document.createElement('span');
    close.innerHTML = '<a href="#null" id="'+el.id+"_popup_close"+'" onclick="mobile_popup.closer(this);">&#9099;</a>';
    close.classList.add('mobile_bookmarklet_close')

    var span = document.createElement('span');
    span.style.position = 'relative';
    span.appendChild(textarea);
    span.appendChild(close);
    div.appendChild(span);
    el.parentNode.insertBefore(div,el.nextSibling);
    window.document.getElementById(el.id+'_popup_close').to_close = div;
    textarea.innerHTML = el.href;

    mobile_popup.original_title = ''+window.document.title
    mobile_popup.closer = function(el){
      el.to_close.parentElement.removeChild(el.to_close);
      window.document.title=mobile_popup.original_title;
      return false;
    }
    window.mobile_popup = mobile_popup;
  };

  window.crunch = function(code) {
    code = replaceLiteralStrings(code);
    code = removeComments(code);
    code = compressWhiteSpace(code);
    code = combineLiteralStrings(code);
    code = restoreLiteralStrings(code);
    return code;
  };

  // Turn anchor into a proper bookmarklet
  window.bookmarklet = function(anchor_id, name, func){
    anchor = window.document.getElementById(anchor_id);
    anchor.innerHTML = name;
    anchor.href = 'javascript:('+window.crunch(new String(func))+')()';
    // Instead of running the bookmarklet on click, show a popup to help out mobile users.
    anchor.onclick = function(){ mobile_popup(this); return false; }
    if(label=get_label_for(anchor_id)){
        label.innerHTML = '\x3Cp style="margin:0;">Mobile Users,\x3C/p>\x3Cp style="text-indent: 1.5em; margin:0;">Clicking the bookmarklet will open a popup where you can easily select and copy the contents. Bookmark this page. Then edit the bookmark, pasting the contents into the location field (replacing it entirely).\x3C/p>\x3Cp style="margin-bottom:0;">Everyone Else,\x3C/p>\x3Cp style="text-indent: 1.5em; margin:0;">Dragging the link to your bookmarks toolbar is the easiest way.\x3C/p>'
    }
  };

  // Make it possible to place embeded script in the same tag that references this external script
  (function(){
    var scripts = document.getElementsByTagName('script');
    eval( scripts[ scripts.length - 1 ].innerHTML );
  })();

})(window);

// vim: set ts=2 sw=2 sts=2 et ://
