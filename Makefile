default : all

CLOSURE_COMPILER ?= compiler.jar
CLOSURE_COMMAND ?= java -jar ${CLOSURE_COMPILER}

build:
	mkdir -p build

build/mp4analyzer.unwrapped.js : build src/mp4.js src/compatibility.js src/blob.js src/context.js src/tags.js src/atom.js src/visitor.js src/atoms.js src/analyze.js src/export.js
	cat src/mp4.js src/compatibility.js src/blob.js src/context.js src/tags.js src/atom.js src/visitor.js src/atoms.js src/analyze.js src/export.js > build/mp4analyzer.unwrapped.js

build/mp4analyzer.js : build/mp4analyzer.unwrapped.js
	printf '(function() {\n' > build/mp4analyzer.js
	cat build/mp4analyzer.unwrapped.js >> build/mp4analyzer.js
	printf '}());\n' >> build/mp4analyzer.js

build/mp4analyzer.min.js : build/mp4analyzer.unwrapped.js
	${CLOSURE_COMMAND} --language_in ECMASCRIPT5_STRICT --compilation_level SIMPLE_OPTIMIZATIONS --js build/mp4analyzer.unwrapped.js --js_output_file build/mp4analyzer.min.js --output_wrapper '(function(){%output%}());'

build/mp4analyzer.opt.js : build/mp4analyzer.unwrapped.js
	${CLOSURE_COMMAND} --language_in ECMASCRIPT5_STRICT --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --externs externs.js --js build/mp4analyzer.unwrapped.js --js_output_file build/mp4analyzer.opt.js --output_wrapper '(function(){%output%}());'

wrap : build/mp4analyzer.js

minify : build/mp4analyzer.min.js

optimize : build/mp4analyzer.opt.js

all : wrap minify optimize

rebuild : clean

clean:
	rm -rf build/mp4analyzer.unwrapped.js build/mp4analyzer.js build/mp4analyzer.min.js build/mp4analyzer.opt.js
