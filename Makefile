default : all

build:
	mkdir build

build/analyzer.unwrapped.js : build src/mp4.js src/compatibility.js src/blob.js src/context.js src/tags.js src/atom.js src/visitor.js src/atoms.js src/analyze.js src/export.js
	cat src/mp4.js src/compatibility.js src/blob.js src/context.js src/tags.js src/atom.js src/visitor.js src/atoms.js src/analyze.js src/export.js > build/analyzer.unwrapped.js

build/analyzer.js : build/analyzer.unwrapped.js
	printf '(function() {\n' > build/analyzer.js
	cat build/analyzer.unwrapped.js >> build/analyzer.js
	printf '}());\n' >> build/analyzer.js

build/analyzer.min.js : build/analyzer.unwrapped.js
	java -jar ../compiler.jar --language_in ECMASCRIPT5_STRICT --compilation_level SIMPLE_OPTIMIZATIONS --js build/analyzer.unwrapped.js --js_output_file build/analyzer.min.js --create_source_map build/analyzer.min.js.map --output_wrapper '(function(){%output%}());'

build/analyzer.opt.js : build/analyzer.unwrapped.js
	java -jar ../compiler.jar --language_in ECMASCRIPT5_STRICT --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --externs externs.js --js build/analyzer.unwrapped.js --js_output_file build/analyzer.opt.js --create_source_map build/analyzer.opt.js.map --output_wrapper '(function(){%output%}());'

wrap : build/analyzer.js

minify : build/analyzer.min.js

optimize : build/analyzer.opt.js

all : wrap minify optimize

rebuild : clean 

clean:
	rm -rf build/analyzer.unwrapped.js build/analyzer.js build/analyzer.min.js build/analyzer.opt.js build/*.js.map
