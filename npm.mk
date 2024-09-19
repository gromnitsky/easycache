# FIXME: iterate over $(src.html)
npm.src := $(shell adieu -pe '$$("link,script").map((_,e) => $$(e).attr("href") || $$(e).attr("src")).get().filter(v => /node_modules/.test(v)).join`\n`' $(src.html))
dest += $(addprefix $(out)/ext/, $(npm.src)) _out/npm.target

$(out)/ext/node_modules/%: node_modules/%
	@mkdir -p $(dir $@)
	cp $< $@
	@[ ! -r "$<".map ] || cp "$<".map "$@".map

_out/npm.target: package.json
	@mkdir -p $(dir $@)
	npm $(if $(offline),--offline --no-audit) i
	touch $@

include _out/npm.target
