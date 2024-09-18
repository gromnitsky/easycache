# make crx
# watchthis.sound -e src/flycheck_\* -e _out -- make browser=firefox

all:

include extensions.mk

src.html := src/options.html
include npm.mk

all: $(dest)
