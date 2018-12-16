# easycache

(Download the .crx file [here](http://gromnitsky.users.sourceforge.net/js/chrome/).)

Open any link or the active tab in services like Google Cache, Bing,
Wayback Machine or archive.is. Add you own providers.

Minimum supported versions:

* Chrome 71
* Firefox 60.4.0

![popup](https://ultraimg.com/images/2017/11/25/ncZ7.png)

![options](https://ultraimg.com/images/2017/11/25/ncZU.png)

![context menu](https://ultraimg.com/images/2017/11/25/ncZ8.png)

## Bing cache

Bing support is a bit hacky. Bing has Web Search API but it doesn't
include refs to cached pages in its responses. Thus we just scrape a
regular Bing search page looking for the 1st result of the query & get
all the info we need for reconstructing a proper url.

## Compilation

	$ npm i -g json
	$ make crx

The resulting .crx should appear in `_out` dir.

## License

MIT.
