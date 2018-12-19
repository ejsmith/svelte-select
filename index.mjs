function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations, detach) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detach);
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler, options) {
	node.addEventListener(event, handler, options);
}

function removeListener(node, event, handler, options) {
	node.removeEventListener(event, handler, options);
}

function setData(text, data) {
	text.data = '' + data;
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = noop;

	this._fragment.d(detach !== false);
	this._fragment = null;
	this._state = {};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			try {
				handler.__calling = true;
				handler.call(this, data);
			} finally {
				handler.__calling = false;
			}
		}
	}
}

function flush(component) {
	component._lock = true;
	callAll(component._beforecreate);
	callAll(component._oncreate);
	callAll(component._aftercreate);
	component._lock = false;
}

function get() {
	return this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._slots = blankObject();
	component._bind = options._bind;
	component._staged = {};

	component.options = options;
	component.root = options.root || component;
	component.store = options.store || component.root.store;

	if (!options.root) {
		component._beforecreate = [];
		component._oncreate = [];
		component._aftercreate = [];
	}
}

function on(eventName, handler) {
	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	flush(this.root);
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	newState = assign(this._staged, newState);
	this._staged = {};

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function _stage(newState) {
	assign(this._staged, newState);
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

var proto = {
	destroy,
	get,
	fire,
	on,
	set,
	_recompute: noop,
	_set,
	_stage,
	_mount,
	_differs
};

/* src/Item.html generated by Svelte v2.15.3 */

function create_main_fragment(component, ctx) {
	var text_value = ctx.item.name, text;

	return {
		c() {
			text = createText(text_value);
		},

		m(target, anchor) {
			insert(target, text, anchor);
		},

		p(changed, ctx) {
			if ((changed.item) && text_value !== (text_value = ctx.item.name)) {
				setData(text, text_value);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function Item(options) {
	init(this, options);
	this._state = assign({}, options.data);
	this._intro = true;

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Item.prototype, proto);

/* src/List.html generated by Svelte v2.15.3 */

function data() {
  return {
    hoverItemIndex: 0,
    activeItemIndex: undefined,
    items: [],
    Item,
    disableMouseHover: false
  }
}
function itemClasses(activeItemIndex, hoverItemIndex, item, itemIndex) {
  return `${activeItemIndex === item.index ? 'active ' : ''}${hoverItemIndex === itemIndex ? 'hover' : ''}`;
}
var methods = {
  handleSelect(item) {
    delete item.index;
    this.fire('itemSelected', item);
  },
  handleHover(item) {
    const {disableMouseHover} = this.get();
    if (!disableMouseHover) {
      this.set({hoverItemIndex: item.index});
    } else {
      this.set({disableMouseHover: false});
    }
  },
  handleClick(item, event) {
    event.stopPropagation();
    this.set({activeItemIndex: item.index, hoverItemIndex: item.index});
    this.handleSelect(item);
  },
  updateHoverItem(increment) {
    let {items, hoverItemIndex} = this.get();

    if (increment > 0 && hoverItemIndex === (items.length - 1)) {
      hoverItemIndex = 0;
    }
    else if (increment < 0 && hoverItemIndex === 0) {
      hoverItemIndex = items.length - 1;
    }
    else {
      hoverItemIndex = hoverItemIndex + increment;
    }

    this.set({items, hoverItemIndex});
  },
  handleKeyDown(e) {
    const {items, hoverItemIndex} = this.get();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.updateHoverItem(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.updateHoverItem(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this.set({activeItemIndex: hoverItemIndex});
        this.handleSelect(items[hoverItemIndex]);
        break;
      case 'Tab':
        e.preventDefault();
        this.set({activeItemIndex: hoverItemIndex});
        this.handleSelect(items[hoverItemIndex]);
        break;
    }
  },
  scrollToActiveItem(className) {
    this.set({disableMouseHover: true});
    const {container} = this.refs;
    let offsetBounding;
    const focusedElemBounding = container.querySelector(`.listItem.${className}`);
    if (focusedElemBounding) {
      offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    }
    container.scrollTop -= offsetBounding;
  }
};

function onupdate({changed, current, previous}) {
  if (changed.items && current.items.length > 0) {
    this.scrollToActiveItem('hover');
  }
  if (changed.activeItemIndex && current.activeItemIndex > -1) {
    this.scrollToActiveItem('active');
    this.set({
      hoverItemIndex: current.activeItemIndex,
    });
  }

}
function add_css() {
	var style = createElement("style");
	style.id = 'svelte-1y5hj7n-style';
	style.textContent = ".listContainer.svelte-1y5hj7n{box-shadow:0 2px 3px 0 rgba(44, 62, 80, 0.24);border-radius:4px;max-height:250px;overflow-y:auto;background:#fff}.listItem.svelte-1y5hj7n{height:40px;line-height:40px;padding:0 20px}.listItem.hover.svelte-1y5hj7n{background:#e7f2ff}.listItem.svelte-1y5hj7n:active{background:#b9daff}.listItem.svelte-1y5hj7n:first-child{border-radius:4px 4px 0 0}.listItem.active.svelte-1y5hj7n{background:#007aff;color:#fff}.empty.svelte-1y5hj7n{text-align:center;padding:20px 0;color:#78848F}";
	append(document.head, style);
}

function click_handler(event) {
	const { component, ctx } = this._svelte;

	component.handleClick(ctx.item, event);
}

function mouseover_handler(event) {
	const { component, ctx } = this._svelte;

	component.handleHover(ctx.item);
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.item = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function create_main_fragment$1(component, ctx) {
	var div;

	function onwindowkeydown(event) {
		component.handleKeyDown(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	var each_value = ctx.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	}

	var each_else = null;

	if (!each_value.length) {
		each_else = create_else_block(component, ctx);
		each_else.c();
	}

	return {
		c() {
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			div.className = "listContainer svelte-1y5hj7n";
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			if (each_else) {
				each_else.m(div, null);
			}

			component.refs.container = div;
		},

		p(changed, ctx) {
			if (changed.activeItemIndex || changed.hoverItemIndex || changed.items || changed.Item) {
				each_value = ctx.items;

				for (var i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (each_value.length) {
				if (each_else) {
					each_else.d(1);
					each_else = null;
				}
			} else if (!each_else) {
				each_else = create_else_block(component, ctx);
				each_else.c();
				each_else.m(div, null);
			}
		},

		d(detach) {
			window.removeEventListener("keydown", onwindowkeydown);

			if (detach) {
				detachNode(div);
			}

			destroyEach(each_blocks, detach);

			if (each_else) each_else.d();

			if (component.refs.container === div) component.refs.container = null;
		}
	};
}

// (9:4) {:else}
function create_else_block(component, ctx) {
	var div;

	return {
		c() {
			div = createElement("div");
			div.textContent = "No options";
			div.className = "empty svelte-1y5hj7n";
		},

		m(target, anchor) {
			insert(target, div, anchor);
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (4:4) {#each items as item, i}
function create_each_block(component, ctx) {
	var div, text, div_class_value;

	var switch_value = ctx.Item;

	function switch_props(ctx) {
		var switch_instance_initial_data = { item: ctx.item };
		return {
			root: component.root,
			store: component.store,
			data: switch_instance_initial_data
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			div = createElement("div");
			if (switch_instance) switch_instance._fragment.c();
			text = createText("\n    ");
			div._svelte = { component, ctx };

			addListener(div, "mouseover", mouseover_handler);
			addListener(div, "click", click_handler);
			div.className = div_class_value = "listItem " + itemClasses(ctx.activeItemIndex, ctx.hoverItemIndex, ctx.item, ctx.i) + " svelte-1y5hj7n";
		},

		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				switch_instance._mount(div, null);
			}

			append(div, text);
		},

		p(changed, _ctx) {
			ctx = _ctx;
			var switch_instance_changes = {};
			if (changed.items) switch_instance_changes.item = ctx.item;

			if (switch_value !== (switch_value = ctx.Item)) {
				if (switch_instance) {
					switch_instance.destroy();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div, text);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
			}

			div._svelte.ctx = ctx;
			if ((changed.activeItemIndex || changed.hoverItemIndex || changed.items) && div_class_value !== (div_class_value = "listItem " + itemClasses(ctx.activeItemIndex, ctx.hoverItemIndex, ctx.item, ctx.i) + " svelte-1y5hj7n")) {
				div.className = div_class_value;
			}
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}

			if (switch_instance) switch_instance.destroy();
			removeListener(div, "mouseover", mouseover_handler);
			removeListener(div, "click", click_handler);
		}
	};
}

function List(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	this._intro = true;
	this._handlers.update = [onupdate];

	if (!document.getElementById("svelte-1y5hj7n-style")) add_css();

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(() => {
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}
}

assign(List.prototype, proto);
assign(List.prototype, methods);

/* src/Selection.html generated by Svelte v2.15.3 */

function create_main_fragment$2(component, ctx) {
	var text_value = ctx.selectedItem.name, text;

	return {
		c() {
			text = createText(text_value);
		},

		m(target, anchor) {
			insert(target, text, anchor);
		},

		p(changed, ctx) {
			if ((changed.selectedItem) && text_value !== (text_value = ctx.selectedItem.name)) {
				setData(text, text_value);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function Selection(options) {
	init(this, options);
	this._state = assign({}, options.data);
	this._intro = true;

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Selection.prototype, proto);

/* src/Select.html generated by Svelte v2.15.3 */



let list;
let target;

function showSelectedItem({selectedItem, filterText}) {
  return selectedItem && filterText.length === 0;
}
function placeholderText({selectedItem}) {
  return selectedItem ? '' : 'Select...'
}
function filteredItems({items, filterText}) {
  const itemsWithIndex = items.map((item, i) => {
    return Object.assign(item, {
      index: i
    })
  });
  return itemsWithIndex.filter(item => {
    if (filterText.length < 1) return true;
    return item.name.toLowerCase().includes(filterText.toLowerCase())
  })
}
function data$1() {
  return {
    items: [],
    filterText: '',
    listOpen: false,
    Item,
    Selection,
    paddingLeft: 0
  }
}
var methods$1 = {
  getPosition() {
    if (!target) return;
    const {top, height, width} = this.refs.container.getBoundingClientRect();
    target.style.top = `${height + 5}px`;
    target.style.minWidth = `${width}px`;
    target.style.left = '0';
  },
  handleKeyDown(e) {
    const {isFocused} = this.get();
    if (!isFocused) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.set({listOpen: true});
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.set({listOpen: true});
        break;
      case 'Tab':
        e.preventDefault();
        this.set({listOpen: true});
        break;
    }
  },
  handleFocus() {
    this.set({isFocused: true});
    if (this.refs.input) this.refs.input.focus();
  },
  removeList() {
    this.set({filterText: ''});

    if (!list) return;
    list.destroy();
    list = undefined;

    if (!target) return;
    target.remove();
    target = undefined;
  },
  handleWindowClick(event) {
    if (this.refs.container.contains(event.target)) return;
    this.set({isFocused: false, listOpen: false});
    if (this.refs.input) this.refs.input.blur();
  },
  handleClick(event) {
    event.stopPropagation();
    const {isDisabled, listOpen} = this.get();
    if (isDisabled) return;
    this.set({isFocused: true, listOpen: !listOpen});
  },
  handleClear(e) {
    e.stopPropagation();
    this.set({selectedItem: undefined, listOpen: false});
    this.handleFocus();
  },
  loadList() {
    if (target && list) return;

    if (this.refs.selectedItem) this.refs.selectedItem.removeAttribute('tabindex');
    target = document.createElement('div');

    Object.assign(target.style, {
      position: 'absolute',
      'z-index': 2
    });

    this.getPosition();
    this.refs.container.appendChild(target);
    list = new List({
      target,
      data: {
        Item: this.get().Item
      }
    });

    const {items, selectedItem, filteredItems} = this.get();

    if (items) {
      const match = JSON.stringify(selectedItem);
      const activeItemIndex = items.findIndex(item => JSON.stringify(item) === match);
      list.set({items: filteredItems, activeItemIndex});
    }

    list.on('itemSelected', (newSelection) => {
      if (newSelection) {
        this.set({
          selectedItem: Object.assign({}, selectedItem, newSelection),
          listOpen: false
        });
        if (this.get().showSelectedItem)
          this.refs.selectedItem.setAttribute('tabindex', '0');
      }
    });
  }
};

function oncreate() {
  const {listOpen} = this.get();
  if (listOpen) this.loadList();
}
function ondestroy() {
  this.removeList();
}
function onstate({changed, current, previous}) {
  if (!previous) return;

  if (changed.listOpen) {
    if (current.listOpen) {
      this.loadList();
    } else {
      this.removeList();
    }
  }

  if (changed.filterText && current.filterText.length === 1) {
    this.loadList();
    this.set({listOpen: true});
  }

  if (changed.isFocused) {
    const {isFocused} = current;
    if (isFocused) {
      this.handleFocus();
    } else {
      this.set({filterText: ''});
    }
  }

  if (changed.filteredItems && list) {
    list.set({items: current.filteredItems});
  }
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-xv2d79-style';
	style.textContent = ".selectContainer.svelte-xv2d79{border:1px solid #D8DBDF;border-radius:3px;height:44px;position:relative;padding:0 16px}.selectContainer.svelte-xv2d79 input.svelte-xv2d79{border:none;color:#3F4F5F;height:44px;line-height:44px;padding:0 16px;width:100%;background:transparent;font-size:14px;letter-spacing:-0.08px;position:absolute;left:0}.selectContainer.svelte-xv2d79 input.svelte-xv2d79::placeholder{color:#78848F}.selectContainer.svelte-xv2d79 input.svelte-xv2d79:focus{outline:none}.selectContainer.svelte-xv2d79:hover{border-color:#b2b8bf}.selectContainer.focused.svelte-xv2d79{border-color:#006FE8}.selectContainer.disabled.svelte-xv2d79{background:#F6F7F8;border-color:#F6F7F8;color:#C1C6CC}.selectContainer.disabled.svelte-xv2d79 input.svelte-xv2d79::placeholder{color:#C1C6CC}.selectedItem.svelte-xv2d79{line-height:44px}.selectedItem.svelte-xv2d79:focus{outline:none}.clearSelectedItem.svelte-xv2d79{position:absolute;right:10px;top:12px;width:20px;height:20px;color:#c5cacf}.clearSelectedItem.svelte-xv2d79:hover{color:#2c3e50}.selectContainer.focused.svelte-xv2d79 .clearSelectedItem.svelte-xv2d79{color:#3F4F5F}";
	append(document.head, style);
}

function create_main_fragment$3(component, ctx) {
	var div, input, input_updating = false, text, div_class_value;

	function onwindowclick(event) {
		component.handleWindowClick(event);	}
	window.addEventListener("click", onwindowclick);

	function onwindowkeydown(event) {
		component.handleKeyDown(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	function onwindowresize(event) {
		component.getPosition();	}
	window.addEventListener("resize", onwindowresize);

	function input_input_handler() {
		input_updating = true;
		component.set({ filterText: input.value });
		input_updating = false;
	}

	function focus_handler(event) {
		component.handleFocus();
	}

	var if_block = (ctx.showSelectedItem) && create_if_block(component, ctx);

	function click_handler(event) {
		component.handleClick(event);
	}

	return {
		c() {
			div = createElement("div");
			input = createElement("input");
			text = createText("\n\n    ");
			if (if_block) if_block.c();
			addListener(input, "input", input_input_handler);
			addListener(input, "focus", focus_handler);
			input.placeholder = ctx.placeholderText;
			input.disabled = ctx.isDisabled;
			input.style.cssText = ctx.inputStyles;
			input.className = "svelte-xv2d79";
			addListener(div, "click", click_handler);
			div.className = div_class_value = "selectContainer " + (ctx.isDisabled ? 'disabled' : '') + (ctx.isFocused ? 'focused' : '') + " svelte-xv2d79";
			div.style.cssText = ctx.containerStyles;
		},

		m(target_1, anchor) {
			insert(target_1, div, anchor);
			append(div, input);
			component.refs.input = input;

			input.value = ctx.filterText;

			append(div, text);
			if (if_block) if_block.m(div, null);
			component.refs.container = div;
		},

		p(changed, ctx) {
			if (!input_updating && changed.filterText) input.value = ctx.filterText;
			if (changed.placeholderText) {
				input.placeholder = ctx.placeholderText;
			}

			if (changed.isDisabled) {
				input.disabled = ctx.isDisabled;
			}

			if (changed.inputStyles) {
				input.style.cssText = ctx.inputStyles;
			}

			if (ctx.showSelectedItem) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((changed.isDisabled || changed.isFocused) && div_class_value !== (div_class_value = "selectContainer " + (ctx.isDisabled ? 'disabled' : '') + (ctx.isFocused ? 'focused' : '') + " svelte-xv2d79")) {
				div.className = div_class_value;
			}

			if (changed.containerStyles) {
				div.style.cssText = ctx.containerStyles;
			}
		},

		d(detach) {
			window.removeEventListener("click", onwindowclick);

			window.removeEventListener("keydown", onwindowkeydown);

			window.removeEventListener("resize", onwindowresize);

			if (detach) {
				detachNode(div);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "focus", focus_handler);
			if (component.refs.input === input) component.refs.input = null;
			if (if_block) if_block.d();
			removeListener(div, "click", click_handler);
			if (component.refs.container === div) component.refs.container = null;
		}
	};
}

// (8:4) {#if showSelectedItem }
function create_if_block(component, ctx) {
	var div0, text, div1;

	var switch_value = ctx.Selection;

	function switch_props(ctx) {
		var switch_instance_initial_data = { selectedItem: ctx.selectedItem };
		return {
			root: component.root,
			store: component.store,
			data: switch_instance_initial_data
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	function focus_handler(event) {
		component.handleFocus();
	}

	function click_handler(event) {
		component.handleClear(event);
	}

	return {
		c() {
			div0 = createElement("div");
			if (switch_instance) switch_instance._fragment.c();
			text = createText("\n    ");
			div1 = createElement("div");
			div1.innerHTML = `<svg class="icon svelte-qw6fkp" width="100%" height="100%" viewBox="-2 -2 50 50" focusable="false" role="presentation"><path fill="currentColor" d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"></path></svg>`;
			addListener(div0, "focus", focus_handler);
			div0.className = "selectedItem svelte-xv2d79";
			addListener(div1, "click", click_handler);
			div1.className = "clearSelectedItem svelte-xv2d79";
		},

		m(target_1, anchor) {
			insert(target_1, div0, anchor);

			if (switch_instance) {
				switch_instance._mount(div0, null);
			}

			component.refs.selectedItem = div0;
			insert(target_1, text, anchor);
			insert(target_1, div1, anchor);
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.selectedItem) switch_instance_changes.selectedItem = ctx.selectedItem;

			if (switch_value !== (switch_value = ctx.Selection)) {
				if (switch_instance) {
					switch_instance.destroy();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div0, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(div0);
			}

			if (switch_instance) switch_instance.destroy();
			removeListener(div0, "focus", focus_handler);
			if (component.refs.selectedItem === div0) component.refs.selectedItem = null;
			if (detach) {
				detachNode(text);
				detachNode(div1);
			}

			removeListener(div1, "click", click_handler);
		}
	};
}

function Select(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);

	this._recompute({ selectedItem: 1, filterText: 1, items: 1 }, this._state);
	this._intro = true;

	this._handlers.state = [onstate];

	this._handlers.destroy = [ondestroy];

	if (!document.getElementById("svelte-xv2d79-style")) add_css$1();

	onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(() => {
		oncreate.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}
}

assign(Select.prototype, proto);
assign(Select.prototype, methods$1);

Select.prototype._recompute = function _recompute(changed, state) {
	if (changed.selectedItem || changed.filterText) {
		if (this._differs(state.showSelectedItem, (state.showSelectedItem = showSelectedItem(state)))) changed.showSelectedItem = true;
	}

	if (changed.selectedItem) {
		if (this._differs(state.placeholderText, (state.placeholderText = placeholderText(state)))) changed.placeholderText = true;
	}

	if (changed.items || changed.filterText) {
		if (this._differs(state.filteredItems, (state.filteredItems = filteredItems(state)))) changed.filteredItems = true;
	}
};

export default Select;
