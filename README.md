mp4analyzer.js
==============

mp4analyzer.js parses mp4/mov files and extracts information. It uses the HTML5 FileAPI to read files from disk. Currently it only returns the codec of the first video and audio streams, but it can be extended to extract anything contained in mp4 atoms.

Building
--------

mp4analyzer.js has been designed to be minified and optimized with [Google Closure Compiler](https://developers.google.com/closure/compiler/).
The included makefile helps in the building process. It has four targets:

* __wrap__: wrap the library in a single uncompressed file (output: build/mp4analyzer.js)
* __minify__: minify the library with Closure compiler (output: build/mp4analyzer.min.js)
* __optimize__: minify the library with Closure Compiler in advanced mode (output: build/mp4analyzer.opt.js); this is the best choice and should be preferred. Closure Compiler removes dead code and produces code which is easier to optimize for modern JavaScript engines.
* __all (default):__ build plain, minified and optimized versions of the library

To use Closure Compiler you need to tell make the compiler JAR location:
```
make CLOSURE_COMPILER=/path/to/compiler.jar
```
Alternatively you can fully replace the compiler command:
```
make CLOSURE_COMMAND=your_compiler_cmd
```

Usage
-----

License
-------

The MIT License (MIT)

Copyright (c) 2013 Fabio Massaioli

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
