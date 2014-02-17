(function(){'use strict';var e={};function h(b){var a=/^webkit/;Object.getOwnPropertyNames(b.prototype).forEach(function(c){a.test(c)&&(b.prototype[c[6].toLowerCase()+c.slice(7)]=b.prototype[c])})}
e={s:function(){window.Blob=window.Blob||window.webkitBlob||void 0;window.File=window.File||window.webkitFile||void 0;window.FileReader=window.FileReader||window.webkitFileReader||void 0;return Blob&&File&&FileReader?(h(window.Blob),h(window.File),h(window.FileReader),!0):!1},r:function(){window.DataView=window.DataView||window.webkitDataView||void 0;return DataView?(h(window.DataView),!0):!1}};
if(e.s()&&e.r()){Blob.prototype.g=0;Blob.C=1;Blob.A=2;Blob.B=3;Blob.prototype.n=function(b){this.g+=b;this.g>this.size&&(this.g=this.size)};Blob.prototype.w=function(){this.g=0};Blob.prototype.m=function(){return this.g===this.size};Blob.prototype.h=function(b){return this.slice(this.g,this.g+b)};Blob.prototype.v=function(b){b=this.h(b);this.g+=b.size;return b};var k=function(){this.l=this.o=this.type=null},l=function(){this.i=this.k=this.error=this.f=this.parent=null;this.result=function(){this.k||
this.i||this.error||(this.error=Error("Cannot find codec information"));return{error:this.error,video:this.k&&{codec:this.k.l},audio:this.i&&{codec:this.i.l}}}},n={64:"aac",102:"aac",103:"aac",104:"aac",105:".mp3",107:".mp3",165:"ac-3",169:"dts",221:"vorbis"},p=function(b,a){a=a||0;this.type=b.getUint8(a);this.size=0;this.b=1;this.a=0;for(var c=4;this.b++,c--;){var d=b.getUint8(a+1+(3-c));this.size=this.size<<7|d&127;if(!(d&128))break}},q=function(b,a){a=a||0;p.call(this,b,a);if(3!==this.type)this.a=
this.size-this.b;else{a+=this.b;this.a=3;var c=b.getUint8(a+2);c&128&&(this.a+=2);c&64&&(this.a+=1+b.getUint8(a+this.a));c&32&&(this.a+=2)}},r=function(b,a){a=a||0;p.call(this,b,a);4!==this.type?(this.j=null,this.a=this.size-this.b):(a+=this.b,this.j=b.getUint8(a),this.a=13)},s=function(b,a){a=a||0;this.size=b.getUint32(a,!1);this.type=String.fromCharCode.apply(null,new Uint8Array(b.buffer,a+4,4));this.b=8;this.a=0;this.parsed=!1},t={},u=function(b,a,c,d,g){a.n(b.b+b.a);a.m()?d(c):(g=g||new FileReader,
g.onloadend=function(f){f.target.readyState===FileReader.DONE&&(8>f.target.result.byteLength?(c.error=Error("Input data is corrupted or not encoded as mp4/mov"),d(c)):(f=new DataView(f.target.result),f=new s(f,0),f.size<f.b?(c.error=Error("Input data is corrupted or not encoded as mp4/mov"),d(c)):f.type in t&&t[f.type].e?(c.parent=b.type,t[f.type].e(f,a.v(f.size),c,function(){a.m()?d(c):g.readAsArrayBuffer(a.h(8))})):(a.n(f.size),a.m()?d(c):g.readAsArrayBuffer(a.h(8)))))},g.readAsArrayBuffer(a.h(8)))},
v=function(b,a,c,d){if(b.type in t)if(b.parsed)u(b,a,c,d);else if(t[b.type].d){var g=new FileReader,f=-1==t[b.type].c?b.size:t[b.type].c;g.onloadend=function(m){m.target.readyState===FileReader.DONE&&(m.target.result.byteLength<f?(c.error=Error("Input data is corrupted or not encoded as mp4/mov"),d(c)):(m=new DataView(m.target.result),b=t[b.type].d(c,m,0),u(b,a,c,d,g)))};g.readAsArrayBuffer(a.h(f))}else b.a=t[b.type].c-b.b,u(b,a,c,d);else d(c)},w=function(b,a){a=a||0;s.call(this,b,a);var c=String.fromCharCode.apply(null,
new Uint8Array(b.buffer,a+12,8));this.u=c.slice(0,4);this.t=c.slice(4);this.a=this.size-this.b;this.parsed=!0},x=function(b,a){a=a||0;s.call(this,b,a);a+=12;this.p=b.getUint32(a,!1);this.q=0<this.p?String.fromCharCode.apply(null,new Uint8Array(b.buffer,a+8,4)):null;this.a=8;this.parsed=!0},y=function(b,a){a=a||0;s.call(this,b,a);this.a=16;var c=b.getUint16(a+16,!1);this.a=0===c?this.a+12:1===c?this.a+28:2===c?this.a+48:this.size-this.b;this.parsed=!0},z=function(b,a){a=a||0;s.call(this,b,a);a+=12;
this.a=this.size-this.b;var c=new q(b,a);a+=c.b+c.a;c=new r(b,a);this.j=c.j;this.parsed=!0};t.moov={e:v,c:8,d:void 0};t.trak={e:function(b,a,c,d){c.f=new k;u(b,a,c,function(a){"vide"===a.f.o&&null===a.k?a.k=a.f:"soun"===a.f.o&&null===a.i&&(a.i=a.f);a.f=null;d(a)})},c:8,d:void 0};t.mdia={e:v,c:8,d:void 0};t.hdlr={e:function(b,a,c,d){"mdia"===c.parent?v(b,a,c,d):d(c)},c:20,d:function(b,a,c){a=new w(a,c);b.f.type=a.u;b.f.o=a.t;return a}};t.minf={e:v,c:8,d:void 0};t.stbl={e:v,c:8,d:void 0};t.stsd={e:v,
c:24,d:function(b,a,c){a=new x(a,c);0<a.p&&"mp4a"!==a.q&&(b.f.l=a.q,a.a=a.size-a.b);return a}};t.mp4a={e:function(b,a,c,d){"stsd"===c.parent?v(b,a,c,d):d(c)},c:18,d:function(b,a,c){return new y(a,c)}};t.wave={e:v,c:8,d:void 0};t.esds={e:v,c:-1,d:function(b,a,c){a=new z(a,c);null!==a.j&&(b.f.l=n[a.j]);return a}};window.MP4={supported:!0,analyze:function(b,a){if(!(b instanceof Blob))throw new TypeError("Invalid argument type");var c=new ArrayBuffer(8),c=new DataView(c),d=new s(c);d.size=8+b.size;d.type=
"root";d.a=-8;d.parsed=!0;var g=new FileReader;g.onloadend=function(c){c.target.readyState===FileReader.DONE&&("ftyp"!=c.target.result?(c=new l,c.error=Error("Input data format is not mp4/mov"),a(c.result())):(b.w(),u(d,b,new l,function(b){a(b.result())},g)))};b.n(4);g.readAsText(b.h(4));return!0}}}else window.MP4={supported:!1,analyze:function(){return!1}};}());
