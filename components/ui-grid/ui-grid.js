window.UIGrid = window.UIGrid || {
	Column: function(index, x) {
		this.index = index;
		this.height = 0;
		this.x = x;
		this.items = [];
		this.gaps = [];

		this.add = function(item, position) {
			this.items.push(item);

			if (position === true) {
				item.setPosition(this.x, this.height);
			} else if (item.y > this.height) {
				this.addGap(item);
			}

			this.height += item.height;
		};

		this.addGap = function(item) {
			this.gaps.push({
				y: this.height,
				height: item.height
			});
		};

		this.findGap = function(item) {
			for (var i = 0, gap; i < this.gaps.length; i++) {
				gap = this.gaps[i];

				if (gap.height === item.height) {
					return gap;
				}
			}
			return false;
		};

		this.addToGap = function(gap, item) {
			item.setPosition(this.x, gap.y);
			this.height += item.height;

			var index = this.gaps.indexOf(gap);
			if (index > -1) {
				this.gaps.splice(index, 1);
			}
		};
	},
	
	Item: function(element) {
		element.style.width = null;
		
		this.element = element;
		this.x = 0;
		this.y = 0;
		this.isPositioned = false;
		this.width = element.clientWidth;
		this.height = element.clientHeight;
		this.rowSpan = 1;
		this.columnSpan = 1;

		this.setPosition = function(x, y) {
			
			this.x = x;
			this.y = y;
			this.isPositioned = true;

			this.element.style.position = "absolute";
			this.element.style.top = this.y +"px";
			this.element.style.left = this.x +"px";
			this.element.style.width = this.width +"px";
		};
	},
	
	Grid: function(container, nodes) {
		this.container = container;
		this.nodes = nodes;
		this.items = [];
		this.columns = [];
		this.rowHeight;
		this.columnWidth;

		this._init = function() {
			var i, 
				item, 
				totalHeight = 0,
				nodes = Array.prototype.slice.call(this.nodes);

			for (i = 0; i < nodes.length; i++) {
				item = new UIGrid.Item(nodes[i]);

				if (!this.columnWidth || item.width < this.columnWidth) {
					this.columnWidth = item.width;
				}

				if (!this.rowHeight || item.height < this.rowHeight) {
					this.rowHeight = item.height;
				}

				totalHeight += item.height;
				this.items.push(item);
			}

			var columnCount = Math.round(this.container.clientWidth / this.columnWidth);

			for (i = 0; i < columnCount; i++) {
				this.columns.push(new UIGrid.Column(i, i*this.columnWidth));
			}
			for (i = 0; i < this.items.length; i++) {
				item = this.items[i];
				item.columnSpan = Math.ceil(item.width / this.columnWidth);
				item.rowSpan = Math.ceil(item.height / this.rowHeight);
			}
		};

		this._reset = function() {
			this.items = [];
			this.columns = [];
			this.rowHeight = null;
			this.columnWidth = null;
		};

		this.process = function() {
			this._reset();
			this._init();

			var i, item, totalHeight = 0;
			for (i = 0; i < this.items.length; i++) {
				item = this.items[i];
				this.processItem(item);

				if (item.height + item.y > totalHeight) {
					totalHeight = item.height + item.y;
				}
			}
			
			this.container.style.height = totalHeight +"px";
		};

		this.processItem = function(item, startIndex) {
			startIndex = startIndex || 0;

			var i = startIndex,
				column,
				shortest = this.columns[i],
				gap;

			if (!shortest) { return; }

			while (i < this.columns.length) {
				column = this.columns[i];

				if (gap = column.findGap(item)) {
					column.addToGap(gap, item);
					return;
				}

				if (column.height < shortest.height && !this.hasCollision(column, item)) {
					shortest = column;
				}

				i++;
			}

			if (this.hasCollision(shortest, item)) {
				this.processItem(item, startIndex + 1);
			} else {
				for (i = shortest.index; i < shortest.index + item.columnSpan; i++) {
					this.columns[i].add(item, shortest.index === i);
				}
			}
		};

		this.hasCollision = function(column, item) {
			var i, compare;

			if (column) {
				for (i = column.index; i < column.index + item.columnSpan; i++) {
					compare = this.columns[i];

					if (!compare || compare.height > column.height) {
						return true;
					}
				}
			}

			return false;
		};
	}
};