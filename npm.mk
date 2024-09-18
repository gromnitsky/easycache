vendor.src := $(shell adieu -pe '$$("link,script").map((_,e) => $$(e).attr("href") || $$(e).attr("src")).get().filter(v => /node_modules/.test(v)).join`\n`' $(src.html))
dest += $(addprefix $(out)/ext/, $(vendor.src)) $(out)/node_modules.target

$(out)/ext/node_modules/%: node_modules/%
	@mkdir -p $(dir $@)
	cp $< $@
	@[ ! -r "$<".map ] || cp "$<".map "$@".map

$(out)/node_modules.target: package.json
	@mkdir -p $(dir $@)
	npm --offline --no-audit i
	touch $@
	@echo RESTARTING MAKE

include $(out)/node_modules.target
