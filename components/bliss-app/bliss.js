var Bliss = (function() {
	var _pageTitle = "";
			
	return function(root) {
		this.root = root;
		this.config = null;
		this.loaded = false;
		this.pages = [];
		this.activePage = {};

		this.setConfig = function(config) {
			this.config = config;
			this.loaded = true;
		};

		this.setPageTitle = function(title, replace) {
			var parts = [];

			if (!replace) {
				parts.push(this.config.name);
			}
			
			if (title) {
				parts.push(title);
			}
			
			_pageTitle = parts.join(" - ");

			var titleEl = document.head.querySelector("title");
			if (titleEl) {
				titleEl.innerText = _pageTitle;
			}
		};
	};
})();