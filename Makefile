out := _out/$(shell git rev-parse --abbrev-ref HEAD)
ext := $(out)/ext
pkg := $(shell json -d- -a name version < src/manifest.json)
crx := $(out)/$(pkg).crx
zip := $(out)/$(pkg).zip

all:



include $(out)/.node_modules.mk

$(out)/.node_modules.mk: package.json
	$(mkdir)
	npm i
	@touch $@ && echo Restarting Make

vendor.src := $(shell adieu -pe '$$("link,script").map((_,e) => $$(e).attr("href") || $$(e).attr("src")).get().filter(v => /node_modules/.test(v)).join`\n`' src/options.html)
vendor.dest := $(addprefix $(ext)/, $(vendor.src))

$(ext)/node_modules/%: node_modules/%
	$(mkdir)
	$(copy)
	@[ ! -r "$<".map ] || cp "$<".map "$@".map

$(vendor.dest): $(out)/.node_modules.mk

assets.dest := $(patsubst src/%, $(ext)/%, $(wildcard src/*))

$(assets.dest): $(ext)/%: src/%
	$(mkdir)
	$(copy)

compile.all := $(vendor.dest) $(assets.dest)
all: $(compile.all)



zip: $(zip)
$(zip): $(compile.all)
	-rm $@
	cd $(ext) && zip -qr $(CURDIR)/$@ *

crx: $(crx)
pkg.key := $(out)/private.pem
%.crx: %.zip $(pkg.key)
	crx3-new $(pkg.key) < $< > $@

$(pkg.key):
	$(mkdir)
	openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $@

mkdir = @mkdir -p $(dir $@)
copy = cp $< $@

upload: $(crx)
	scp $< gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/

.DELETE_ON_ERROR:
