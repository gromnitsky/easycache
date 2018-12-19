out := _out/$(shell git rev-parse --abbrev-ref HEAD)
ext := $(out)/ext
pkg.name := $(shell json -d- -a name version < src/manifest.json)
pkg.crx := $(out)/$(pkg.name).crx

mkdir = @mkdir -p $(dir $@)
copy = cp $< $@

all:
crx: $(pkg.crx)



include $(out)/.node_modules.mk

$(out)/.node_modules.mk: package.json
	$(mkdir)
	npm i
	@touch $@ && echo Restarting Make

vendor.src := table-dragger/dist/table-dragger.min.js \
	dialog-polyfill/dialog-polyfill.css \
	dialog-polyfill/dialog-polyfill.js \
	plain-dialogs/dist/plain-dialogs.js
vendor.dest := $(addprefix $(ext)/vendor/, $(vendor.src))

$(ext)/vendor/%: node_modules/%
	$(mkdir)
	$(copy)

$(vendor.dest): $(out)/.node_modules.mk

assets.dest := $(patsubst src/%, $(ext)/%, $(wildcard src/*))

$(assets.dest): $(ext)/%: src/%
	$(mkdir)
	$(copy)

compile.all := $(vendor.dest) $(assets.dest)
all: $(compile.all)



$(out)/$(pkg.name).zip: $(compile.all)
	$(mkdir)
	cd $(ext) && zip -qr $(CURDIR)/$@ *

pkg.key := $(out)/private.pem
%.crx: %.zip $(pkg.key)
	./zip2crx $^

$(pkg.key):
	openssl genrsa 2048 > $@

# sf

upload: $(pkg.crx)
	scp $< gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/
