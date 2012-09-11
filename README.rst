Perfect Bookmarklets
====================

As the name indicates, the goal of this project is to empower people to create
perfect bookmarklets. I have always thought that everyone should have the
ability to write tiny scripts that make their online experience better. With the
ubiquity of mobile devices and their inherent limitations bookmarklets are even
more important. Unfortunately bookmarklets are even harder to use, or at least
install, on these devices.

Let's make that better.

--------------------------------------------------------------------------------

Goals
-----
- easy for people to install
- includes instructions that anyone can follow
- works on mobile devices
- easy to read and maintain
- easy to implement

--------------------------------------------------------------------------------

Example
-------
::

    <p>
      Bookmark this link:
        <a id="foo" href="#">foo</a>
        <label for="foo"></label>
    </p>

    <script type='text/javascript' src='crunch.js'>
      bookmarklet('foo', 'Greeting',
        function(){
          alert('Hello World');
        }
      );
    </script>

--------------------------------------------------------------------------------

Demo
----
`Bookmarklet for printing USPS shipping labels via iPad/iPhone/Android device <http://richardbronosky.github.com/Perfect-Bookmarklets/usps.html>`_
