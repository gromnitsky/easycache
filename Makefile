out := _build
ext := $(out)/ext
cache := $(out)/.cache
mkdir = @mkdir -p $(dir $@)
copy = cp $< $@

compile:
compile.all :=

vendor.src := table-dragger/dist/table-dragger.min.js
vendor.dest := $(addprefix $(ext)/vendor/, $(vendor.src))

$(ext)/vendor/%: node_modules/%
	$(mkdir)
	$(copy)

compile.all += $(vendor.dest)

assets.src := $(wildcard $(addprefix src/, *.html *.png manifest.json))
assets.dest := $(patsubst src/%, $(ext)/%, $(assets.src))

$(assets.dest): $(ext)/%: src/%
	$(mkdir)
	$(copy)

compile.all += $(assets.dest)



# FIXME: rm this section after Chrome will allow loading es6 modules
#        within extensions (the spring of 2018?)
mjs.dest := $(patsubst src/%.mjs, $(cache)/%.mjs, $(wildcard src/*.mjs))
bundles.src := $(addprefix $(cache)/, options.mjs event_page.mjs popup.mjs)
bundles.dest := $(patsubst $(cache)/%.mjs, $(ext)/%.mjs, $(bundles.src))

-include $(bundles.src:.mjs=.d)

$(mjs.dest): $(cache)/%.mjs: src/%.mjs
	$(mkdir)
	$(copy)

compile.all += $(mjs.dest)

# browserify 14.4.0
define make-depend
@echo Generating $(basename $<).d
@printf '%s: ' $@ > $(basename $<).d
@browserify --no-bundle-external --list $< \
        | sed s,$(CURDIR)/,, | sed s,$<,, | tr '\n' ' ' \
        >> $(basename $<).d
endef

$(ext)/%.mjs: $(cache)/%.mjs
	$(mdir)
	browserify $< -o $@
	$(make-depend)

compile.all += $(bundles.dest)

compile: $(compile.all)



pkg.name := $(shell json -e 'this.q = this.name + "-" + this.version' q < src/manifest.json)
