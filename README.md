# easycache

* [Chrome Web Store](https://chromewebstore.google.com/detail/easycache/kcidaidcpfbkemhohngajephodacajbf)
* [.crx file](http://gromnitsky.users.sourceforge.net/js/chrome/)

A browser extension (manifest v3) to open any link or the active tab
in services like Google Cache, Bing, Wayback Machine or
archive.is. You can add another providers.

## Implementation notes from 2017

Bing support is a bit hacky. Bing has Web Search API but it doesn't
include refs to cached pages in its responses. Thus we just scrape a
regular Bing search page looking for the 1st result of the query & get
all the info we need for reconstructing a proper url.

## Compilation

	$ npm i -g json crx3-utils adieu
	$ make crx

The resulting .crx should appear in `_out` dir.

## License

MIT.
