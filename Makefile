out := _build
ext := $(out)/ext
cache := $(out)/.cache
mkdir = @mkdir -p $(dir $@)
copy = cp $< $@

compile:
compile.all :=



include $(out)/.node_modules.mk

$(out)/.node_modules.mk: package.json
	$(mkdir)
	npm i
	@touch $@
	@echo Restarting Make

vendor.src := table-dragger/dist/table-dragger.min.js \
	dialog-polyfill/dialog-polyfill.css \
	dialog-polyfill/dialog-polyfill.js \
	plain-dialogs/dist/plain-dialogs.js
vendor.dest := $(addprefix $(ext)/vendor/, $(vendor.src))

$(ext)/vendor/%: node_modules/%
	$(mkdir)
	$(copy)

compile.all += $(vendor.dest)
$(vendor.dest): $(out)/.node_modules.mk

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



# crx generation
pkg.name := $(shell json -e 'this.q = this.name + "-" + this.version' q < src/manifest.json)

crx: $(out)/$(pkg.name).crx

$(out)/$(pkg.name).zip: $(compile.all)
	$(mkdir)
	cd $(ext) && zip -qr $(CURDIR)/$@ *

%.crx: %.zip private.pem
	./zip2crx.sh $< private.pem

private.pem:
	openssl genrsa 2048 > $@

# sf

upload:
	scp $(out)/$(pkg.name).crx gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/
