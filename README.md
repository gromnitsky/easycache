# easycache

* [Chrome Web Store](https://chromewebstore.google.com/detail/easycache/kcidaidcpfbkemhohngajephodacajbf)
* [.crx file](http://gromnitsky.users.sourceforge.net/js/chrome/)

A browser extension (manifest v3) that serves as an interface to
various web caches or archivers (Google, Bing, Wayback Machine,
archive.is). You can add another providers.

## Compilation

	$ npm i -g adieu
    $ sudo dnf install jq jsonnet
	$ make crx

The resulting .crx should appear in `_out` dir.

## Implementation notes

Bing support is a bit hacky. Bing has Web Search API but it doesn't
include refs to cached pages in its responses. Thus we just scrape a
regular Bing search page looking for the 1st result of the query & get
all the info we need for reconstructing a proper url.

## License

MIT.
