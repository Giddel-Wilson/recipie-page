
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Content.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\Content.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let p0;
    	let t4;
    	let ul0;
    	let h5;
    	let t6;
    	let li0;
    	let span0;
    	let t8;
    	let t9;
    	let li1;
    	let span1;
    	let t11;
    	let t12;
    	let li2;
    	let span2;
    	let t14;
    	let t15;
    	let ul1;
    	let h40;
    	let t17;
    	let li3;
    	let t19;
    	let li4;
    	let t21;
    	let li5;
    	let t23;
    	let li6;
    	let t25;
    	let li7;
    	let t27;
    	let ol;
    	let h41;
    	let t29;
    	let li8;
    	let span3;
    	let t31;
    	let t32;
    	let li9;
    	let span4;
    	let t34;
    	let t35;
    	let li10;
    	let span5;
    	let t37;
    	let t38;
    	let li11;
    	let span6;
    	let t40;
    	let t41;
    	let li12;
    	let span7;
    	let t43;
    	let t44;
    	let li13;
    	let span8;
    	let t46;
    	let t47;
    	let h42;
    	let t49;
    	let p1;
    	let t51;
    	let table;
    	let tr0;
    	let td0;
    	let t53;
    	let td1;
    	let t55;
    	let tr1;
    	let td2;
    	let t57;
    	let td3;
    	let t59;
    	let tr2;
    	let td4;
    	let t61;
    	let td5;
    	let t63;
    	let tr3;
    	let td6;
    	let t65;
    	let td7;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Simple Omelette Recipe";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "An easy and quick dish, perfect for any meal. This classic omelette\r\n      combines beaten eggs cooked to perfection, optionally filled with your\r\n      choice of cheese, vegetables, or meats.";
    			t4 = space();
    			ul0 = element("ul");
    			h5 = element("h5");
    			h5.textContent = "Preparation time";
    			t6 = space();
    			li0 = element("li");
    			span0 = element("span");
    			span0.textContent = "Total:";
    			t8 = text(" Approximately 10 minutes");
    			t9 = space();
    			li1 = element("li");
    			span1 = element("span");
    			span1.textContent = "Preparation:";
    			t11 = text(" 5 minutes");
    			t12 = space();
    			li2 = element("li");
    			span2 = element("span");
    			span2.textContent = "Cooking:";
    			t14 = text(" 5 minutes");
    			t15 = space();
    			ul1 = element("ul");
    			h40 = element("h4");
    			h40.textContent = "Ingredients";
    			t17 = space();
    			li3 = element("li");
    			li3.textContent = "2-3 large eggs";
    			t19 = space();
    			li4 = element("li");
    			li4.textContent = "Salt, to taste";
    			t21 = space();
    			li5 = element("li");
    			li5.textContent = "Pepper, to taste";
    			t23 = space();
    			li6 = element("li");
    			li6.textContent = "1 tablespoon of butter or oil";
    			t25 = space();
    			li7 = element("li");
    			li7.textContent = "Optional fillings: cheese, diced vegetables, cooked meats, herbs";
    			t27 = space();
    			ol = element("ol");
    			h41 = element("h4");
    			h41.textContent = "Instructions";
    			t29 = space();
    			li8 = element("li");
    			span3 = element("span");
    			span3.textContent = "Beat the eggs:";
    			t31 = text(" In a bowl, beat the eggs with a\r\n        pinch of salt and pepper until they are well mixed. You can add a tablespoon\r\n        of water or milk for a fluffier texture.");
    			t32 = space();
    			li9 = element("li");
    			span4 = element("span");
    			span4.textContent = "Heat the pan:";
    			t34 = text(" Place a non-stick frying pan over\r\n        medium heat and add butter or oil.");
    			t35 = space();
    			li10 = element("li");
    			span5 = element("span");
    			span5.textContent = "Cook the omelette:";
    			t37 = text(" Once the butter is melted and\r\n        bubbling, pour in the eggs. Tilt the pan to ensure the eggs evenly coat the\r\n        surface.");
    			t38 = space();
    			li11 = element("li");
    			span6 = element("span");
    			span6.textContent = "Add fillings (optional):";
    			t40 = text(" When the eggs begin to\r\n        set at the edges but are still slightly runny in the middle, sprinkle your\r\n        chosen fillings over one half of the omelette.");
    			t41 = space();
    			li12 = element("li");
    			span7 = element("span");
    			span7.textContent = "Fold and serve:";
    			t43 = text(" As the omelette continues to cook,\r\n        carefully lift one edge and fold it over the fillings. Let it cook for another\r\n        minute, then slide it onto a plate.");
    			t44 = space();
    			li13 = element("li");
    			span8 = element("span");
    			span8.textContent = "Enjoy:";
    			t46 = text(" Serve hot, with additional salt and pepper\r\n        if needed.");
    			t47 = space();
    			h42 = element("h4");
    			h42.textContent = "Nutrition";
    			t49 = space();
    			p1 = element("p");
    			p1.textContent = "The table below shows nutritional values per serving without the\r\n      additional fillings.";
    			t51 = space();
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Calories";
    			t53 = space();
    			td1 = element("td");
    			td1.textContent = "277kcal";
    			t55 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Carbs";
    			t57 = space();
    			td3 = element("td");
    			td3.textContent = "0g";
    			t59 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Protein";
    			t61 = space();
    			td5 = element("td");
    			td5.textContent = "20g";
    			t63 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Fat";
    			t65 = space();
    			td7 = element("td");
    			td7.textContent = "22g";
    			if (!src_url_equal(img.src, img_src_value = "./omelette.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "img svelte-17nrca2");
    			add_location(img, file$2, 5, 4, 44);
    			add_location(div0, file$2, 4, 2, 33);
    			attr_dev(h2, "class", "svelte-17nrca2");
    			add_location(h2, file$2, 8, 4, 129);
    			attr_dev(p0, "class", "firstParagraph svelte-17nrca2");
    			add_location(p0, file$2, 10, 4, 168);
    			attr_dev(h5, "class", "svelte-17nrca2");
    			add_location(h5, file$2, 17, 6, 439);
    			attr_dev(span0, "class", "bold svelte-17nrca2");
    			add_location(span0, file$2, 18, 10, 476);
    			attr_dev(li0, "class", "svelte-17nrca2");
    			add_location(li0, file$2, 18, 6, 472);
    			attr_dev(span1, "class", "bold svelte-17nrca2");
    			add_location(span1, file$2, 19, 10, 550);
    			attr_dev(li1, "class", "svelte-17nrca2");
    			add_location(li1, file$2, 19, 6, 546);
    			attr_dev(span2, "class", "bold svelte-17nrca2");
    			add_location(span2, file$2, 20, 10, 615);
    			attr_dev(li2, "class", "svelte-17nrca2");
    			add_location(li2, file$2, 20, 6, 611);
    			attr_dev(ul0, "class", "prepUL svelte-17nrca2");
    			add_location(ul0, file$2, 16, 4, 412);
    			attr_dev(h40, "class", "svelte-17nrca2");
    			add_location(h40, file$2, 24, 6, 695);
    			attr_dev(li3, "class", "svelte-17nrca2");
    			add_location(li3, file$2, 25, 6, 723);
    			attr_dev(li4, "class", "svelte-17nrca2");
    			add_location(li4, file$2, 26, 6, 754);
    			attr_dev(li5, "class", "svelte-17nrca2");
    			add_location(li5, file$2, 27, 6, 785);
    			attr_dev(li6, "class", "svelte-17nrca2");
    			add_location(li6, file$2, 28, 6, 818);
    			attr_dev(li7, "class", "svelte-17nrca2");
    			add_location(li7, file$2, 29, 6, 864);
    			attr_dev(ul1, "class", "svelte-17nrca2");
    			add_location(ul1, file$2, 23, 4, 683);
    			attr_dev(h41, "class", "svelte-17nrca2");
    			add_location(h41, file$2, 33, 6, 968);
    			attr_dev(span3, "class", "bold svelte-17nrca2");
    			add_location(span3, file$2, 35, 8, 1011);
    			attr_dev(li8, "class", "svelte-17nrca2");
    			add_location(li8, file$2, 34, 6, 997);
    			attr_dev(span4, "class", "bold svelte-17nrca2");
    			add_location(span4, file$2, 40, 8, 1254);
    			attr_dev(li9, "class", "svelte-17nrca2");
    			add_location(li9, file$2, 39, 6, 1240);
    			attr_dev(span5, "class", "bold svelte-17nrca2");
    			add_location(span5, file$2, 44, 8, 1406);
    			attr_dev(li10, "class", "svelte-17nrca2");
    			add_location(li10, file$2, 43, 6, 1392);
    			attr_dev(span6, "class", "bold svelte-17nrca2");
    			add_location(span6, file$2, 49, 8, 1618);
    			attr_dev(li11, "class", "svelte-17nrca2");
    			add_location(li11, file$2, 48, 6, 1604);
    			attr_dev(span7, "class", "bold svelte-17nrca2");
    			add_location(span7, file$2, 54, 8, 1866);
    			attr_dev(li12, "class", "svelte-17nrca2");
    			add_location(li12, file$2, 53, 6, 1852);
    			attr_dev(span8, "class", "bold svelte-17nrca2");
    			add_location(span8, file$2, 59, 8, 2110);
    			attr_dev(li13, "class", "svelte-17nrca2");
    			add_location(li13, file$2, 58, 6, 2096);
    			attr_dev(ol, "class", "svelte-17nrca2");
    			add_location(ol, file$2, 32, 4, 956);
    			attr_dev(h42, "class", "svelte-17nrca2");
    			add_location(h42, file$2, 64, 4, 2237);
    			attr_dev(p1, "class", "svelte-17nrca2");
    			add_location(p1, file$2, 65, 4, 2261);
    			attr_dev(td0, "class", "svelte-17nrca2");
    			add_location(td0, file$2, 71, 8, 2409);
    			attr_dev(td1, "class", "svelte-17nrca2");
    			add_location(td1, file$2, 72, 8, 2436);
    			attr_dev(tr0, "class", "svelte-17nrca2");
    			add_location(tr0, file$2, 70, 6, 2395);
    			attr_dev(td2, "class", "svelte-17nrca2");
    			add_location(td2, file$2, 75, 8, 2487);
    			attr_dev(td3, "class", "svelte-17nrca2");
    			add_location(td3, file$2, 76, 8, 2511);
    			attr_dev(tr1, "class", "svelte-17nrca2");
    			add_location(tr1, file$2, 74, 6, 2473);
    			attr_dev(td4, "class", "svelte-17nrca2");
    			add_location(td4, file$2, 79, 8, 2557);
    			attr_dev(td5, "class", "svelte-17nrca2");
    			add_location(td5, file$2, 80, 8, 2583);
    			attr_dev(tr2, "class", "svelte-17nrca2");
    			add_location(tr2, file$2, 78, 6, 2543);
    			attr_dev(td6, "class", "svelte-17nrca2");
    			add_location(td6, file$2, 83, 8, 2630);
    			attr_dev(td7, "class", "svelte-17nrca2");
    			add_location(td7, file$2, 84, 8, 2652);
    			attr_dev(tr3, "class", "svelte-17nrca2");
    			add_location(tr3, file$2, 82, 6, 2616);
    			attr_dev(table, "class", "svelte-17nrca2");
    			add_location(table, file$2, 69, 4, 2380);
    			attr_dev(div1, "class", "pad svelte-17nrca2");
    			add_location(div1, file$2, 7, 2, 106);
    			attr_dev(main, "class", "svelte-17nrca2");
    			add_location(main, file$2, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, ul0);
    			append_dev(ul0, h5);
    			append_dev(ul0, t6);
    			append_dev(ul0, li0);
    			append_dev(li0, span0);
    			append_dev(li0, t8);
    			append_dev(ul0, t9);
    			append_dev(ul0, li1);
    			append_dev(li1, span1);
    			append_dev(li1, t11);
    			append_dev(ul0, t12);
    			append_dev(ul0, li2);
    			append_dev(li2, span2);
    			append_dev(li2, t14);
    			append_dev(div1, t15);
    			append_dev(div1, ul1);
    			append_dev(ul1, h40);
    			append_dev(ul1, t17);
    			append_dev(ul1, li3);
    			append_dev(ul1, t19);
    			append_dev(ul1, li4);
    			append_dev(ul1, t21);
    			append_dev(ul1, li5);
    			append_dev(ul1, t23);
    			append_dev(ul1, li6);
    			append_dev(ul1, t25);
    			append_dev(ul1, li7);
    			append_dev(div1, t27);
    			append_dev(div1, ol);
    			append_dev(ol, h41);
    			append_dev(ol, t29);
    			append_dev(ol, li8);
    			append_dev(li8, span3);
    			append_dev(li8, t31);
    			append_dev(ol, t32);
    			append_dev(ol, li9);
    			append_dev(li9, span4);
    			append_dev(li9, t34);
    			append_dev(ol, t35);
    			append_dev(ol, li10);
    			append_dev(li10, span5);
    			append_dev(li10, t37);
    			append_dev(ol, t38);
    			append_dev(ol, li11);
    			append_dev(li11, span6);
    			append_dev(li11, t40);
    			append_dev(ol, t41);
    			append_dev(ol, li12);
    			append_dev(li12, span7);
    			append_dev(li12, t43);
    			append_dev(ol, t44);
    			append_dev(ol, li13);
    			append_dev(li13, span8);
    			append_dev(li13, t46);
    			append_dev(div1, t47);
    			append_dev(div1, h42);
    			append_dev(div1, t49);
    			append_dev(div1, p1);
    			append_dev(div1, t51);
    			append_dev(div1, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t53);
    			append_dev(tr0, td1);
    			append_dev(table, t55);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t57);
    			append_dev(tr1, td3);
    			append_dev(table, t59);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t61);
    			append_dev(tr2, td5);
    			append_dev(table, t63);
    			append_dev(table, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t65);
    			append_dev(tr3, td7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Card.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\Card.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let div;
    	let content;
    	let current;
    	content = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(content.$$.fragment);
    			attr_dev(div, "class", "cardBody svelte-cebj5o");
    			add_location(div, file$1, 5, 2, 76);
    			add_location(main, file$1, 4, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(content, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(content);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Content });
    	return [];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let card;
    	let current;
    	card = new Card({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(card.$$.fragment);
    			attr_dev(main, "class", "svelte-17ekktw");
    			add_location(main, file, 4, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(card, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Card });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
