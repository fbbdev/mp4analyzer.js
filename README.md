mp4analyzer.js
==============

mp4analyzer.js is a tool for parsing mp4/mov files and extracting information.
It uses HTML5 [FileReader](http://developer.mozilla.org/en-US/docs/Web/API/FileReader) and
[DataView](http://developer.mozilla.org/en-US/docs/Web/API/DataView) APIs
to read local files. Currently it only returns the codec of the first
video and audio streams, but it can be extended to extract anything
contained in mp4 atoms.

Demo: http://fbbdev.github.io/mp4analyzer.js/

Building
--------

mp4analyzer.js has been designed to be minified and optimized with
[Google Closure Compiler](https://developers.google.com/closure/compiler/).
The included makefile helps in the building process. It contains four targets:

* __wrap__: wrap the library in a single uncompressed file (output: build/mp4analyzer.js)
* __minify__: minify the library with Closure compiler (output: build/mp4analyzer.min.js)
* __optimize__: minify the library with Closure Compiler's [advanced mode](https://developers.google.com/closure/compiler/docs/api-tutorial3) (output: build/mp4analyzer.opt.js)
* __all (default):__ build plain, minified and optimized versions of the library

To use Closure Compiler you must tell make where the Closure Compiler's
jar file is located:

```sh
make CLOSURE_COMPILER=/path/to/compiler.jar
```

Make will invoke ```java -jar /path/to/compiler.jar```. You can also
override the full command:

```sh
make CLOSURE_COMMAND=your_compiler_cmd
```

Usage
-----

### A trivial example

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="mp4analyzer.js"></script>
    <script>
      if (!MP4.supported) {
        // mp4analyzer is not supported by this browser
        // (FileReader or DataView API not supported)
      }

      function handleFile(files) {
        if (files[0])
          MP4.analyze(files[0], function(result) {
            // do something
          });
      }
    </script>
  </head>
  <body>
    <input type="file" onchange="handleFile(this.files)">
  </body>
</html>
```

### Namespace

mp4analyzer.js exports a global object named ```MP4```. This namespace
contains all methods and properties defined by the library.

### Checking for browser support

```js
MP4.supported = true/false;
```

A boolean property named ```supported``` is defined in the ```MP4``` namespace.
It is set to false if the requested APIs are not supported.

### Running the analyzer

```js
MP4.analyze = function(  // return type: boolean
    blob,                // type: Blob
    callback             // type: function(result)
);
```

To analyze a file you only need to call ```MP4.analyze```. The first argument
must be a HTML5 [File](http://developer.mozilla.org/en-US/docs/Web/API/File) or
[Blob](http://developer.mozilla.org/en-US/docs/Web/API/Blob) object.
A [TypeError](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
exception is thrown when ```blob``` does not inherit the ```Blob``` object
and when ```blob.type``` is not 'video/mp4', 'audio/mp4' or 'video/quicktime'.
The second argument is a completion callback. The analysis process is
asynchronous to avoid blocking the browser while waiting for disk I/O.
The argument passed to the callback is the result object.

```MP4.analyze``` will return ```false``` and do nothing when
```MP4.supported``` is ```false```; it will return ```true``` otherwise.

### Reading results

```js
{
  video: { // null if no video stream found
    codec: 'codec name'
  },
  audio: { // null if no audio stream found
    codec: 'codec name'
  }
};
```

This is the structure of the result object passed to the callback.
As stated above, the analyzer currently extracts only the codec name
for the first video and audio streams. If no video or audio stream is found,
the concerning field in the result object is set to ```null```.

```result.video.codec``` contains a FOURCC code. You can find a FOURCC list
[there](http://www.fourcc.org/codecs.php).
```result.audio.codec``` contains one of these strings:

* '.mp3': MPEG-1 Layer 3 (MP3)
* 'aac': MPEG-4 Advanced Audio Coding (AAC)
* 'ac-3': Digital Audio Compression Standard (AC-3, Enhanced AC-3)
* 'vorbis': OGG Vorbis
* 'dvca': DV Audio
* [Infrequent values](https://developer.apple.com/library/mac/documentation/quicktime/qtff/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-75770)

Browser support
---------------

Firefox >= 15, Chrome >= 9, Internet Explorer >= 10, Opera >= 12.1,
Safari >= 6.0.2

Detail:

* FileReader: http://caniuse.com/filereader
* DataView: http://caniuse.com/typedarrays

MP4/MOV file format documentation
---------------------------------

1. QuickTime File Format Specification: https://developer.apple.com/library/mac/documentation/QuickTime/qtff/QTFFPreface/qtffPreface.html

2. MOV/ISOM demuxer code from FFMPEG:
  -  http://git.videolan.org/?p=ffmpeg.git;a=blob;f=libavformat/mov.c
  -  http://git.videolan.org/?p=ffmpeg.git;a=blob;f=libavformat/isom.h
  -  http://git.videolan.org/?p=ffmpeg.git;a=blob;f=libavformat/isom.c

3. AtomicParsley documentation: http://atomicparsley.sourceforge.net/mpeg-4files.html

4. MPEG4 Registration Authority: http://www.mp4ra.org

5. Fourcc codes of video codecs: http://www.fourcc.org/codecs.php

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
