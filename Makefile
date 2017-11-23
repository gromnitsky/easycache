out := _build
mkdir = @mkdir -p $(dir $@)
copy = cp $< $@

compile:
compile.all :=

vendor.src := table-dragger/dist/table-dragger.min.js
vendor.dest := $(addprefix $(out)/vendor/, $(vendor.src))

$(out)/vendor/%: node_modules/%
	$(mkdir)
	$(copy)

compile.all += $(vendor.dest)

assets.src := $(wildcard $(addprefix src/, *.html icons/* manifest.json))
assets.dest := $(patsubst src/%, $(out)/%, $(assets.src))

$(assets.dest): $(out)/%: src/%
	$(mkdir)
	$(copy)

compile.all += $(assets.dest)



# FIXME: rm this section after Chrome will allow loading es6 modules
#        within extensions (the spring of 2018?)
bundles.src := src/options.mjs src/event_page.mjs
bundles.dest := $(patsubst src/%.mjs, $(out)/%.mjs, $(bundles.src))

$(out)/%.mjs: src/%.mjs
	$(mdir)
	browserify $< -o $@

compile.all += $(bundles.dest)

compile: $(compile.all)



pkg.name := $(shell json -e 'this.q = this.name + "-" + this.version' q < src/manifest.json)
