"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/minisearch/dist/es/index.js
var ENTRIES, KEYS, VALUES, LEAF, TreeIterator, last$1, fuzzySearch, recurse, SearchableMap, trackDown, lookup, createPath, remove, cleanup, merge, last, OR, AND, AND_NOT, MiniSearch, getOwnProperty, combinators, defaultBM25params, calcBM25Score, termToQuerySpec, defaultOptions, defaultSearchOptions, defaultAutoSuggestOptions, defaultVacuumOptions, defaultVacuumConditions, defaultAutoVacuumOptions, assignUniqueTerm, assignUniqueTerms, byScore, createMap, objectToNumericMap, objectToNumericMapAsync, wait, SPACE_OR_PUNCTUATION;
var init_es = __esm({
  "node_modules/minisearch/dist/es/index.js"() {
    ENTRIES = "ENTRIES";
    KEYS = "KEYS";
    VALUES = "VALUES";
    LEAF = "";
    TreeIterator = class {
      constructor(set, type) {
        const node = set._tree;
        const keys = Array.from(node.keys());
        this.set = set;
        this._type = type;
        this._path = keys.length > 0 ? [{ node, keys }] : [];
      }
      next() {
        const value = this.dive();
        this.backtrack();
        return value;
      }
      dive() {
        if (this._path.length === 0) {
          return { done: true, value: void 0 };
        }
        const { node, keys } = last$1(this._path);
        if (last$1(keys) === LEAF) {
          return { done: false, value: this.result() };
        }
        const child = node.get(last$1(keys));
        this._path.push({ node: child, keys: Array.from(child.keys()) });
        return this.dive();
      }
      backtrack() {
        if (this._path.length === 0) {
          return;
        }
        const keys = last$1(this._path).keys;
        keys.pop();
        if (keys.length > 0) {
          return;
        }
        this._path.pop();
        this.backtrack();
      }
      key() {
        return this.set._prefix + this._path.map(({ keys }) => last$1(keys)).filter((key) => key !== LEAF).join("");
      }
      value() {
        return last$1(this._path).node.get(LEAF);
      }
      result() {
        switch (this._type) {
          case VALUES:
            return this.value();
          case KEYS:
            return this.key();
          default:
            return [this.key(), this.value()];
        }
      }
      [Symbol.iterator]() {
        return this;
      }
    };
    last$1 = (array) => {
      return array[array.length - 1];
    };
    fuzzySearch = (node, query, maxDistance) => {
      const results = /* @__PURE__ */ new Map();
      if (query === void 0)
        return results;
      const n = query.length + 1;
      const m = n + maxDistance;
      const matrix = new Uint8Array(m * n).fill(maxDistance + 1);
      for (let j = 0; j < n; ++j)
        matrix[j] = j;
      for (let i = 1; i < m; ++i)
        matrix[i * n] = i;
      recurse(node, query, maxDistance, results, matrix, 1, n, "");
      return results;
    };
    recurse = (node, query, maxDistance, results, matrix, m, n, prefix) => {
      const offset = m * n;
      key: for (const key of node.keys()) {
        if (key === LEAF) {
          const distance = matrix[offset - 1];
          if (distance <= maxDistance) {
            results.set(prefix, [node.get(key), distance]);
          }
        } else {
          let i = m;
          for (let pos = 0; pos < key.length; ++pos, ++i) {
            const char = key[pos];
            const thisRowOffset = n * i;
            const prevRowOffset = thisRowOffset - n;
            let minDistance = matrix[thisRowOffset];
            const jmin = Math.max(0, i - maxDistance - 1);
            const jmax = Math.min(n - 1, i + maxDistance);
            for (let j = jmin; j < jmax; ++j) {
              const different = char !== query[j];
              const rpl = matrix[prevRowOffset + j] + +different;
              const del = matrix[prevRowOffset + j + 1] + 1;
              const ins = matrix[thisRowOffset + j] + 1;
              const dist = matrix[thisRowOffset + j + 1] = Math.min(rpl, del, ins);
              if (dist < minDistance)
                minDistance = dist;
            }
            if (minDistance > maxDistance) {
              continue key;
            }
          }
          recurse(node.get(key), query, maxDistance, results, matrix, i, n, prefix + key);
        }
      }
    };
    SearchableMap = class _SearchableMap {
      /**
       * The constructor is normally called without arguments, creating an empty
       * map. In order to create a {@link SearchableMap} from an iterable or from an
       * object, check {@link SearchableMap.from} and {@link
       * SearchableMap.fromObject}.
       *
       * The constructor arguments are for internal use, when creating derived
       * mutable views of a map at a prefix.
       */
      constructor(tree = /* @__PURE__ */ new Map(), prefix = "") {
        this._size = void 0;
        this._tree = tree;
        this._prefix = prefix;
      }
      /**
       * Creates and returns a mutable view of this {@link SearchableMap},
       * containing only entries that share the given prefix.
       *
       * ### Usage:
       *
       * ```javascript
       * let map = new SearchableMap()
       * map.set("unicorn", 1)
       * map.set("universe", 2)
       * map.set("university", 3)
       * map.set("unique", 4)
       * map.set("hello", 5)
       *
       * let uni = map.atPrefix("uni")
       * uni.get("unique") // => 4
       * uni.get("unicorn") // => 1
       * uni.get("hello") // => undefined
       *
       * let univer = map.atPrefix("univer")
       * univer.get("unique") // => undefined
       * univer.get("universe") // => 2
       * univer.get("university") // => 3
       * ```
       *
       * @param prefix  The prefix
       * @return A {@link SearchableMap} representing a mutable view of the original
       * Map at the given prefix
       */
      atPrefix(prefix) {
        if (!prefix.startsWith(this._prefix)) {
          throw new Error("Mismatched prefix");
        }
        const [node, path3] = trackDown(this._tree, prefix.slice(this._prefix.length));
        if (node === void 0) {
          const [parentNode, key] = last(path3);
          for (const k of parentNode.keys()) {
            if (k !== LEAF && k.startsWith(key)) {
              const node2 = /* @__PURE__ */ new Map();
              node2.set(k.slice(key.length), parentNode.get(k));
              return new _SearchableMap(node2, prefix);
            }
          }
        }
        return new _SearchableMap(node, prefix);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
       */
      clear() {
        this._size = void 0;
        this._tree.clear();
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
       * @param key  Key to delete
       */
      delete(key) {
        this._size = void 0;
        return remove(this._tree, key);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
       * @return An iterator iterating through `[key, value]` entries.
       */
      entries() {
        return new TreeIterator(this, ENTRIES);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
       * @param fn  Iteration function
       */
      forEach(fn) {
        for (const [key, value] of this) {
          fn(key, value, this);
        }
      }
      /**
       * Returns a Map of all the entries that have a key within the given edit
       * distance from the search key. The keys of the returned Map are the matching
       * keys, while the values are two-element arrays where the first element is
       * the value associated to the key, and the second is the edit distance of the
       * key to the search key.
       *
       * ### Usage:
       *
       * ```javascript
       * let map = new SearchableMap()
       * map.set('hello', 'world')
       * map.set('hell', 'yeah')
       * map.set('ciao', 'mondo')
       *
       * // Get all entries that match the key 'hallo' with a maximum edit distance of 2
       * map.fuzzyGet('hallo', 2)
       * // => Map(2) { 'hello' => ['world', 1], 'hell' => ['yeah', 2] }
       *
       * // In the example, the "hello" key has value "world" and edit distance of 1
       * // (change "e" to "a"), the key "hell" has value "yeah" and edit distance of 2
       * // (change "e" to "a", delete "o")
       * ```
       *
       * @param key  The search key
       * @param maxEditDistance  The maximum edit distance (Levenshtein)
       * @return A Map of the matching keys to their value and edit distance
       */
      fuzzyGet(key, maxEditDistance) {
        return fuzzySearch(this._tree, key, maxEditDistance);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
       * @param key  Key to get
       * @return Value associated to the key, or `undefined` if the key is not
       * found.
       */
      get(key) {
        const node = lookup(this._tree, key);
        return node !== void 0 ? node.get(LEAF) : void 0;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
       * @param key  Key
       * @return True if the key is in the map, false otherwise
       */
      has(key) {
        const node = lookup(this._tree, key);
        return node !== void 0 && node.has(LEAF);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
       * @return An `Iterable` iterating through keys
       */
      keys() {
        return new TreeIterator(this, KEYS);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
       * @param key  Key to set
       * @param value  Value to associate to the key
       * @return The {@link SearchableMap} itself, to allow chaining
       */
      set(key, value) {
        if (typeof key !== "string") {
          throw new Error("key must be a string");
        }
        this._size = void 0;
        const node = createPath(this._tree, key);
        node.set(LEAF, value);
        return this;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
       */
      get size() {
        if (this._size) {
          return this._size;
        }
        this._size = 0;
        const iter = this.entries();
        while (!iter.next().done)
          this._size += 1;
        return this._size;
      }
      /**
       * Updates the value at the given key using the provided function. The function
       * is called with the current value at the key, and its return value is used as
       * the new value to be set.
       *
       * ### Example:
       *
       * ```javascript
       * // Increment the current value by one
       * searchableMap.update('somekey', (currentValue) => currentValue == null ? 0 : currentValue + 1)
       * ```
       *
       * If the value at the given key is or will be an object, it might not require
       * re-assignment. In that case it is better to use `fetch()`, because it is
       * faster.
       *
       * @param key  The key to update
       * @param fn  The function used to compute the new value from the current one
       * @return The {@link SearchableMap} itself, to allow chaining
       */
      update(key, fn) {
        if (typeof key !== "string") {
          throw new Error("key must be a string");
        }
        this._size = void 0;
        const node = createPath(this._tree, key);
        node.set(LEAF, fn(node.get(LEAF)));
        return this;
      }
      /**
       * Fetches the value of the given key. If the value does not exist, calls the
       * given function to create a new value, which is inserted at the given key
       * and subsequently returned.
       *
       * ### Example:
       *
       * ```javascript
       * const map = searchableMap.fetch('somekey', () => new Map())
       * map.set('foo', 'bar')
       * ```
       *
       * @param key  The key to update
       * @param initial  A function that creates a new value if the key does not exist
       * @return The existing or new value at the given key
       */
      fetch(key, initial) {
        if (typeof key !== "string") {
          throw new Error("key must be a string");
        }
        this._size = void 0;
        const node = createPath(this._tree, key);
        let value = node.get(LEAF);
        if (value === void 0) {
          node.set(LEAF, value = initial());
        }
        return value;
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
       * @return An `Iterable` iterating through values.
       */
      values() {
        return new TreeIterator(this, VALUES);
      }
      /**
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
       */
      [Symbol.iterator]() {
        return this.entries();
      }
      /**
       * Creates a {@link SearchableMap} from an `Iterable` of entries
       *
       * @param entries  Entries to be inserted in the {@link SearchableMap}
       * @return A new {@link SearchableMap} with the given entries
       */
      static from(entries) {
        const tree = new _SearchableMap();
        for (const [key, value] of entries) {
          tree.set(key, value);
        }
        return tree;
      }
      /**
       * Creates a {@link SearchableMap} from the iterable properties of a JavaScript object
       *
       * @param object  Object of entries for the {@link SearchableMap}
       * @return A new {@link SearchableMap} with the given entries
       */
      static fromObject(object) {
        return _SearchableMap.from(Object.entries(object));
      }
    };
    trackDown = (tree, key, path3 = []) => {
      if (key.length === 0 || tree == null) {
        return [tree, path3];
      }
      for (const k of tree.keys()) {
        if (k !== LEAF && key.startsWith(k)) {
          path3.push([tree, k]);
          return trackDown(tree.get(k), key.slice(k.length), path3);
        }
      }
      path3.push([tree, key]);
      return trackDown(void 0, "", path3);
    };
    lookup = (tree, key) => {
      if (key.length === 0 || tree == null) {
        return tree;
      }
      for (const k of tree.keys()) {
        if (k !== LEAF && key.startsWith(k)) {
          return lookup(tree.get(k), key.slice(k.length));
        }
      }
    };
    createPath = (node, key) => {
      const keyLength = key.length;
      outer: for (let pos = 0; node && pos < keyLength; ) {
        for (const k of node.keys()) {
          if (k !== LEAF && key[pos] === k[0]) {
            const len = Math.min(keyLength - pos, k.length);
            let offset = 1;
            while (offset < len && key[pos + offset] === k[offset])
              ++offset;
            const child2 = node.get(k);
            if (offset === k.length) {
              node = child2;
            } else {
              const intermediate = /* @__PURE__ */ new Map();
              intermediate.set(k.slice(offset), child2);
              node.set(key.slice(pos, pos + offset), intermediate);
              node.delete(k);
              node = intermediate;
            }
            pos += offset;
            continue outer;
          }
        }
        const child = /* @__PURE__ */ new Map();
        node.set(key.slice(pos), child);
        return child;
      }
      return node;
    };
    remove = (tree, key) => {
      const [node, path3] = trackDown(tree, key);
      if (node === void 0) {
        return;
      }
      node.delete(LEAF);
      if (node.size === 0) {
        cleanup(path3);
      } else if (node.size === 1) {
        const [key2, value] = node.entries().next().value;
        merge(path3, key2, value);
      }
    };
    cleanup = (path3) => {
      if (path3.length === 0) {
        return;
      }
      const [node, key] = last(path3);
      node.delete(key);
      if (node.size === 0) {
        cleanup(path3.slice(0, -1));
      } else if (node.size === 1) {
        const [key2, value] = node.entries().next().value;
        if (key2 !== LEAF) {
          merge(path3.slice(0, -1), key2, value);
        }
      }
    };
    merge = (path3, key, value) => {
      if (path3.length === 0) {
        return;
      }
      const [node, nodeKey] = last(path3);
      node.set(nodeKey + key, value);
      node.delete(nodeKey);
    };
    last = (array) => {
      return array[array.length - 1];
    };
    OR = "or";
    AND = "and";
    AND_NOT = "and_not";
    MiniSearch = class _MiniSearch {
      /**
       * @param options  Configuration options
       *
       * ### Examples:
       *
       * ```javascript
       * // Create a search engine that indexes the 'title' and 'text' fields of your
       * // documents:
       * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
       * ```
       *
       * ### ID Field:
       *
       * ```javascript
       * // Your documents are assumed to include a unique 'id' field, but if you want
       * // to use a different field for document identification, you can set the
       * // 'idField' option:
       * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
       * ```
       *
       * ### Options and defaults:
       *
       * ```javascript
       * // The full set of options (here with their default value) is:
       * const miniSearch = new MiniSearch({
       *   // idField: field that uniquely identifies a document
       *   idField: 'id',
       *
       *   // extractField: function used to get the value of a field in a document.
       *   // By default, it assumes the document is a flat object with field names as
       *   // property keys and field values as string property values, but custom logic
       *   // can be implemented by setting this option to a custom extractor function.
       *   extractField: (document, fieldName) => document[fieldName],
       *
       *   // tokenize: function used to split fields into individual terms. By
       *   // default, it is also used to tokenize search queries, unless a specific
       *   // `tokenize` search option is supplied. When tokenizing an indexed field,
       *   // the field name is passed as the second argument.
       *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
       *
       *   // processTerm: function used to process each tokenized term before
       *   // indexing. It can be used for stemming and normalization. Return a falsy
       *   // value in order to discard a term. By default, it is also used to process
       *   // search queries, unless a specific `processTerm` option is supplied as a
       *   // search option. When processing a term from a indexed field, the field
       *   // name is passed as the second argument.
       *   processTerm: (term, _fieldName) => term.toLowerCase(),
       *
       *   // searchOptions: default search options, see the `search` method for
       *   // details
       *   searchOptions: undefined,
       *
       *   // fields: document fields to be indexed. Mandatory, but not set by default
       *   fields: undefined
       *
       *   // storeFields: document fields to be stored and returned as part of the
       *   // search results.
       *   storeFields: []
       * })
       * ```
       */
      constructor(options) {
        if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
          throw new Error('MiniSearch: option "fields" must be provided');
        }
        const autoVacuum = options.autoVacuum == null || options.autoVacuum === true ? defaultAutoVacuumOptions : options.autoVacuum;
        this._options = {
          ...defaultOptions,
          ...options,
          autoVacuum,
          searchOptions: { ...defaultSearchOptions, ...options.searchOptions || {} },
          autoSuggestOptions: { ...defaultAutoSuggestOptions, ...options.autoSuggestOptions || {} }
        };
        this._index = new SearchableMap();
        this._documentCount = 0;
        this._documentIds = /* @__PURE__ */ new Map();
        this._idToShortId = /* @__PURE__ */ new Map();
        this._fieldIds = {};
        this._fieldLength = /* @__PURE__ */ new Map();
        this._avgFieldLength = [];
        this._nextId = 0;
        this._storedFields = /* @__PURE__ */ new Map();
        this._dirtCount = 0;
        this._currentVacuum = null;
        this._enqueuedVacuum = null;
        this._enqueuedVacuumConditions = defaultVacuumConditions;
        this.addFields(this._options.fields);
      }
      /**
       * Adds a document to the index
       *
       * @param document  The document to be indexed
       */
      add(document2) {
        const { extractField, tokenize, processTerm, fields, idField } = this._options;
        const id = extractField(document2, idField);
        if (id == null) {
          throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
        }
        if (this._idToShortId.has(id)) {
          throw new Error(`MiniSearch: duplicate ID ${id}`);
        }
        const shortDocumentId = this.addDocumentId(id);
        this.saveStoredFields(shortDocumentId, document2);
        for (const field of fields) {
          const fieldValue = extractField(document2, field);
          if (fieldValue == null)
            continue;
          const tokens = tokenize(fieldValue.toString(), field);
          const fieldId = this._fieldIds[field];
          const uniqueTerms = new Set(tokens).size;
          this.addFieldLength(shortDocumentId, fieldId, this._documentCount - 1, uniqueTerms);
          for (const term of tokens) {
            const processedTerm = processTerm(term, field);
            if (Array.isArray(processedTerm)) {
              for (const t of processedTerm) {
                this.addTerm(fieldId, shortDocumentId, t);
              }
            } else if (processedTerm) {
              this.addTerm(fieldId, shortDocumentId, processedTerm);
            }
          }
        }
      }
      /**
       * Adds all the given documents to the index
       *
       * @param documents  An array of documents to be indexed
       */
      addAll(documents) {
        for (const document2 of documents)
          this.add(document2);
      }
      /**
       * Adds all the given documents to the index asynchronously.
       *
       * Returns a promise that resolves (to `undefined`) when the indexing is done.
       * This method is useful when index many documents, to avoid blocking the main
       * thread. The indexing is performed asynchronously and in chunks.
       *
       * @param documents  An array of documents to be indexed
       * @param options  Configuration options
       * @return A promise resolving to `undefined` when the indexing is done
       */
      addAllAsync(documents, options = {}) {
        const { chunkSize = 10 } = options;
        const acc = { chunk: [], promise: Promise.resolve() };
        const { chunk, promise } = documents.reduce(({ chunk: chunk2, promise: promise2 }, document2, i) => {
          chunk2.push(document2);
          if ((i + 1) % chunkSize === 0) {
            return {
              chunk: [],
              promise: promise2.then(() => new Promise((resolve) => setTimeout(resolve, 0))).then(() => this.addAll(chunk2))
            };
          } else {
            return { chunk: chunk2, promise: promise2 };
          }
        }, acc);
        return promise.then(() => this.addAll(chunk));
      }
      /**
       * Removes the given document from the index.
       *
       * The document to remove must NOT have changed between indexing and removal,
       * otherwise the index will be corrupted.
       *
       * This method requires passing the full document to be removed (not just the
       * ID), and immediately removes the document from the inverted index, allowing
       * memory to be released. A convenient alternative is {@link
       * MiniSearch#discard}, which needs only the document ID, and has the same
       * visible effect, but delays cleaning up the index until the next vacuuming.
       *
       * @param document  The document to be removed
       */
      remove(document2) {
        const { tokenize, processTerm, extractField, fields, idField } = this._options;
        const id = extractField(document2, idField);
        if (id == null) {
          throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
        }
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
          throw new Error(`MiniSearch: cannot remove document with ID ${id}: it is not in the index`);
        }
        for (const field of fields) {
          const fieldValue = extractField(document2, field);
          if (fieldValue == null)
            continue;
          const tokens = tokenize(fieldValue.toString(), field);
          const fieldId = this._fieldIds[field];
          const uniqueTerms = new Set(tokens).size;
          this.removeFieldLength(shortId, fieldId, this._documentCount, uniqueTerms);
          for (const term of tokens) {
            const processedTerm = processTerm(term, field);
            if (Array.isArray(processedTerm)) {
              for (const t of processedTerm) {
                this.removeTerm(fieldId, shortId, t);
              }
            } else if (processedTerm) {
              this.removeTerm(fieldId, shortId, processedTerm);
            }
          }
        }
        this._storedFields.delete(shortId);
        this._documentIds.delete(shortId);
        this._idToShortId.delete(id);
        this._fieldLength.delete(shortId);
        this._documentCount -= 1;
      }
      /**
       * Removes all the given documents from the index. If called with no arguments,
       * it removes _all_ documents from the index.
       *
       * @param documents  The documents to be removed. If this argument is omitted,
       * all documents are removed. Note that, for removing all documents, it is
       * more efficient to call this method with no arguments than to pass all
       * documents.
       */
      removeAll(documents) {
        if (documents) {
          for (const document2 of documents)
            this.remove(document2);
        } else if (arguments.length > 0) {
          throw new Error("Expected documents to be present. Omit the argument to remove all documents.");
        } else {
          this._index = new SearchableMap();
          this._documentCount = 0;
          this._documentIds = /* @__PURE__ */ new Map();
          this._idToShortId = /* @__PURE__ */ new Map();
          this._fieldLength = /* @__PURE__ */ new Map();
          this._avgFieldLength = [];
          this._storedFields = /* @__PURE__ */ new Map();
          this._nextId = 0;
        }
      }
      /**
       * Discards the document with the given ID, so it won't appear in search results
       *
       * It has the same visible effect of {@link MiniSearch.remove} (both cause the
       * document to stop appearing in searches), but a different effect on the
       * internal data structures:
       *
       *   - {@link MiniSearch#remove} requires passing the full document to be
       *   removed as argument, and removes it from the inverted index immediately.
       *
       *   - {@link MiniSearch#discard} instead only needs the document ID, and
       *   works by marking the current version of the document as discarded, so it
       *   is immediately ignored by searches. This is faster and more convenient
       *   than {@link MiniSearch#remove}, but the index is not immediately
       *   modified. To take care of that, vacuuming is performed after a certain
       *   number of documents are discarded, cleaning up the index and allowing
       *   memory to be released.
       *
       * After discarding a document, it is possible to re-add a new version, and
       * only the new version will appear in searches. In other words, discarding
       * and re-adding a document works exactly like removing and re-adding it. The
       * {@link MiniSearch.replace} method can also be used to replace a document
       * with a new version.
       *
       * #### Details about vacuuming
       *
       * Repetite calls to this method would leave obsolete document references in
       * the index, invisible to searches. Two mechanisms take care of cleaning up:
       * clean up during search, and vacuuming.
       *
       *   - Upon search, whenever a discarded ID is found (and ignored for the
       *   results), references to the discarded document are removed from the
       *   inverted index entries for the search terms. This ensures that subsequent
       *   searches for the same terms do not need to skip these obsolete references
       *   again.
       *
       *   - In addition, vacuuming is performed automatically by default (see the
       *   `autoVacuum` field in {@link Options}) after a certain number of
       *   documents are discarded. Vacuuming traverses all terms in the index,
       *   cleaning up all references to discarded documents. Vacuuming can also be
       *   triggered manually by calling {@link MiniSearch#vacuum}.
       *
       * @param id  The ID of the document to be discarded
       */
      discard(id) {
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
          throw new Error(`MiniSearch: cannot discard document with ID ${id}: it is not in the index`);
        }
        this._idToShortId.delete(id);
        this._documentIds.delete(shortId);
        this._storedFields.delete(shortId);
        (this._fieldLength.get(shortId) || []).forEach((fieldLength, fieldId) => {
          this.removeFieldLength(shortId, fieldId, this._documentCount, fieldLength);
        });
        this._fieldLength.delete(shortId);
        this._documentCount -= 1;
        this._dirtCount += 1;
        this.maybeAutoVacuum();
      }
      maybeAutoVacuum() {
        if (this._options.autoVacuum === false) {
          return;
        }
        const { minDirtFactor, minDirtCount, batchSize, batchWait } = this._options.autoVacuum;
        this.conditionalVacuum({ batchSize, batchWait }, { minDirtCount, minDirtFactor });
      }
      /**
       * Discards the documents with the given IDs, so they won't appear in search
       * results
       *
       * It is equivalent to calling {@link MiniSearch#discard} for all the given
       * IDs, but with the optimization of triggering at most one automatic
       * vacuuming at the end.
       *
       * Note: to remove all documents from the index, it is faster and more
       * convenient to call {@link MiniSearch.removeAll} with no argument, instead
       * of passing all IDs to this method.
       */
      discardAll(ids) {
        const autoVacuum = this._options.autoVacuum;
        try {
          this._options.autoVacuum = false;
          for (const id of ids) {
            this.discard(id);
          }
        } finally {
          this._options.autoVacuum = autoVacuum;
        }
        this.maybeAutoVacuum();
      }
      /**
       * It replaces an existing document with the given updated version
       *
       * It works by discarding the current version and adding the updated one, so
       * it is functionally equivalent to calling {@link MiniSearch#discard}
       * followed by {@link MiniSearch#add}. The ID of the updated document should
       * be the same as the original one.
       *
       * Since it uses {@link MiniSearch#discard} internally, this method relies on
       * vacuuming to clean up obsolete document references from the index, allowing
       * memory to be released (see {@link MiniSearch#discard}).
       *
       * @param updatedDocument  The updated document to replace the old version
       * with
       */
      replace(updatedDocument) {
        const { idField, extractField } = this._options;
        const id = extractField(updatedDocument, idField);
        this.discard(id);
        this.add(updatedDocument);
      }
      /**
       * Triggers a manual vacuuming, cleaning up references to discarded documents
       * from the inverted index
       *
       * Vacuuming is only useful for applications that use the {@link
       * MiniSearch#discard} or {@link MiniSearch#replace} methods.
       *
       * By default, vacuuming is performed automatically when needed (controlled by
       * the `autoVacuum` field in {@link Options}), so there is usually no need to
       * call this method, unless one wants to make sure to perform vacuuming at a
       * specific moment.
       *
       * Vacuuming traverses all terms in the inverted index in batches, and cleans
       * up references to discarded documents from the posting list, allowing memory
       * to be released.
       *
       * The method takes an optional object as argument with the following keys:
       *
       *   - `batchSize`: the size of each batch (1000 by default)
       *
       *   - `batchWait`: the number of milliseconds to wait between batches (10 by
       *   default)
       *
       * On large indexes, vacuuming could have a non-negligible cost: batching
       * avoids blocking the thread for long, diluting this cost so that it is not
       * negatively affecting the application. Nonetheless, this method should only
       * be called when necessary, and relying on automatic vacuuming is usually
       * better.
       *
       * It returns a promise that resolves (to undefined) when the clean up is
       * completed. If vacuuming is already ongoing at the time this method is
       * called, a new one is enqueued immediately after the ongoing one, and a
       * corresponding promise is returned. However, no more than one vacuuming is
       * enqueued on top of the ongoing one, even if this method is called more
       * times (enqueuing multiple ones would be useless).
       *
       * @param options  Configuration options for the batch size and delay. See
       * {@link VacuumOptions}.
       */
      vacuum(options = {}) {
        return this.conditionalVacuum(options);
      }
      conditionalVacuum(options, conditions) {
        if (this._currentVacuum) {
          this._enqueuedVacuumConditions = this._enqueuedVacuumConditions && conditions;
          if (this._enqueuedVacuum != null) {
            return this._enqueuedVacuum;
          }
          this._enqueuedVacuum = this._currentVacuum.then(() => {
            const conditions2 = this._enqueuedVacuumConditions;
            this._enqueuedVacuumConditions = defaultVacuumConditions;
            return this.performVacuuming(options, conditions2);
          });
          return this._enqueuedVacuum;
        }
        if (this.vacuumConditionsMet(conditions) === false) {
          return Promise.resolve();
        }
        this._currentVacuum = this.performVacuuming(options);
        return this._currentVacuum;
      }
      async performVacuuming(options, conditions) {
        const initialDirtCount = this._dirtCount;
        if (this.vacuumConditionsMet(conditions)) {
          const batchSize = options.batchSize || defaultVacuumOptions.batchSize;
          const batchWait = options.batchWait || defaultVacuumOptions.batchWait;
          let i = 1;
          for (const [term, fieldsData] of this._index) {
            for (const [fieldId, fieldIndex] of fieldsData) {
              for (const [shortId] of fieldIndex) {
                if (this._documentIds.has(shortId)) {
                  continue;
                }
                if (fieldIndex.size <= 1) {
                  fieldsData.delete(fieldId);
                } else {
                  fieldIndex.delete(shortId);
                }
              }
            }
            if (this._index.get(term).size === 0) {
              this._index.delete(term);
            }
            if (i % batchSize === 0) {
              await new Promise((resolve) => setTimeout(resolve, batchWait));
            }
            i += 1;
          }
          this._dirtCount -= initialDirtCount;
        }
        await null;
        this._currentVacuum = this._enqueuedVacuum;
        this._enqueuedVacuum = null;
      }
      vacuumConditionsMet(conditions) {
        if (conditions == null) {
          return true;
        }
        let { minDirtCount, minDirtFactor } = conditions;
        minDirtCount = minDirtCount || defaultAutoVacuumOptions.minDirtCount;
        minDirtFactor = minDirtFactor || defaultAutoVacuumOptions.minDirtFactor;
        return this.dirtCount >= minDirtCount && this.dirtFactor >= minDirtFactor;
      }
      /**
       * Is `true` if a vacuuming operation is ongoing, `false` otherwise
       */
      get isVacuuming() {
        return this._currentVacuum != null;
      }
      /**
       * The number of documents discarded since the most recent vacuuming
       */
      get dirtCount() {
        return this._dirtCount;
      }
      /**
       * A number between 0 and 1 giving an indication about the proportion of
       * documents that are discarded, and can therefore be cleaned up by vacuuming.
       * A value close to 0 means that the index is relatively clean, while a higher
       * value means that the index is relatively dirty, and vacuuming could release
       * memory.
       */
      get dirtFactor() {
        return this._dirtCount / (1 + this._documentCount + this._dirtCount);
      }
      /**
       * Returns `true` if a document with the given ID is present in the index and
       * available for search, `false` otherwise
       *
       * @param id  The document ID
       */
      has(id) {
        return this._idToShortId.has(id);
      }
      /**
       * Returns the stored fields (as configured in the `storeFields` constructor
       * option) for the given document ID. Returns `undefined` if the document is
       * not present in the index.
       *
       * @param id  The document ID
       */
      getStoredFields(id) {
        const shortId = this._idToShortId.get(id);
        if (shortId == null) {
          return void 0;
        }
        return this._storedFields.get(shortId);
      }
      /**
       * Search for documents matching the given search query.
       *
       * The result is a list of scored document IDs matching the query, sorted by
       * descending score, and each including data about which terms were matched and
       * in which fields.
       *
       * ### Basic usage:
       *
       * ```javascript
       * // Search for "zen art motorcycle" with default options: terms have to match
       * // exactly, and individual terms are joined with OR
       * miniSearch.search('zen art motorcycle')
       * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
       * ```
       *
       * ### Restrict search to specific fields:
       *
       * ```javascript
       * // Search only in the 'title' field
       * miniSearch.search('zen', { fields: ['title'] })
       * ```
       *
       * ### Field boosting:
       *
       * ```javascript
       * // Boost a field
       * miniSearch.search('zen', { boost: { title: 2 } })
       * ```
       *
       * ### Prefix search:
       *
       * ```javascript
       * // Search for "moto" with prefix search (it will match documents
       * // containing terms that start with "moto" or "neuro")
       * miniSearch.search('moto neuro', { prefix: true })
       * ```
       *
       * ### Fuzzy search:
       *
       * ```javascript
       * // Search for "ismael" with fuzzy search (it will match documents containing
       * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
       * // (rounded to nearest integer)
       * miniSearch.search('ismael', { fuzzy: 0.2 })
       * ```
       *
       * ### Combining strategies:
       *
       * ```javascript
       * // Mix of exact match, prefix search, and fuzzy search
       * miniSearch.search('ismael mob', {
       *  prefix: true,
       *  fuzzy: 0.2
       * })
       * ```
       *
       * ### Advanced prefix and fuzzy search:
       *
       * ```javascript
       * // Perform fuzzy and prefix search depending on the search term. Here
       * // performing prefix and fuzzy search only on terms longer than 3 characters
       * miniSearch.search('ismael mob', {
       *  prefix: term => term.length > 3
       *  fuzzy: term => term.length > 3 ? 0.2 : null
       * })
       * ```
       *
       * ### Combine with AND:
       *
       * ```javascript
       * // Combine search terms with AND (to match only documents that contain both
       * // "motorcycle" and "art")
       * miniSearch.search('motorcycle art', { combineWith: 'AND' })
       * ```
       *
       * ### Combine with AND_NOT:
       *
       * There is also an AND_NOT combinator, that finds documents that match the
       * first term, but do not match any of the other terms. This combinator is
       * rarely useful with simple queries, and is meant to be used with advanced
       * query combinations (see later for more details).
       *
       * ### Filtering results:
       *
       * ```javascript
       * // Filter only results in the 'fiction' category (assuming that 'category'
       * // is a stored field)
       * miniSearch.search('motorcycle art', {
       *   filter: (result) => result.category === 'fiction'
       * })
       * ```
       *
       * ### Wildcard query
       *
       * Searching for an empty string (assuming the default tokenizer) returns no
       * results. Sometimes though, one needs to match all documents, like in a
       * "wildcard" search. This is possible by passing the special value
       * {@link MiniSearch.wildcard} as the query:
       *
       * ```javascript
       * // Return search results for all documents
       * miniSearch.search(MiniSearch.wildcard)
       * ```
       *
       * Note that search options such as `filter` and `boostDocument` are still
       * applied, influencing which results are returned, and their order:
       *
       * ```javascript
       * // Return search results for all documents in the 'fiction' category
       * miniSearch.search(MiniSearch.wildcard, {
       *   filter: (result) => result.category === 'fiction'
       * })
       * ```
       *
       * ### Advanced combination of queries:
       *
       * It is possible to combine different subqueries with OR, AND, and AND_NOT,
       * and even with different search options, by passing a query expression
       * tree object as the first argument, instead of a string.
       *
       * ```javascript
       * // Search for documents that contain "zen" and ("motorcycle" or "archery")
       * miniSearch.search({
       *   combineWith: 'AND',
       *   queries: [
       *     'zen',
       *     {
       *       combineWith: 'OR',
       *       queries: ['motorcycle', 'archery']
       *     }
       *   ]
       * })
       *
       * // Search for documents that contain ("apple" or "pear") but not "juice" and
       * // not "tree"
       * miniSearch.search({
       *   combineWith: 'AND_NOT',
       *   queries: [
       *     {
       *       combineWith: 'OR',
       *       queries: ['apple', 'pear']
       *     },
       *     'juice',
       *     'tree'
       *   ]
       * })
       * ```
       *
       * Each node in the expression tree can be either a string, or an object that
       * supports all {@link SearchOptions} fields, plus a `queries` array field for
       * subqueries.
       *
       * Note that, while this can become complicated to do by hand for complex or
       * deeply nested queries, it provides a formalized expression tree API for
       * external libraries that implement a parser for custom query languages.
       *
       * @param query  Search query
       * @param searchOptions  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
       */
      search(query, searchOptions = {}) {
        const { searchOptions: globalSearchOptions } = this._options;
        const searchOptionsWithDefaults = { ...globalSearchOptions, ...searchOptions };
        const rawResults = this.executeQuery(query, searchOptions);
        const results = [];
        for (const [docId, { score, terms, match }] of rawResults) {
          const quality = terms.length || 1;
          const result = {
            id: this._documentIds.get(docId),
            score: score * quality,
            terms: Object.keys(match),
            queryTerms: terms,
            match
          };
          Object.assign(result, this._storedFields.get(docId));
          if (searchOptionsWithDefaults.filter == null || searchOptionsWithDefaults.filter(result)) {
            results.push(result);
          }
        }
        if (query === _MiniSearch.wildcard && searchOptionsWithDefaults.boostDocument == null) {
          return results;
        }
        results.sort(byScore);
        return results;
      }
      /**
       * Provide suggestions for the given search query
       *
       * The result is a list of suggested modified search queries, derived from the
       * given search query, each with a relevance score, sorted by descending score.
       *
       * By default, it uses the same options used for search, except that by
       * default it performs prefix search on the last term of the query, and
       * combine terms with `'AND'` (requiring all query terms to match). Custom
       * options can be passed as a second argument. Defaults can be changed upon
       * calling the {@link MiniSearch} constructor, by passing a
       * `autoSuggestOptions` option.
       *
       * ### Basic usage:
       *
       * ```javascript
       * // Get suggestions for 'neuro':
       * miniSearch.autoSuggest('neuro')
       * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
       * ```
       *
       * ### Multiple words:
       *
       * ```javascript
       * // Get suggestions for 'zen ar':
       * miniSearch.autoSuggest('zen ar')
       * // => [
       * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
       * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
       * // ]
       * ```
       *
       * ### Fuzzy suggestions:
       *
       * ```javascript
       * // Correct spelling mistakes using fuzzy search:
       * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
       * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
       * ```
       *
       * ### Filtering:
       *
       * ```javascript
       * // Get suggestions for 'zen ar', but only within the 'fiction' category
       * // (assuming that 'category' is a stored field):
       * miniSearch.autoSuggest('zen ar', {
       *   filter: (result) => result.category === 'fiction'
       * })
       * // => [
       * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
       * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
       * // ]
       * ```
       *
       * @param queryString  Query string to be expanded into suggestions
       * @param options  Search options. The supported options and default values
       * are the same as for the {@link MiniSearch#search} method, except that by
       * default prefix search is performed on the last term in the query, and terms
       * are combined with `'AND'`.
       * @return  A sorted array of suggestions sorted by relevance score.
       */
      autoSuggest(queryString, options = {}) {
        options = { ...this._options.autoSuggestOptions, ...options };
        const suggestions = /* @__PURE__ */ new Map();
        for (const { score, terms } of this.search(queryString, options)) {
          const phrase = terms.join(" ");
          const suggestion = suggestions.get(phrase);
          if (suggestion != null) {
            suggestion.score += score;
            suggestion.count += 1;
          } else {
            suggestions.set(phrase, { score, terms, count: 1 });
          }
        }
        const results = [];
        for (const [suggestion, { score, terms, count }] of suggestions) {
          results.push({ suggestion, terms, score: score / count });
        }
        results.sort(byScore);
        return results;
      }
      /**
       * Total number of documents available to search
       */
      get documentCount() {
        return this._documentCount;
      }
      /**
       * Number of terms in the index
       */
      get termCount() {
        return this._index.size;
      }
      /**
       * Deserializes a JSON index (serialized with `JSON.stringify(miniSearch)`)
       * and instantiates a MiniSearch instance. It should be given the same options
       * originally used when serializing the index.
       *
       * ### Usage:
       *
       * ```javascript
       * // If the index was serialized with:
       * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
       * miniSearch.addAll(documents)
       *
       * const json = JSON.stringify(miniSearch)
       * // It can later be deserialized like this:
       * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
       * ```
       *
       * @param json  JSON-serialized index
       * @param options  configuration options, same as the constructor
       * @return An instance of MiniSearch deserialized from the given JSON.
       */
      static loadJSON(json, options) {
        if (options == null) {
          throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
        }
        return this.loadJS(JSON.parse(json), options);
      }
      /**
       * Async equivalent of {@link MiniSearch.loadJSON}
       *
       * This function is an alternative to {@link MiniSearch.loadJSON} that returns
       * a promise, and loads the index in batches, leaving pauses between them to avoid
       * blocking the main thread. It tends to be slower than the synchronous
       * version, but does not block the main thread, so it can be a better choice
       * when deserializing very large indexes.
       *
       * @param json  JSON-serialized index
       * @param options  configuration options, same as the constructor
       * @return A Promise that will resolve to an instance of MiniSearch deserialized from the given JSON.
       */
      static async loadJSONAsync(json, options) {
        if (options == null) {
          throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
        }
        return this.loadJSAsync(JSON.parse(json), options);
      }
      /**
       * Returns the default value of an option. It will throw an error if no option
       * with the given name exists.
       *
       * @param optionName  Name of the option
       * @return The default value of the given option
       *
       * ### Usage:
       *
       * ```javascript
       * // Get default tokenizer
       * MiniSearch.getDefault('tokenize')
       *
       * // Get default term processor
       * MiniSearch.getDefault('processTerm')
       *
       * // Unknown options will throw an error
       * MiniSearch.getDefault('notExisting')
       * // => throws 'MiniSearch: unknown option "notExisting"'
       * ```
       */
      static getDefault(optionName) {
        if (defaultOptions.hasOwnProperty(optionName)) {
          return getOwnProperty(defaultOptions, optionName);
        } else {
          throw new Error(`MiniSearch: unknown option "${optionName}"`);
        }
      }
      /**
       * @ignore
       */
      static loadJS(js, options) {
        const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
        const miniSearch = this.instantiateMiniSearch(js, options);
        miniSearch._documentIds = objectToNumericMap(documentIds);
        miniSearch._fieldLength = objectToNumericMap(fieldLength);
        miniSearch._storedFields = objectToNumericMap(storedFields);
        for (const [shortId, id] of miniSearch._documentIds) {
          miniSearch._idToShortId.set(id, shortId);
        }
        for (const [term, data] of index) {
          const dataMap = /* @__PURE__ */ new Map();
          for (const fieldId of Object.keys(data)) {
            let indexEntry = data[fieldId];
            if (serializationVersion === 1) {
              indexEntry = indexEntry.ds;
            }
            dataMap.set(parseInt(fieldId, 10), objectToNumericMap(indexEntry));
          }
          miniSearch._index.set(term, dataMap);
        }
        return miniSearch;
      }
      /**
       * @ignore
       */
      static async loadJSAsync(js, options) {
        const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
        const miniSearch = this.instantiateMiniSearch(js, options);
        miniSearch._documentIds = await objectToNumericMapAsync(documentIds);
        miniSearch._fieldLength = await objectToNumericMapAsync(fieldLength);
        miniSearch._storedFields = await objectToNumericMapAsync(storedFields);
        for (const [shortId, id] of miniSearch._documentIds) {
          miniSearch._idToShortId.set(id, shortId);
        }
        let count = 0;
        for (const [term, data] of index) {
          const dataMap = /* @__PURE__ */ new Map();
          for (const fieldId of Object.keys(data)) {
            let indexEntry = data[fieldId];
            if (serializationVersion === 1) {
              indexEntry = indexEntry.ds;
            }
            dataMap.set(parseInt(fieldId, 10), await objectToNumericMapAsync(indexEntry));
          }
          if (++count % 1e3 === 0)
            await wait(0);
          miniSearch._index.set(term, dataMap);
        }
        return miniSearch;
      }
      /**
       * @ignore
       */
      static instantiateMiniSearch(js, options) {
        const { documentCount, nextId, fieldIds, averageFieldLength, dirtCount, serializationVersion } = js;
        if (serializationVersion !== 1 && serializationVersion !== 2) {
          throw new Error("MiniSearch: cannot deserialize an index created with an incompatible version");
        }
        const miniSearch = new _MiniSearch(options);
        miniSearch._documentCount = documentCount;
        miniSearch._nextId = nextId;
        miniSearch._idToShortId = /* @__PURE__ */ new Map();
        miniSearch._fieldIds = fieldIds;
        miniSearch._avgFieldLength = averageFieldLength;
        miniSearch._dirtCount = dirtCount || 0;
        miniSearch._index = new SearchableMap();
        return miniSearch;
      }
      /**
       * @ignore
       */
      executeQuery(query, searchOptions = {}) {
        if (query === _MiniSearch.wildcard) {
          return this.executeWildcardQuery(searchOptions);
        }
        if (typeof query !== "string") {
          const options2 = { ...searchOptions, ...query, queries: void 0 };
          const results2 = query.queries.map((subquery) => this.executeQuery(subquery, options2));
          return this.combineResults(results2, options2.combineWith);
        }
        const { tokenize, processTerm, searchOptions: globalSearchOptions } = this._options;
        const options = { tokenize, processTerm, ...globalSearchOptions, ...searchOptions };
        const { tokenize: searchTokenize, processTerm: searchProcessTerm } = options;
        const terms = searchTokenize(query).flatMap((term) => searchProcessTerm(term)).filter((term) => !!term);
        const queries = terms.map(termToQuerySpec(options));
        const results = queries.map((query2) => this.executeQuerySpec(query2, options));
        return this.combineResults(results, options.combineWith);
      }
      /**
       * @ignore
       */
      executeQuerySpec(query, searchOptions) {
        const options = { ...this._options.searchOptions, ...searchOptions };
        const boosts = (options.fields || this._options.fields).reduce((boosts2, field) => ({ ...boosts2, [field]: getOwnProperty(options.boost, field) || 1 }), {});
        const { boostDocument, weights, maxFuzzy, bm25: bm25params } = options;
        const { fuzzy: fuzzyWeight, prefix: prefixWeight } = { ...defaultSearchOptions.weights, ...weights };
        const data = this._index.get(query.term);
        const results = this.termResults(query.term, query.term, 1, query.termBoost, data, boosts, boostDocument, bm25params);
        let prefixMatches;
        let fuzzyMatches;
        if (query.prefix) {
          prefixMatches = this._index.atPrefix(query.term);
        }
        if (query.fuzzy) {
          const fuzzy = query.fuzzy === true ? 0.2 : query.fuzzy;
          const maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy;
          if (maxDistance)
            fuzzyMatches = this._index.fuzzyGet(query.term, maxDistance);
        }
        if (prefixMatches) {
          for (const [term, data2] of prefixMatches) {
            const distance = term.length - query.term.length;
            if (!distance) {
              continue;
            }
            fuzzyMatches === null || fuzzyMatches === void 0 ? void 0 : fuzzyMatches.delete(term);
            const weight = prefixWeight * term.length / (term.length + 0.3 * distance);
            this.termResults(query.term, term, weight, query.termBoost, data2, boosts, boostDocument, bm25params, results);
          }
        }
        if (fuzzyMatches) {
          for (const term of fuzzyMatches.keys()) {
            const [data2, distance] = fuzzyMatches.get(term);
            if (!distance) {
              continue;
            }
            const weight = fuzzyWeight * term.length / (term.length + distance);
            this.termResults(query.term, term, weight, query.termBoost, data2, boosts, boostDocument, bm25params, results);
          }
        }
        return results;
      }
      /**
       * @ignore
       */
      executeWildcardQuery(searchOptions) {
        const results = /* @__PURE__ */ new Map();
        const options = { ...this._options.searchOptions, ...searchOptions };
        for (const [shortId, id] of this._documentIds) {
          const score = options.boostDocument ? options.boostDocument(id, "", this._storedFields.get(shortId)) : 1;
          results.set(shortId, {
            score,
            terms: [],
            match: {}
          });
        }
        return results;
      }
      /**
       * @ignore
       */
      combineResults(results, combineWith = OR) {
        if (results.length === 0) {
          return /* @__PURE__ */ new Map();
        }
        const operator = combineWith.toLowerCase();
        const combinator = combinators[operator];
        if (!combinator) {
          throw new Error(`Invalid combination operator: ${combineWith}`);
        }
        return results.reduce(combinator) || /* @__PURE__ */ new Map();
      }
      /**
       * Allows serialization of the index to JSON, to possibly store it and later
       * deserialize it with {@link MiniSearch.loadJSON}.
       *
       * Normally one does not directly call this method, but rather call the
       * standard JavaScript `JSON.stringify()` passing the {@link MiniSearch}
       * instance, and JavaScript will internally call this method. Upon
       * deserialization, one must pass to {@link MiniSearch.loadJSON} the same
       * options used to create the original instance that was serialized.
       *
       * ### Usage:
       *
       * ```javascript
       * // Serialize the index:
       * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
       * miniSearch.addAll(documents)
       * const json = JSON.stringify(miniSearch)
       *
       * // Later, to deserialize it:
       * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
       * ```
       *
       * @return A plain-object serializable representation of the search index.
       */
      toJSON() {
        const index = [];
        for (const [term, fieldIndex] of this._index) {
          const data = {};
          for (const [fieldId, freqs] of fieldIndex) {
            data[fieldId] = Object.fromEntries(freqs);
          }
          index.push([term, data]);
        }
        return {
          documentCount: this._documentCount,
          nextId: this._nextId,
          documentIds: Object.fromEntries(this._documentIds),
          fieldIds: this._fieldIds,
          fieldLength: Object.fromEntries(this._fieldLength),
          averageFieldLength: this._avgFieldLength,
          storedFields: Object.fromEntries(this._storedFields),
          dirtCount: this._dirtCount,
          index,
          serializationVersion: 2
        };
      }
      /**
       * @ignore
       */
      termResults(sourceTerm, derivedTerm, termWeight, termBoost, fieldTermData, fieldBoosts, boostDocumentFn, bm25params, results = /* @__PURE__ */ new Map()) {
        if (fieldTermData == null)
          return results;
        for (const field of Object.keys(fieldBoosts)) {
          const fieldBoost = fieldBoosts[field];
          const fieldId = this._fieldIds[field];
          const fieldTermFreqs = fieldTermData.get(fieldId);
          if (fieldTermFreqs == null)
            continue;
          let matchingFields = fieldTermFreqs.size;
          const avgFieldLength = this._avgFieldLength[fieldId];
          for (const docId of fieldTermFreqs.keys()) {
            if (!this._documentIds.has(docId)) {
              this.removeTerm(fieldId, docId, derivedTerm);
              matchingFields -= 1;
              continue;
            }
            const docBoost = boostDocumentFn ? boostDocumentFn(this._documentIds.get(docId), derivedTerm, this._storedFields.get(docId)) : 1;
            if (!docBoost)
              continue;
            const termFreq = fieldTermFreqs.get(docId);
            const fieldLength = this._fieldLength.get(docId)[fieldId];
            const rawScore = calcBM25Score(termFreq, matchingFields, this._documentCount, fieldLength, avgFieldLength, bm25params);
            const weightedScore = termWeight * termBoost * fieldBoost * docBoost * rawScore;
            const result = results.get(docId);
            if (result) {
              result.score += weightedScore;
              assignUniqueTerm(result.terms, sourceTerm);
              const match = getOwnProperty(result.match, derivedTerm);
              if (match) {
                match.push(field);
              } else {
                result.match[derivedTerm] = [field];
              }
            } else {
              results.set(docId, {
                score: weightedScore,
                terms: [sourceTerm],
                match: { [derivedTerm]: [field] }
              });
            }
          }
        }
        return results;
      }
      /**
       * @ignore
       */
      addTerm(fieldId, documentId, term) {
        const indexData = this._index.fetch(term, createMap);
        let fieldIndex = indexData.get(fieldId);
        if (fieldIndex == null) {
          fieldIndex = /* @__PURE__ */ new Map();
          fieldIndex.set(documentId, 1);
          indexData.set(fieldId, fieldIndex);
        } else {
          const docs = fieldIndex.get(documentId);
          fieldIndex.set(documentId, (docs || 0) + 1);
        }
      }
      /**
       * @ignore
       */
      removeTerm(fieldId, documentId, term) {
        if (!this._index.has(term)) {
          this.warnDocumentChanged(documentId, fieldId, term);
          return;
        }
        const indexData = this._index.fetch(term, createMap);
        const fieldIndex = indexData.get(fieldId);
        if (fieldIndex == null || fieldIndex.get(documentId) == null) {
          this.warnDocumentChanged(documentId, fieldId, term);
        } else if (fieldIndex.get(documentId) <= 1) {
          if (fieldIndex.size <= 1) {
            indexData.delete(fieldId);
          } else {
            fieldIndex.delete(documentId);
          }
        } else {
          fieldIndex.set(documentId, fieldIndex.get(documentId) - 1);
        }
        if (this._index.get(term).size === 0) {
          this._index.delete(term);
        }
      }
      /**
       * @ignore
       */
      warnDocumentChanged(shortDocumentId, fieldId, term) {
        for (const fieldName of Object.keys(this._fieldIds)) {
          if (this._fieldIds[fieldName] === fieldId) {
            this._options.logger("warn", `MiniSearch: document with ID ${this._documentIds.get(shortDocumentId)} has changed before removal: term "${term}" was not present in field "${fieldName}". Removing a document after it has changed can corrupt the index!`, "version_conflict");
            return;
          }
        }
      }
      /**
       * @ignore
       */
      addDocumentId(documentId) {
        const shortDocumentId = this._nextId;
        this._idToShortId.set(documentId, shortDocumentId);
        this._documentIds.set(shortDocumentId, documentId);
        this._documentCount += 1;
        this._nextId += 1;
        return shortDocumentId;
      }
      /**
       * @ignore
       */
      addFields(fields) {
        for (let i = 0; i < fields.length; i++) {
          this._fieldIds[fields[i]] = i;
        }
      }
      /**
       * @ignore
       */
      addFieldLength(documentId, fieldId, count, length) {
        let fieldLengths = this._fieldLength.get(documentId);
        if (fieldLengths == null)
          this._fieldLength.set(documentId, fieldLengths = []);
        fieldLengths[fieldId] = length;
        const averageFieldLength = this._avgFieldLength[fieldId] || 0;
        const totalFieldLength = averageFieldLength * count + length;
        this._avgFieldLength[fieldId] = totalFieldLength / (count + 1);
      }
      /**
       * @ignore
       */
      removeFieldLength(documentId, fieldId, count, length) {
        if (count === 1) {
          this._avgFieldLength[fieldId] = 0;
          return;
        }
        const totalFieldLength = this._avgFieldLength[fieldId] * count - length;
        this._avgFieldLength[fieldId] = totalFieldLength / (count - 1);
      }
      /**
       * @ignore
       */
      saveStoredFields(documentId, doc) {
        const { storeFields, extractField } = this._options;
        if (storeFields == null || storeFields.length === 0) {
          return;
        }
        let documentFields = this._storedFields.get(documentId);
        if (documentFields == null)
          this._storedFields.set(documentId, documentFields = {});
        for (const fieldName of storeFields) {
          const fieldValue = extractField(doc, fieldName);
          if (fieldValue !== void 0)
            documentFields[fieldName] = fieldValue;
        }
      }
    };
    MiniSearch.wildcard = Symbol("*");
    getOwnProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property) ? object[property] : void 0;
    combinators = {
      [OR]: (a, b) => {
        for (const docId of b.keys()) {
          const existing = a.get(docId);
          if (existing == null) {
            a.set(docId, b.get(docId));
          } else {
            const { score, terms, match } = b.get(docId);
            existing.score = existing.score + score;
            existing.match = Object.assign(existing.match, match);
            assignUniqueTerms(existing.terms, terms);
          }
        }
        return a;
      },
      [AND]: (a, b) => {
        const combined = /* @__PURE__ */ new Map();
        for (const docId of b.keys()) {
          const existing = a.get(docId);
          if (existing == null)
            continue;
          const { score, terms, match } = b.get(docId);
          assignUniqueTerms(existing.terms, terms);
          combined.set(docId, {
            score: existing.score + score,
            terms: existing.terms,
            match: Object.assign(existing.match, match)
          });
        }
        return combined;
      },
      [AND_NOT]: (a, b) => {
        for (const docId of b.keys())
          a.delete(docId);
        return a;
      }
    };
    defaultBM25params = { k: 1.2, b: 0.7, d: 0.5 };
    calcBM25Score = (termFreq, matchingCount, totalCount, fieldLength, avgFieldLength, bm25params) => {
      const { k, b, d } = bm25params;
      const invDocFreq = Math.log(1 + (totalCount - matchingCount + 0.5) / (matchingCount + 0.5));
      return invDocFreq * (d + termFreq * (k + 1) / (termFreq + k * (1 - b + b * fieldLength / avgFieldLength)));
    };
    termToQuerySpec = (options) => (term, i, terms) => {
      const fuzzy = typeof options.fuzzy === "function" ? options.fuzzy(term, i, terms) : options.fuzzy || false;
      const prefix = typeof options.prefix === "function" ? options.prefix(term, i, terms) : options.prefix === true;
      const termBoost = typeof options.boostTerm === "function" ? options.boostTerm(term, i, terms) : 1;
      return { term, fuzzy, prefix, termBoost };
    };
    defaultOptions = {
      idField: "id",
      extractField: (document2, fieldName) => document2[fieldName],
      tokenize: (text) => text.split(SPACE_OR_PUNCTUATION),
      processTerm: (term) => term.toLowerCase(),
      fields: void 0,
      searchOptions: void 0,
      storeFields: [],
      logger: (level, message) => {
        if (typeof (console === null || console === void 0 ? void 0 : console[level]) === "function")
          console[level](message);
      },
      autoVacuum: true
    };
    defaultSearchOptions = {
      combineWith: OR,
      prefix: false,
      fuzzy: false,
      maxFuzzy: 6,
      boost: {},
      weights: { fuzzy: 0.45, prefix: 0.375 },
      bm25: defaultBM25params
    };
    defaultAutoSuggestOptions = {
      combineWith: AND,
      prefix: (term, i, terms) => i === terms.length - 1
    };
    defaultVacuumOptions = { batchSize: 1e3, batchWait: 10 };
    defaultVacuumConditions = { minDirtFactor: 0.1, minDirtCount: 20 };
    defaultAutoVacuumOptions = { ...defaultVacuumOptions, ...defaultVacuumConditions };
    assignUniqueTerm = (target, term) => {
      if (!target.includes(term))
        target.push(term);
    };
    assignUniqueTerms = (target, source) => {
      for (const term of source) {
        if (!target.includes(term))
          target.push(term);
      }
    };
    byScore = ({ score: a }, { score: b }) => b - a;
    createMap = () => /* @__PURE__ */ new Map();
    objectToNumericMap = (object) => {
      const map = /* @__PURE__ */ new Map();
      for (const key of Object.keys(object)) {
        map.set(parseInt(key, 10), object[key]);
      }
      return map;
    };
    objectToNumericMapAsync = async (object) => {
      const map = /* @__PURE__ */ new Map();
      let count = 0;
      for (const key of Object.keys(object)) {
        map.set(parseInt(key, 10), object[key]);
        if (++count % 1e3 === 0) {
          await wait(0);
        }
      }
      return map;
    };
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u;
  }
});

// src/utils/ai/ragContext.ts
var ragContext_exports = {};
__export(ragContext_exports, {
  getRagContext: () => getRagContext
});
async function readJson(uri) {
  const bytes = await vscode4.workspace.fs.readFile(uri);
  return JSON.parse(Buffer.from(bytes).toString("utf8"));
}
async function getDocs(context) {
  const key = context.extensionUri.toString();
  const entry = cache.get(key) ?? {};
  if (entry.docs) {
    return entry.docs;
  }
  const metaUri = vscode4.Uri.joinPath(context.extensionUri, ...ARTIFACTS_DIR, META_FILE);
  const docs = await readJson(metaUri);
  cache.set(key, { ...entry, docs });
  return docs;
}
function buildIndex(docs) {
  const mini = new MiniSearch({
    fields: ["text", "title", "source"],
    storeFields: ["text", "title", "source"]
  });
  mini.addAll(docs);
  return mini;
}
async function getIndex(context) {
  const key = context.extensionUri.toString();
  const entry = cache.get(key) ?? {};
  if (entry.index) {
    return entry.index;
  }
  const docs = await getDocs(context);
  const docsIndex = buildIndex(docs);
  cache.set(key, { ...entry, index: docsIndex });
  return docsIndex;
}
async function getRagContext(context, queryText, topK = 5) {
  const ragEnabled = vscode4.workspace.getConfiguration("wsCodeReview").get("rag.enable", false);
  if (!ragEnabled || !queryText?.trim()) {
    return "";
  }
  try {
    const contextIndex = await getIndex(context);
    const searchOptions = {
      boost: { title: 2 },
      prefix: true,
      fuzzy: 0.1
    };
    const hitsAND = contextIndex.search(queryText, { ...searchOptions, combineWith: "AND" });
    let hits = hitsAND.slice(0, topK);
    if (hits.length < topK) {
      const hitsOR = contextIndex.search(queryText, { ...searchOptions, combineWith: "OR" });
      const seen = new Set(hits.map((hit) => hit.id ?? hit.id));
      for (const hit of hitsOR) {
        const id = hit.id ?? hit.id;
        if (!seen.has(id)) {
          hits.push(hit);
          seen.add(id);
          if (hits.length >= topK) {
            break;
          }
        }
      }
    }
    if (!hits.length) {
      return "";
    }
    return hits.slice(0, topK).map((h) => `[source: ${h.source} | score: ${h.score.toFixed(3)}]
${h.text}`).join("\n\n---\n\n");
  } catch (e) {
    console.warn("[RAG] MiniSearch failed:", e);
    return "";
  }
}
var vscode4, ARTIFACTS_DIR, META_FILE, cache;
var init_ragContext = __esm({
  "src/utils/ai/ragContext.ts"() {
    "use strict";
    vscode4 = __toESM(require("vscode"));
    init_es();
    ARTIFACTS_DIR = ["resources", "rag-artifacts"];
    META_FILE = "metadata.json";
    cache = /* @__PURE__ */ new Map();
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports2, module2) {
    function setup(env2) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env2).forEach((key) => {
        createDebug[key] = env2[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug2(...args) {
          if (!debug2.enabled) {
            return;
          }
          const self = debug2;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug2.namespace = namespace;
        debug2.useColors = createDebug.useColors();
        debug2.color = createDebug.selectColor(namespace);
        debug2.extend = extend;
        debug2.destroy = createDebug.destroy;
        Object.defineProperty(debug2, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug2);
        }
        return debug2;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/supports-color/index.js
var supports_color_exports = {};
__export(supports_color_exports, {
  createSupportsColor: () => createSupportsColor,
  default: () => supports_color_default
});
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : import_node_process.default.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (import_node_process.default.platform === "win32") {
    const osRelease = import_node_os.default.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if ("GITHUB_ACTIONS" in env || "GITEA_ACTIONS" in env) {
      return 3;
    }
    if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var import_node_process, import_node_os, import_node_tty, env, flagForceColor, supportsColor, supports_color_default;
var init_supports_color = __esm({
  "node_modules/supports-color/index.js"() {
    import_node_process = __toESM(require("node:process"), 1);
    import_node_os = __toESM(require("node:os"), 1);
    import_node_tty = __toESM(require("node:tty"), 1);
    ({ env } = import_node_process.default);
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      flagForceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      flagForceColor = 1;
    }
    supportsColor = {
      stdout: createSupportsColor({ isTTY: import_node_tty.default.isatty(1) }),
      stderr: createSupportsColor({ isTTY: import_node_tty.default.isatty(2) })
    };
    supports_color_default = supportsColor;
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports2, module2) {
    var tty2 = require("tty");
    var util = require("util");
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor2 = (init_supports_color(), __toCommonJS(supports_color_exports));
      if (supportsColor2 && (supportsColor2.stderr || supportsColor2).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty2.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/@kwsites/file-exists/dist/src/index.js
var require_src2 = __commonJS({
  "node_modules/@kwsites/file-exists/dist/src/index.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fs_1 = require("fs");
    var debug_1 = __importDefault(require_src());
    var log = debug_1.default("@kwsites/file-exists");
    function check(path3, isFile, isDirectory) {
      log(`checking %s`, path3);
      try {
        const stat = fs_1.statSync(path3);
        if (stat.isFile() && isFile) {
          log(`[OK] path represents a file`);
          return true;
        }
        if (stat.isDirectory() && isDirectory) {
          log(`[OK] path represents a directory`);
          return true;
        }
        log(`[FAIL] path represents something other than a file or directory`);
        return false;
      } catch (e) {
        if (e.code === "ENOENT") {
          log(`[FAIL] path is not accessible: %o`, e);
          return false;
        }
        log(`[FATAL] %o`, e);
        throw e;
      }
    }
    function exists2(path3, type = exports2.READABLE) {
      return check(path3, (type & exports2.FILE) > 0, (type & exports2.FOLDER) > 0);
    }
    exports2.exists = exists2;
    exports2.FILE = 1;
    exports2.FOLDER = 2;
    exports2.READABLE = exports2.FILE + exports2.FOLDER;
  }
});

// node_modules/@kwsites/file-exists/dist/index.js
var require_dist = __commonJS({
  "node_modules/@kwsites/file-exists/dist/index.js"(exports2) {
    "use strict";
    function __export3(m) {
      for (var p in m) if (!exports2.hasOwnProperty(p)) exports2[p] = m[p];
    }
    Object.defineProperty(exports2, "__esModule", { value: true });
    __export3(require_src2());
  }
});

// node_modules/@kwsites/promise-deferred/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@kwsites/promise-deferred/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDeferred = exports2.deferred = void 0;
    function deferred2() {
      let done;
      let fail;
      let status = "pending";
      const promise = new Promise((_done, _fail) => {
        done = _done;
        fail = _fail;
      });
      return {
        promise,
        done(result) {
          if (status === "pending") {
            status = "resolved";
            done(result);
          }
        },
        fail(error) {
          if (status === "pending") {
            status = "rejected";
            fail(error);
          }
        },
        get fulfilled() {
          return status !== "pending";
        },
        get status() {
          return status;
        }
      };
    }
    exports2.deferred = deferred2;
    exports2.createDeferred = deferred2;
    exports2.default = deferred2;
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);

// src/commands/showSuggestion.ts
var vscode11 = __toESM(require("vscode"));

// src/utils/ai/aiClient.ts
var vscode = __toESM(require("vscode"));

// src/utils/constants.ts
var WEBVIEW_LIBRARY_DIR = "webview-lib";
var AI_MODEL = "qwen2.5-coder:7b-instruct";
var AI_API = "http://localhost:11434/api/generate";
var BIG_FILE_LINE_THRESHOLD = 600;

// src/utils/ai/modelManager.ts
var STORAGE_KEYS = {
  model: "ollamaModel",
  api: "ollamaApi"
};
function getStringPref(context, key) {
  const value = context.globalState.get(key);
  const trimmed2 = value?.trim();
  return trimmed2 ? trimmed2 : void 0;
}
async function setStringPref(context, key, value) {
  await context.globalState.update(key, value.trim());
}
async function fetchWithTimeout(url, opts = {}, timeoutMs = 5e3) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
function deriveOllamaBaseUrl(apiEndpoint) {
  const trimmed2 = apiEndpoint.trim();
  const withoutGenerate = trimmed2.replace(/\/api\/generate.*$/i, "");
  const withoutTrailing = withoutGenerate.replace(/\/+$/g, "");
  return withoutTrailing.length > 0 ? withoutTrailing : trimmed2;
}
function getCurrentApi(context) {
  return getStringPref(context, STORAGE_KEYS.api) ?? AI_API;
}
async function setCurrentApi(context, value) {
  await setStringPref(context, STORAGE_KEYS.api, value);
}
function getCurrentModel(context) {
  return getStringPref(context, STORAGE_KEYS.model) ?? AI_MODEL;
}
async function setCurrentModel(context, value) {
  await setStringPref(context, STORAGE_KEYS.model, value);
}
async function listOllamaModels(context) {
  const apiEndpoint = getCurrentApi(context);
  const baseUrl = deriveOllamaBaseUrl(apiEndpoint);
  const tagsUrl = `${baseUrl}/api/tags`;
  try {
    const res = await fetchWithTimeout(tagsUrl, { method: "GET" }, 5e3);
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    const raw = Array.isArray(json?.models) ? json.models : [];
    const names = raw.map((m) => m.model || m.name || "").filter((s) => Boolean(s && s.trim()));
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

// src/utils/ai/aiClient.ts
var activeAbort = null;
var abortReason = null;
var UserAbort = class extends Error {
  constructor() {
    super("User aborted");
    this.name = "UserAbort";
  }
};
function abortActiveRequest() {
  if (activeAbort) {
    abortReason = "user";
    try {
      activeAbort.abort();
    } catch {
    }
  }
}
async function* queryAIStream(suggestionPanel, prompt, context) {
  try {
    const controller = new AbortController();
    abortActiveRequest();
    activeAbort = controller;
    abortReason = null;
    const timeout = setTimeout(() => {
      abortReason = "timeout";
      controller.abort();
    }, 12e4);
    const api = getCurrentApi(context);
    const model = getCurrentModel(context);
    const response = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: true }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!response.ok) {
      await handleAPIError(response);
      return;
    }
    if (!response.body) {
      vscode.window.showErrorMessage("AI response body is null.");
      return;
    }
    yield* streamResponseChunks(response.body);
    activeAbort = null;
    abortReason = null;
  } catch (error) {
    handleStreamError(suggestionPanel, error);
  }
}
async function handleAPIError(response) {
  const errorBody = await response.text();
  console.error(`AI API Error: ${response.status} ${response.statusText}`, errorBody);
  vscode.window.showErrorMessage("AI Server Error");
}
function handleStreamError(suggestionPanel, error) {
  if (error.name === "AbortError") {
    if (abortReason === "user") {
      suggestionPanel.webview.postMessage({ command: "aiStopped" });
      vscode.window.setStatusBarMessage("Stopped AI stream", 3e3);
      activeAbort = null;
      abortReason = null;
      throw new UserAbort();
    } else {
      vscode.window.showErrorMessage("AI request timed out.");
      suggestionPanel.webview.postMessage({ command: "aiError", error: "AI request timed out." });
      activeAbort = null;
      abortReason = null;
    }
  } else if (error instanceof TypeError && error.message.includes("fetch failed")) {
    console.error("Failed to connect to the AI server. Is the Ollama server running?");
    vscode.window.showErrorMessage("Failed to connect to AI. Make sure Ollama is running.", { modal: true });
    suggestionPanel.webview.postMessage({
      command: "aiError",
      error: "Failed to connect to AI"
    });
  } else {
    console.error("Failed to query AI:", error);
    suggestionPanel.webview.postMessage({
      command: "aiError",
      error: "Failed to query AI"
    });
  }
  throw error;
}
async function* streamResponseChunks(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      yield* flushRemainingBuffer(buffer);
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) {
        continue;
      }
      try {
        const jsonLine = JSON.parse(line);
        if (jsonLine.response) {
          yield jsonLine.response;
        }
        if (jsonLine.done) {
          return;
        }
      } catch (err) {
        console.error("Error parsing stream line:", err, line);
      }
    }
  }
}
function* flushRemainingBuffer(buffer) {
  if (!buffer.trim()) {
    return;
  }
  try {
    const jsonLine = JSON.parse(buffer);
    if (jsonLine.response) {
      yield jsonLine.response;
    }
  } catch (e) {
    console.error("Error parsing final buffered JSON line:", e, buffer);
  }
}

// src/utils/ai/applySuggestion.ts
var vscode2 = __toESM(require("vscode"));
async function applySuggestion(aiProvidedContent, originalSelectionForContext, documentUri, applyMode = "full" /* Full */) {
  if (!documentUri) {
    vscode2.window.showWarningMessage("Cannot apply suggestion: file context is missing.");
    return;
  }
  const doc = await vscode2.workspace.openTextDocument(documentUri);
  const editor = await vscode2.window.showTextDocument(doc, {
    preserveFocus: false,
    viewColumn: vscode2.window.activeTextEditor?.viewColumn || vscode2.ViewColumn.One
  });
  if (editor.document.uri.toString() !== documentUri.toString()) {
    vscode2.window.showErrorMessage("Error: The active editor does not match the document URI for applying changes.");
    return;
  }
  const targetRange = applyMode === "selection" /* Selection */ ? new vscode2.Range(originalSelectionForContext.start, originalSelectionForContext.end) : new vscode2.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end);
  const success = await editor.edit((editBuilder) => {
    editBuilder.replace(targetRange, aiProvidedContent);
  });
  if (!success) {
    vscode2.window.showErrorMessage("Failed to apply suggestion.");
    return;
  }
  editor.selection = originalSelectionForContext;
  editor.revealRange(originalSelectionForContext, vscode2.TextEditorRevealType.InCenterIfOutsideViewport);
  vscode2.window.showInformationMessage(
    applyMode === "selection" ? "AI suggestion applied (selected region updated)." : "AI suggestion applied (entire file updated)."
  );
}

// src/utils/ai/promptBuilder.ts
var vscode5 = __toESM(require("vscode"));

// src/utils/ai/preferencesManager.ts
var vscode3 = __toESM(require("vscode"));
var PREFERENCES_KEY = "aiPreferences";
async function setUserPreferences(context, documentUri) {
  const existing = await getUserPreferences(context);
  const input = await vscode3.window.showInputBox({
    prompt: "Enter your AI coding preferences (e.g., no renames, functional style)",
    value: existing || ""
  });
  await handlePreferenceUpdateFlow("saved", input, context, documentUri);
}
async function getUserPreferences(context) {
  return await context.globalState.get(PREFERENCES_KEY) || "";
}
async function showUserPreferences(context) {
  const preferences = await getUserPreferences(context);
  vscode3.window.showInformationMessage(
    preferences ? `Current AI Preferences:
${preferences}` : "No AI preferences set yet."
  );
}
async function clearUserPreferences(context, documentUri) {
  await context.globalState.update(PREFERENCES_KEY, "");
  await handlePreferenceUpdateFlow("cleared", "None set.", context, documentUri);
}
async function handlePreferenceUpdateFlow(actionMessage, input, context, documentUri) {
  if (input === void 0) {
    return;
  }
  await context.globalState.update(PREFERENCES_KEY, input.trim());
  await promptAndRunShowSuggestionCommand(actionMessage, documentUri);
}
async function promptAndRunShowSuggestionCommand(actionMessage, documentUri) {
  const userConfirmed = await showConfirmationPrompt(
    `Preferences ${actionMessage}! Do you want to run 'Show Suggestion' command?`
  );
  if (!userConfirmed) {
    return;
  }
  if (!documentUri) {
    vscode3.window.showWarningMessage("No document URI found to reopen.");
    return;
  }
  const doc = await vscode3.workspace.openTextDocument(vscode3.Uri.parse(documentUri));
  await vscode3.window.showTextDocument(doc, {
    preserveFocus: false,
    viewColumn: vscode3.ViewColumn.One
  });
  await vscode3.commands.executeCommand("extension.showSuggestion");
}
async function showConfirmationPrompt(message, yesLabel = "Yes", noLabel = "No") {
  const choice = await vscode3.window.showInformationMessage(message, yesLabel, noLabel);
  return choice === yesLabel;
}

// src/utils/ai/promptBuilder.ts
var CONTEXT_WINDOW_LINES = 200;
async function buildPrompt(selectedCode, wholeFileContent, fileName, selectionRange, context) {
  const fileLabel = fileName || "current file";
  const selectionInfo = selectionRange ? `The user has specifically selected lines ${selectionRange.start.line + 1}-${selectionRange.end.line + 1} for review.` : "";
  const userPreferences = await getUserPreferences(context);
  const preferencesBlock = `
---
USER PREFERENCES:
${userPreferences || "No preferences set."}
`;
  const allLines = wholeFileContent.split(/\r?\n/);
  const isBig = allLines.length >= BIG_FILE_LINE_THRESHOLD;
  let applyMode = "full" /* Full */;
  let fullContextForPrompt = wholeFileContent;
  if (isBig && selectionRange) {
    applyMode = "selection" /* Selection */;
    const start = Math.max(0, selectionRange.start.line - CONTEXT_WINDOW_LINES);
    const end = Math.min(allLines.length, selectionRange.end.line + CONTEXT_WINDOW_LINES);
    const header = allLines.slice(0, Math.min(200, allLines.length)).filter((line) => /^\s*(namespace|module|open)\b/.test(line)).join("\n");
    const surroundingCode = allLines.slice(start, end).join("\n");
    fullContextForPrompt = `${header}
...
${surroundingCode}
...`;
  }
  const baseTemplate = generatePromptTemplate(
    fileLabel,
    fullContextForPrompt,
    selectedCode,
    selectionInfo,
    preferencesBlock,
    applyMode
  );
  let finalPrompt = baseTemplate;
  const useRag = vscode5.workspace.getConfiguration("wsCodeReview").get("rag.enable", false);
  if (useRag) {
    try {
      const { getRagContext: getRagContext2 } = await Promise.resolve().then(() => (init_ragContext(), ragContext_exports));
      const ragCtx = await getRagContext2(context, selectedCode, 5);
      if (ragCtx && ragCtx.trim().length > 0) {
        finalPrompt = `RAG CONTEXT:
${ragCtx}

=== ORIGINAL TASK ===
${baseTemplate}`;
      }
    } catch (error) {
      console.warn("[RAG] skipped:", error);
    }
  }
  return { prompt: finalPrompt, applyMode };
}
function generatePromptTemplate(fileLabel, fullContextOrWindow, selectedSnippet, selectionContextInfo, preferencesBlock, applyMode) {
  const outputSpec = applyMode === "full" /* Full */ ? `- ### Improved Code (entire file)` : `- ### Improved Code (only the SELECTED region)`;
  const reminder = applyMode === "full" /* Full */ ? `REMINDER: You must output the entire file content with ONLY the selected region changed.` : `REMINDER: Output ONLY the selected region's new code. Do not include any other file content.`;
  return `You are a code review assistant specialized in F# and WebSharper.
Improve ONLY the SELECTED CODE using the provided context.
${preferencesBlock}
---
INSTRUCTIONS:
1. Focus ONLY on improving the SELECTED CODE (clarity, performance, maintainability).
2. Preserve other code in the file; do not change it unless strictly required for correctness.
3. Avoid unnecessary renames unless the user's preferences ask for it.
4. If removing code, ensure it's entirely unused.
5. Indentation must stay EXACTLY the same as in the original selection.
6. You MUST format your response as:
   - ### Summary of Issues (bullet list)
   ${outputSpec}
   - ### Explanation (bullet list)

**File Context Window \`${fileLabel}\`:**
\`\`\`fsharp
${fullContextOrWindow}
\`\`\`

**Selected Code \`${fileLabel}\`**:
${selectionContextInfo}
\`\`\`fsharp
${selectedSnippet}
\`\`\`

${reminder}
`.trim();
}

// src/utils/ai/index.ts
init_ragContext();

// src/utils/ui/outputChannel.ts
var vscode6 = __toESM(require("vscode"));
function showOutput(fileName, response) {
  const outputChannel = vscode6.window.createOutputChannel("WS Code Review");
  outputChannel.clear();
  outputChannel.appendLine(`File: ${fileName || "Unknown"}`);
  outputChannel.appendLine(`
${response}`);
  outputChannel.show(true);
}

// src/utils/ui/panelManager.ts
var panelInstance;
function getPanel() {
  return panelInstance;
}
function setPanel(panel) {
  panelInstance = panel;
}

// src/utils/ui/suggestionWebview.ts
var vscode10 = __toESM(require("vscode"));

// src/utils/webview/webviewContent.ts
var vscode7 = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
function getWebviewContent(webview, extensionUri, fileName, userPreferences) {
  const nonce = (/* @__PURE__ */ new Date()).getTime() + "" + (/* @__PURE__ */ new Date()).getMilliseconds();
  const htmlPath = vscode7.Uri.joinPath(extensionUri, "src", "utils", "webview", "index.html");
  let htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
  const diffJsSrcUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, "diff.min.js"));
  const markedJsSrcUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, "marked.min.js"));
  const githubDarkStyleUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, "highlightjs", "github-dark.min.css"));
  const highlightJsSrcUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, "highlightjs", "highlight.min.js"));
  const fSharpSrcUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, "highlightjs", "fsharp.min.js"));
  const cssUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, "src", "utils", "webview", "style.css"));
  const jsUri = webview.asWebviewUri(vscode7.Uri.joinPath(extensionUri, "src", "utils", "webview", "script.js"));
  htmlContent = htmlContent.replace("{{fileName}}", escapeHtml(fileName || "N/A")).replace("{{styleUri}}", cssUri.toString()).replace("{{scriptUri}}", jsUri.toString()).replace("{{diffJsSrc}}", diffJsSrcUri.toString()).replace("{{markedJsSrc}}", markedJsSrcUri.toString()).replace("{{githubDarkStyle}}", githubDarkStyleUri.toString()).replace("{{highlightJsSrc}}", highlightJsSrcUri.toString()).replace("{{fSharpSrc}}", fSharpSrcUri.toString()).replace(/{{cspSource}}/g, webview.cspSource).replace(/{{nonce}}/g, nonce);
  return htmlContent;
}
function escapeHtml(raw) {
  return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// src/utils/webview/webviewMessageHandler.ts
var vscode9 = __toESM(require("vscode"));

// src/utils/git/shadowRepo.ts
var vscode8 = __toESM(require("vscode"));
var path = __toESM(require("node:path"));

// node_modules/simple-git/dist/esm/index.js
var import_node_buffer = require("node:buffer");
var import_file_exists = __toESM(require_dist(), 1);
var import_debug = __toESM(require_src(), 1);
var import_child_process = require("child_process");
var import_promise_deferred = __toESM(require_dist2(), 1);
var import_promise_deferred2 = __toESM(require_dist2(), 1);
var import_node_events = require("node:events");
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __esm2 = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
};
var __commonJS2 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var __copyProps2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp2.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
function pathspec(...paths) {
  const key = new String(paths);
  cache2.set(key, paths);
  return key;
}
function isPathSpec(path3) {
  return path3 instanceof String && cache2.has(path3);
}
function toPaths(pathSpec) {
  return cache2.get(pathSpec) || [];
}
var cache2;
var init_pathspec = __esm2({
  "src/lib/args/pathspec.ts"() {
    "use strict";
    cache2 = /* @__PURE__ */ new WeakMap();
  }
});
var GitError;
var init_git_error = __esm2({
  "src/lib/errors/git-error.ts"() {
    "use strict";
    GitError = class extends Error {
      constructor(task, message) {
        super(message);
        this.task = task;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
  }
});
var GitResponseError;
var init_git_response_error = __esm2({
  "src/lib/errors/git-response-error.ts"() {
    "use strict";
    init_git_error();
    GitResponseError = class extends GitError {
      constructor(git, message) {
        super(void 0, message || String(git));
        this.git = git;
      }
    };
  }
});
var TaskConfigurationError;
var init_task_configuration_error = __esm2({
  "src/lib/errors/task-configuration-error.ts"() {
    "use strict";
    init_git_error();
    TaskConfigurationError = class extends GitError {
      constructor(message) {
        super(void 0, message);
      }
    };
  }
});
function asFunction(source) {
  if (typeof source !== "function") {
    return NOOP;
  }
  return source;
}
function isUserFunction(source) {
  return typeof source === "function" && source !== NOOP;
}
function splitOn(input, char) {
  const index = input.indexOf(char);
  if (index <= 0) {
    return [input, ""];
  }
  return [input.substr(0, index), input.substr(index + 1)];
}
function first(input, offset = 0) {
  return isArrayLike(input) && input.length > offset ? input[offset] : void 0;
}
function last2(input, offset = 0) {
  if (isArrayLike(input) && input.length > offset) {
    return input[input.length - 1 - offset];
  }
}
function isArrayLike(input) {
  return !!(input && typeof input.length === "number");
}
function toLinesWithContent(input = "", trimmed2 = true, separator = "\n") {
  return input.split(separator).reduce((output, line) => {
    const lineContent = trimmed2 ? line.trim() : line;
    if (lineContent) {
      output.push(lineContent);
    }
    return output;
  }, []);
}
function forEachLineWithContent(input, callback) {
  return toLinesWithContent(input, true).map((line) => callback(line));
}
function folderExists(path3) {
  return (0, import_file_exists.exists)(path3, import_file_exists.FOLDER);
}
function append(target, item) {
  if (Array.isArray(target)) {
    if (!target.includes(item)) {
      target.push(item);
    }
  } else {
    target.add(item);
  }
  return item;
}
function including(target, item) {
  if (Array.isArray(target) && !target.includes(item)) {
    target.push(item);
  }
  return target;
}
function remove2(target, item) {
  if (Array.isArray(target)) {
    const index = target.indexOf(item);
    if (index >= 0) {
      target.splice(index, 1);
    }
  } else {
    target.delete(item);
  }
  return item;
}
function asArray(source) {
  return Array.isArray(source) ? source : [source];
}
function asCamelCase(str) {
  return str.replace(/[\s-]+(.)/g, (_all, chr) => {
    return chr.toUpperCase();
  });
}
function asStringArray(source) {
  return asArray(source).map(String);
}
function asNumber(source, onNaN = 0) {
  if (source == null) {
    return onNaN;
  }
  const num = parseInt(source, 10);
  return isNaN(num) ? onNaN : num;
}
function prefixedArray(input, prefix) {
  const output = [];
  for (let i = 0, max = input.length; i < max; i++) {
    output.push(prefix, input[i]);
  }
  return output;
}
function bufferToString(input) {
  return (Array.isArray(input) ? import_node_buffer.Buffer.concat(input) : input).toString("utf-8");
}
function pick(source, properties) {
  return Object.assign(
    {},
    ...properties.map((property) => property in source ? { [property]: source[property] } : {})
  );
}
function delay(duration = 0) {
  return new Promise((done) => setTimeout(done, duration));
}
function orVoid(input) {
  if (input === false) {
    return void 0;
  }
  return input;
}
var NULL;
var NOOP;
var objectToString;
var init_util = __esm2({
  "src/lib/utils/util.ts"() {
    "use strict";
    NULL = "\0";
    NOOP = () => {
    };
    objectToString = Object.prototype.toString.call.bind(Object.prototype.toString);
  }
});
function filterType(input, filter, def) {
  if (filter(input)) {
    return input;
  }
  return arguments.length > 2 ? def : void 0;
}
function filterPrimitives(input, omit) {
  const type = isPathSpec(input) ? "string" : typeof input;
  return /number|string|boolean/.test(type) && (!omit || !omit.includes(type));
}
function filterPlainObject(input) {
  return !!input && objectToString(input) === "[object Object]";
}
function filterFunction(input) {
  return typeof input === "function";
}
var filterArray;
var filterString;
var filterStringArray;
var filterStringOrStringArray;
var filterHasLength;
var init_argument_filters = __esm2({
  "src/lib/utils/argument-filters.ts"() {
    "use strict";
    init_util();
    init_pathspec();
    filterArray = (input) => {
      return Array.isArray(input);
    };
    filterString = (input) => {
      return typeof input === "string";
    };
    filterStringArray = (input) => {
      return Array.isArray(input) && input.every(filterString);
    };
    filterStringOrStringArray = (input) => {
      return filterString(input) || Array.isArray(input) && input.every(filterString);
    };
    filterHasLength = (input) => {
      if (input == null || "number|boolean|function".includes(typeof input)) {
        return false;
      }
      return Array.isArray(input) || typeof input === "string" || typeof input.length === "number";
    };
  }
});
var ExitCodes;
var init_exit_codes = __esm2({
  "src/lib/utils/exit-codes.ts"() {
    "use strict";
    ExitCodes = /* @__PURE__ */ ((ExitCodes2) => {
      ExitCodes2[ExitCodes2["SUCCESS"] = 0] = "SUCCESS";
      ExitCodes2[ExitCodes2["ERROR"] = 1] = "ERROR";
      ExitCodes2[ExitCodes2["NOT_FOUND"] = -2] = "NOT_FOUND";
      ExitCodes2[ExitCodes2["UNCLEAN"] = 128] = "UNCLEAN";
      return ExitCodes2;
    })(ExitCodes || {});
  }
});
var GitOutputStreams;
var init_git_output_streams = __esm2({
  "src/lib/utils/git-output-streams.ts"() {
    "use strict";
    GitOutputStreams = class _GitOutputStreams {
      constructor(stdOut, stdErr) {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
      }
      asStrings() {
        return new _GitOutputStreams(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
      }
    };
  }
});
var LineParser;
var RemoteLineParser;
var init_line_parser = __esm2({
  "src/lib/utils/line-parser.ts"() {
    "use strict";
    LineParser = class {
      constructor(regExp, useMatches) {
        this.matches = [];
        this.parse = (line, target) => {
          this.resetMatches();
          if (!this._regExp.every((reg, index) => this.addMatch(reg, index, line(index)))) {
            return false;
          }
          return this.useMatches(target, this.prepareMatches()) !== false;
        };
        this._regExp = Array.isArray(regExp) ? regExp : [regExp];
        if (useMatches) {
          this.useMatches = useMatches;
        }
      }
      // @ts-ignore
      useMatches(target, match) {
        throw new Error(`LineParser:useMatches not implemented`);
      }
      resetMatches() {
        this.matches.length = 0;
      }
      prepareMatches() {
        return this.matches;
      }
      addMatch(reg, index, line) {
        const matched = line && reg.exec(line);
        if (matched) {
          this.pushMatch(index, matched);
        }
        return !!matched;
      }
      pushMatch(_index, matched) {
        this.matches.push(...matched.slice(1));
      }
    };
    RemoteLineParser = class extends LineParser {
      addMatch(reg, index, line) {
        return /^remote:\s/.test(String(line)) && super.addMatch(reg, index, line);
      }
      pushMatch(index, matched) {
        if (index > 0 || matched.length > 1) {
          super.pushMatch(index, matched);
        }
      }
    };
  }
});
function createInstanceConfig(...options) {
  const baseDir = process.cwd();
  const config = Object.assign(
    { baseDir, ...defaultOptions2 },
    ...options.filter((o) => typeof o === "object" && o)
  );
  config.baseDir = config.baseDir || baseDir;
  config.trimmed = config.trimmed === true;
  return config;
}
var defaultOptions2;
var init_simple_git_options = __esm2({
  "src/lib/utils/simple-git-options.ts"() {
    "use strict";
    defaultOptions2 = {
      binary: "git",
      maxConcurrentProcesses: 5,
      config: [],
      trimmed: false
    };
  }
});
function appendTaskOptions(options, commands8 = []) {
  if (!filterPlainObject(options)) {
    return commands8;
  }
  return Object.keys(options).reduce((commands22, key) => {
    const value = options[key];
    if (isPathSpec(value)) {
      commands22.push(value);
    } else if (filterPrimitives(value, ["boolean"])) {
      commands22.push(key + "=" + value);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (!filterPrimitives(v, ["string", "number"])) {
          commands22.push(key + "=" + v);
        }
      }
    } else {
      commands22.push(key);
    }
    return commands22;
  }, commands8);
}
function getTrailingOptions(args, initialPrimitive = 0, objectOnly = false) {
  const command = [];
  for (let i = 0, max = initialPrimitive < 0 ? args.length : initialPrimitive; i < max; i++) {
    if ("string|number".includes(typeof args[i])) {
      command.push(String(args[i]));
    }
  }
  appendTaskOptions(trailingOptionsArgument(args), command);
  if (!objectOnly) {
    command.push(...trailingArrayArgument(args));
  }
  return command;
}
function trailingArrayArgument(args) {
  const hasTrailingCallback = typeof last2(args) === "function";
  return filterType(last2(args, hasTrailingCallback ? 1 : 0), filterArray, []);
}
function trailingOptionsArgument(args) {
  const hasTrailingCallback = filterFunction(last2(args));
  return filterType(last2(args, hasTrailingCallback ? 1 : 0), filterPlainObject);
}
function trailingFunctionArgument(args, includeNoop = true) {
  const callback = asFunction(last2(args));
  return includeNoop || isUserFunction(callback) ? callback : void 0;
}
var init_task_options = __esm2({
  "src/lib/utils/task-options.ts"() {
    "use strict";
    init_argument_filters();
    init_util();
    init_pathspec();
  }
});
function callTaskParser(parser4, streams) {
  return parser4(streams.stdOut, streams.stdErr);
}
function parseStringResponse(result, parsers12, texts, trim = true) {
  asArray(texts).forEach((text) => {
    for (let lines = toLinesWithContent(text, trim), i = 0, max = lines.length; i < max; i++) {
      const line = (offset = 0) => {
        if (i + offset >= max) {
          return;
        }
        return lines[i + offset];
      };
      parsers12.some(({ parse }) => parse(line, result));
    }
  });
  return result;
}
var init_task_parser = __esm2({
  "src/lib/utils/task-parser.ts"() {
    "use strict";
    init_util();
  }
});
var utils_exports = {};
__export2(utils_exports, {
  ExitCodes: () => ExitCodes,
  GitOutputStreams: () => GitOutputStreams,
  LineParser: () => LineParser,
  NOOP: () => NOOP,
  NULL: () => NULL,
  RemoteLineParser: () => RemoteLineParser,
  append: () => append,
  appendTaskOptions: () => appendTaskOptions,
  asArray: () => asArray,
  asCamelCase: () => asCamelCase,
  asFunction: () => asFunction,
  asNumber: () => asNumber,
  asStringArray: () => asStringArray,
  bufferToString: () => bufferToString,
  callTaskParser: () => callTaskParser,
  createInstanceConfig: () => createInstanceConfig,
  delay: () => delay,
  filterArray: () => filterArray,
  filterFunction: () => filterFunction,
  filterHasLength: () => filterHasLength,
  filterPlainObject: () => filterPlainObject,
  filterPrimitives: () => filterPrimitives,
  filterString: () => filterString,
  filterStringArray: () => filterStringArray,
  filterStringOrStringArray: () => filterStringOrStringArray,
  filterType: () => filterType,
  first: () => first,
  folderExists: () => folderExists,
  forEachLineWithContent: () => forEachLineWithContent,
  getTrailingOptions: () => getTrailingOptions,
  including: () => including,
  isUserFunction: () => isUserFunction,
  last: () => last2,
  objectToString: () => objectToString,
  orVoid: () => orVoid,
  parseStringResponse: () => parseStringResponse,
  pick: () => pick,
  prefixedArray: () => prefixedArray,
  remove: () => remove2,
  splitOn: () => splitOn,
  toLinesWithContent: () => toLinesWithContent,
  trailingFunctionArgument: () => trailingFunctionArgument,
  trailingOptionsArgument: () => trailingOptionsArgument
});
var init_utils = __esm2({
  "src/lib/utils/index.ts"() {
    "use strict";
    init_argument_filters();
    init_exit_codes();
    init_git_output_streams();
    init_line_parser();
    init_simple_git_options();
    init_task_options();
    init_task_parser();
    init_util();
  }
});
var check_is_repo_exports = {};
__export2(check_is_repo_exports, {
  CheckRepoActions: () => CheckRepoActions,
  checkIsBareRepoTask: () => checkIsBareRepoTask,
  checkIsRepoRootTask: () => checkIsRepoRootTask,
  checkIsRepoTask: () => checkIsRepoTask
});
function checkIsRepoTask(action) {
  switch (action) {
    case "bare":
      return checkIsBareRepoTask();
    case "root":
      return checkIsRepoRootTask();
  }
  const commands8 = ["rev-parse", "--is-inside-work-tree"];
  return {
    commands: commands8,
    format: "utf-8",
    onError,
    parser
  };
}
function checkIsRepoRootTask() {
  const commands8 = ["rev-parse", "--git-dir"];
  return {
    commands: commands8,
    format: "utf-8",
    onError,
    parser(path3) {
      return /^\.(git)?$/.test(path3.trim());
    }
  };
}
function checkIsBareRepoTask() {
  const commands8 = ["rev-parse", "--is-bare-repository"];
  return {
    commands: commands8,
    format: "utf-8",
    onError,
    parser
  };
}
function isNotRepoMessage(error) {
  return /(Not a git repository|Kein Git-Repository)/i.test(String(error));
}
var CheckRepoActions;
var onError;
var parser;
var init_check_is_repo = __esm2({
  "src/lib/tasks/check-is-repo.ts"() {
    "use strict";
    init_utils();
    CheckRepoActions = /* @__PURE__ */ ((CheckRepoActions2) => {
      CheckRepoActions2["BARE"] = "bare";
      CheckRepoActions2["IN_TREE"] = "tree";
      CheckRepoActions2["IS_REPO_ROOT"] = "root";
      return CheckRepoActions2;
    })(CheckRepoActions || {});
    onError = ({ exitCode }, error, done, fail) => {
      if (exitCode === 128 && isNotRepoMessage(error)) {
        return done(Buffer.from("false"));
      }
      fail(error);
    };
    parser = (text) => {
      return text.trim() === "true";
    };
  }
});
function cleanSummaryParser(dryRun, text) {
  const summary = new CleanResponse(dryRun);
  const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
  toLinesWithContent(text).forEach((line) => {
    const removed = line.replace(regexp, "");
    summary.paths.push(removed);
    (isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
  });
  return summary;
}
var CleanResponse;
var removalRegexp;
var dryRunRemovalRegexp;
var isFolderRegexp;
var init_CleanSummary = __esm2({
  "src/lib/responses/CleanSummary.ts"() {
    "use strict";
    init_utils();
    CleanResponse = class {
      constructor(dryRun) {
        this.dryRun = dryRun;
        this.paths = [];
        this.files = [];
        this.folders = [];
      }
    };
    removalRegexp = /^[a-z]+\s*/i;
    dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
    isFolderRegexp = /\/$/;
  }
});
var task_exports = {};
__export2(task_exports, {
  EMPTY_COMMANDS: () => EMPTY_COMMANDS,
  adhocExecTask: () => adhocExecTask,
  configurationErrorTask: () => configurationErrorTask,
  isBufferTask: () => isBufferTask,
  isEmptyTask: () => isEmptyTask,
  straightThroughBufferTask: () => straightThroughBufferTask,
  straightThroughStringTask: () => straightThroughStringTask
});
function adhocExecTask(parser4) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser: parser4
  };
}
function configurationErrorTask(error) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser() {
      throw typeof error === "string" ? new TaskConfigurationError(error) : error;
    }
  };
}
function straightThroughStringTask(commands8, trimmed2 = false) {
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return trimmed2 ? String(text).trim() : text;
    }
  };
}
function straightThroughBufferTask(commands8) {
  return {
    commands: commands8,
    format: "buffer",
    parser(buffer) {
      return buffer;
    }
  };
}
function isBufferTask(task) {
  return task.format === "buffer";
}
function isEmptyTask(task) {
  return task.format === "empty" || !task.commands.length;
}
var EMPTY_COMMANDS;
var init_task = __esm2({
  "src/lib/tasks/task.ts"() {
    "use strict";
    init_task_configuration_error();
    EMPTY_COMMANDS = [];
  }
});
var clean_exports = {};
__export2(clean_exports, {
  CONFIG_ERROR_INTERACTIVE_MODE: () => CONFIG_ERROR_INTERACTIVE_MODE,
  CONFIG_ERROR_MODE_REQUIRED: () => CONFIG_ERROR_MODE_REQUIRED,
  CONFIG_ERROR_UNKNOWN_OPTION: () => CONFIG_ERROR_UNKNOWN_OPTION,
  CleanOptions: () => CleanOptions,
  cleanTask: () => cleanTask,
  cleanWithOptionsTask: () => cleanWithOptionsTask,
  isCleanOptionsArray: () => isCleanOptionsArray
});
function cleanWithOptionsTask(mode, customArgs) {
  const { cleanMode, options, valid } = getCleanOptions(mode);
  if (!cleanMode) {
    return configurationErrorTask(CONFIG_ERROR_MODE_REQUIRED);
  }
  if (!valid.options) {
    return configurationErrorTask(CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode));
  }
  options.push(...customArgs);
  if (options.some(isInteractiveMode)) {
    return configurationErrorTask(CONFIG_ERROR_INTERACTIVE_MODE);
  }
  return cleanTask(cleanMode, options);
}
function cleanTask(mode, customArgs) {
  const commands8 = ["clean", `-${mode}`, ...customArgs];
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return cleanSummaryParser(mode === "n", text);
    }
  };
}
function isCleanOptionsArray(input) {
  return Array.isArray(input) && input.every((test) => CleanOptionValues.has(test));
}
function getCleanOptions(input) {
  let cleanMode;
  let options = [];
  let valid = { cleanMode: false, options: true };
  input.replace(/[^a-z]i/g, "").split("").forEach((char) => {
    if (isCleanMode(char)) {
      cleanMode = char;
      valid.cleanMode = true;
    } else {
      valid.options = valid.options && isKnownOption(options[options.length] = `-${char}`);
    }
  });
  return {
    cleanMode,
    options,
    valid
  };
}
function isCleanMode(cleanMode) {
  return cleanMode === "f" || cleanMode === "n";
}
function isKnownOption(option) {
  return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
  if (/^-[^\-]/.test(option)) {
    return option.indexOf("i") > 0;
  }
  return option === "--interactive";
}
var CONFIG_ERROR_INTERACTIVE_MODE;
var CONFIG_ERROR_MODE_REQUIRED;
var CONFIG_ERROR_UNKNOWN_OPTION;
var CleanOptions;
var CleanOptionValues;
var init_clean = __esm2({
  "src/lib/tasks/clean.ts"() {
    "use strict";
    init_CleanSummary();
    init_utils();
    init_task();
    CONFIG_ERROR_INTERACTIVE_MODE = "Git clean interactive mode is not supported";
    CONFIG_ERROR_MODE_REQUIRED = 'Git clean mode parameter ("n" or "f") is required';
    CONFIG_ERROR_UNKNOWN_OPTION = "Git clean unknown option found in: ";
    CleanOptions = /* @__PURE__ */ ((CleanOptions2) => {
      CleanOptions2["DRY_RUN"] = "n";
      CleanOptions2["FORCE"] = "f";
      CleanOptions2["IGNORED_INCLUDED"] = "x";
      CleanOptions2["IGNORED_ONLY"] = "X";
      CleanOptions2["EXCLUDING"] = "e";
      CleanOptions2["QUIET"] = "q";
      CleanOptions2["RECURSIVE"] = "d";
      return CleanOptions2;
    })(CleanOptions || {});
    CleanOptionValues = /* @__PURE__ */ new Set([
      "i",
      ...asStringArray(Object.values(CleanOptions))
    ]);
  }
});
function configListParser(text) {
  const config = new ConfigList();
  for (const item of configParser(text)) {
    config.addValue(item.file, String(item.key), item.value);
  }
  return config;
}
function configGetParser(text, key) {
  let value = null;
  const values = [];
  const scopes = /* @__PURE__ */ new Map();
  for (const item of configParser(text, key)) {
    if (item.key !== key) {
      continue;
    }
    values.push(value = item.value);
    if (!scopes.has(item.file)) {
      scopes.set(item.file, []);
    }
    scopes.get(item.file).push(value);
  }
  return {
    key,
    paths: Array.from(scopes.keys()),
    scopes,
    value,
    values
  };
}
function configFilePath(filePath) {
  return filePath.replace(/^(file):/, "");
}
function* configParser(text, requestedKey = null) {
  const lines = text.split("\0");
  for (let i = 0, max = lines.length - 1; i < max; ) {
    const file = configFilePath(lines[i++]);
    let value = lines[i++];
    let key = requestedKey;
    if (value.includes("\n")) {
      const line = splitOn(value, "\n");
      key = line[0];
      value = line[1];
    }
    yield { file, key, value };
  }
}
var ConfigList;
var init_ConfigList = __esm2({
  "src/lib/responses/ConfigList.ts"() {
    "use strict";
    init_utils();
    ConfigList = class {
      constructor() {
        this.files = [];
        this.values = /* @__PURE__ */ Object.create(null);
      }
      get all() {
        if (!this._all) {
          this._all = this.files.reduce((all, file) => {
            return Object.assign(all, this.values[file]);
          }, {});
        }
        return this._all;
      }
      addFile(file) {
        if (!(file in this.values)) {
          const latest = last2(this.files);
          this.values[file] = latest ? Object.create(this.values[latest]) : {};
          this.files.push(file);
        }
        return this.values[file];
      }
      addValue(file, key, value) {
        const values = this.addFile(file);
        if (!values.hasOwnProperty(key)) {
          values[key] = value;
        } else if (Array.isArray(values[key])) {
          values[key].push(value);
        } else {
          values[key] = [values[key], value];
        }
        this._all = void 0;
      }
    };
  }
});
function asConfigScope(scope, fallback) {
  if (typeof scope === "string" && GitConfigScope.hasOwnProperty(scope)) {
    return scope;
  }
  return fallback;
}
function addConfigTask(key, value, append2, scope) {
  const commands8 = ["config", `--${scope}`];
  if (append2) {
    commands8.push("--add");
  }
  commands8.push(key, value);
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return text;
    }
  };
}
function getConfigTask(key, scope) {
  const commands8 = ["config", "--null", "--show-origin", "--get-all", key];
  if (scope) {
    commands8.splice(1, 0, `--${scope}`);
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return configGetParser(text, key);
    }
  };
}
function listConfigTask(scope) {
  const commands8 = ["config", "--list", "--show-origin", "--null"];
  if (scope) {
    commands8.push(`--${scope}`);
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return configListParser(text);
    }
  };
}
function config_default() {
  return {
    addConfig(key, value, ...rest) {
      return this._runTask(
        addConfigTask(
          key,
          value,
          rest[0] === true,
          asConfigScope(
            rest[1],
            "local"
            /* local */
          )
        ),
        trailingFunctionArgument(arguments)
      );
    },
    getConfig(key, scope) {
      return this._runTask(
        getConfigTask(key, asConfigScope(scope, void 0)),
        trailingFunctionArgument(arguments)
      );
    },
    listConfig(...rest) {
      return this._runTask(
        listConfigTask(asConfigScope(rest[0], void 0)),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var GitConfigScope;
var init_config = __esm2({
  "src/lib/tasks/config.ts"() {
    "use strict";
    init_ConfigList();
    init_utils();
    GitConfigScope = /* @__PURE__ */ ((GitConfigScope2) => {
      GitConfigScope2["system"] = "system";
      GitConfigScope2["global"] = "global";
      GitConfigScope2["local"] = "local";
      GitConfigScope2["worktree"] = "worktree";
      return GitConfigScope2;
    })(GitConfigScope || {});
  }
});
function isDiffNameStatus(input) {
  return diffNameStatus.has(input);
}
var DiffNameStatus;
var diffNameStatus;
var init_diff_name_status = __esm2({
  "src/lib/tasks/diff-name-status.ts"() {
    "use strict";
    DiffNameStatus = /* @__PURE__ */ ((DiffNameStatus2) => {
      DiffNameStatus2["ADDED"] = "A";
      DiffNameStatus2["COPIED"] = "C";
      DiffNameStatus2["DELETED"] = "D";
      DiffNameStatus2["MODIFIED"] = "M";
      DiffNameStatus2["RENAMED"] = "R";
      DiffNameStatus2["CHANGED"] = "T";
      DiffNameStatus2["UNMERGED"] = "U";
      DiffNameStatus2["UNKNOWN"] = "X";
      DiffNameStatus2["BROKEN"] = "B";
      return DiffNameStatus2;
    })(DiffNameStatus || {});
    diffNameStatus = new Set(Object.values(DiffNameStatus));
  }
});
function grepQueryBuilder(...params) {
  return new GrepQuery().param(...params);
}
function parseGrep(grep) {
  const paths = /* @__PURE__ */ new Set();
  const results = {};
  forEachLineWithContent(grep, (input) => {
    const [path3, line, preview] = input.split(NULL);
    paths.add(path3);
    (results[path3] = results[path3] || []).push({
      line: asNumber(line),
      path: path3,
      preview
    });
  });
  return {
    paths,
    results
  };
}
function grep_default() {
  return {
    grep(searchTerm) {
      const then = trailingFunctionArgument(arguments);
      const options = getTrailingOptions(arguments);
      for (const option of disallowedOptions) {
        if (options.includes(option)) {
          return this._runTask(
            configurationErrorTask(`git.grep: use of "${option}" is not supported.`),
            then
          );
        }
      }
      if (typeof searchTerm === "string") {
        searchTerm = grepQueryBuilder().param(searchTerm);
      }
      const commands8 = ["grep", "--null", "-n", "--full-name", ...options, ...searchTerm];
      return this._runTask(
        {
          commands: commands8,
          format: "utf-8",
          parser(stdOut) {
            return parseGrep(stdOut);
          }
        },
        then
      );
    }
  };
}
var disallowedOptions;
var Query;
var _a;
var GrepQuery;
var init_grep = __esm2({
  "src/lib/tasks/grep.ts"() {
    "use strict";
    init_utils();
    init_task();
    disallowedOptions = ["-h"];
    Query = Symbol("grepQuery");
    GrepQuery = class {
      constructor() {
        this[_a] = [];
      }
      *[(_a = Query, Symbol.iterator)]() {
        for (const query of this[Query]) {
          yield query;
        }
      }
      and(...and) {
        and.length && this[Query].push("--and", "(", ...prefixedArray(and, "-e"), ")");
        return this;
      }
      param(...param) {
        this[Query].push(...prefixedArray(param, "-e"));
        return this;
      }
    };
  }
});
var reset_exports = {};
__export2(reset_exports, {
  ResetMode: () => ResetMode,
  getResetMode: () => getResetMode,
  resetTask: () => resetTask
});
function resetTask(mode, customArgs) {
  const commands8 = ["reset"];
  if (isValidResetMode(mode)) {
    commands8.push(`--${mode}`);
  }
  commands8.push(...customArgs);
  return straightThroughStringTask(commands8);
}
function getResetMode(mode) {
  if (isValidResetMode(mode)) {
    return mode;
  }
  switch (typeof mode) {
    case "string":
    case "undefined":
      return "soft";
  }
  return;
}
function isValidResetMode(mode) {
  return ResetModes.includes(mode);
}
var ResetMode;
var ResetModes;
var init_reset = __esm2({
  "src/lib/tasks/reset.ts"() {
    "use strict";
    init_task();
    ResetMode = /* @__PURE__ */ ((ResetMode2) => {
      ResetMode2["MIXED"] = "mixed";
      ResetMode2["SOFT"] = "soft";
      ResetMode2["HARD"] = "hard";
      ResetMode2["MERGE"] = "merge";
      ResetMode2["KEEP"] = "keep";
      return ResetMode2;
    })(ResetMode || {});
    ResetModes = Array.from(Object.values(ResetMode));
  }
});
function createLog() {
  return (0, import_debug.default)("simple-git");
}
function prefixedLogger(to, prefix, forward) {
  if (!prefix || !String(prefix).replace(/\s*/, "")) {
    return !forward ? to : (message, ...args) => {
      to(message, ...args);
      forward(message, ...args);
    };
  }
  return (message, ...args) => {
    to(`%s ${message}`, prefix, ...args);
    if (forward) {
      forward(message, ...args);
    }
  };
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
  if (typeof name === "string") {
    return name;
  }
  const childNamespace = childDebugger && childDebugger.namespace || "";
  if (childNamespace.startsWith(parentNamespace)) {
    return childNamespace.substr(parentNamespace.length + 1);
  }
  return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = createLog()) {
  const labelPrefix = label && `[${label}]` || "";
  const spawned = [];
  const debugDebugger = typeof verbose === "string" ? infoDebugger.extend(verbose) : verbose;
  const key = childLoggerName(filterType(verbose, filterString), debugDebugger, infoDebugger);
  return step(initialStep);
  function sibling(name, initial) {
    return append(
      spawned,
      createLogger(label, key.replace(/^[^:]+/, name), initial, infoDebugger)
    );
  }
  function step(phase) {
    const stepPrefix = phase && `[${phase}]` || "";
    const debug2 = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || NOOP;
    const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug2);
    return Object.assign(debugDebugger ? debug2 : info, {
      label,
      sibling,
      info,
      step
    });
  }
}
var init_git_logger = __esm2({
  "src/lib/git-logger.ts"() {
    "use strict";
    init_utils();
    import_debug.default.formatters.L = (value) => String(filterHasLength(value) ? value.length : "-");
    import_debug.default.formatters.B = (value) => {
      if (Buffer.isBuffer(value)) {
        return value.toString("utf8");
      }
      return objectToString(value);
    };
  }
});
var TasksPendingQueue;
var init_tasks_pending_queue = __esm2({
  "src/lib/runners/tasks-pending-queue.ts"() {
    "use strict";
    init_git_error();
    init_git_logger();
    TasksPendingQueue = class _TasksPendingQueue {
      constructor(logLabel = "GitExecutor") {
        this.logLabel = logLabel;
        this._queue = /* @__PURE__ */ new Map();
      }
      withProgress(task) {
        return this._queue.get(task);
      }
      createProgress(task) {
        const name = _TasksPendingQueue.getName(task.commands[0]);
        const logger = createLogger(this.logLabel, name);
        return {
          task,
          logger,
          name
        };
      }
      push(task) {
        const progress = this.createProgress(task);
        progress.logger("Adding task to the queue, commands = %o", task.commands);
        this._queue.set(task, progress);
        return progress;
      }
      fatal(err) {
        for (const [task, { logger }] of Array.from(this._queue.entries())) {
          if (task === err.task) {
            logger.info(`Failed %o`, err);
            logger(
              `Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`
            );
          } else {
            logger.info(
              `A fatal exception occurred in a previous task, the queue has been purged: %o`,
              err.message
            );
          }
          this.complete(task);
        }
        if (this._queue.size !== 0) {
          throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
        }
      }
      complete(task) {
        const progress = this.withProgress(task);
        if (progress) {
          this._queue.delete(task);
        }
      }
      attempt(task) {
        const progress = this.withProgress(task);
        if (!progress) {
          throw new GitError(void 0, "TasksPendingQueue: attempt called for an unknown task");
        }
        progress.logger("Starting task");
        return progress;
      }
      static getName(name = "empty") {
        return `task:${name}:${++_TasksPendingQueue.counter}`;
      }
      static {
        this.counter = 0;
      }
    };
  }
});
function pluginContext(task, commands8) {
  return {
    method: first(task.commands) || "",
    commands: commands8
  };
}
function onErrorReceived(target, logger) {
  return (err) => {
    logger(`[ERROR] child process exception %o`, err);
    target.push(Buffer.from(String(err.stack), "ascii"));
  };
}
function onDataReceived(target, name, logger, output) {
  return (buffer) => {
    logger(`%s received %L bytes`, name, buffer);
    output(`%B`, buffer);
    target.push(buffer);
  };
}
var GitExecutorChain;
var init_git_executor_chain = __esm2({
  "src/lib/runners/git-executor-chain.ts"() {
    "use strict";
    init_git_error();
    init_task();
    init_utils();
    init_tasks_pending_queue();
    GitExecutorChain = class {
      constructor(_executor, _scheduler, _plugins) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = Promise.resolve();
        this._queue = new TasksPendingQueue();
      }
      get cwd() {
        return this._cwd || this._executor.cwd;
      }
      set cwd(cwd) {
        this._cwd = cwd;
      }
      get env() {
        return this._executor.env;
      }
      get outputHandler() {
        return this._executor.outputHandler;
      }
      chain() {
        return this;
      }
      push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
      }
      async attemptTask(task) {
        const onScheduleComplete = await this._scheduler.next();
        const onQueueComplete = () => this._queue.complete(task);
        try {
          const { logger } = this._queue.attempt(task);
          return await (isEmptyTask(task) ? this.attemptEmptyTask(task, logger) : this.attemptRemoteTask(task, logger));
        } catch (e) {
          throw this.onFatalException(task, e);
        } finally {
          onQueueComplete();
          onScheduleComplete();
        }
      }
      onFatalException(task, e) {
        const gitError = e instanceof GitError ? Object.assign(e, { task }) : new GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
      }
      async attemptRemoteTask(task, logger) {
        const binary = this._plugins.exec("spawn.binary", "", pluginContext(task, task.commands));
        const args = this._plugins.exec(
          "spawn.args",
          [...task.commands],
          pluginContext(task, task.commands)
        );
        const raw = await this.gitResponse(
          task,
          binary,
          args,
          this.outputHandler,
          logger.step("SPAWN")
        );
        const outputStreams = await this.handleTaskData(task, args, raw, logger.step("HANDLE"));
        logger(`passing response to task's parser as a %s`, task.format);
        if (isBufferTask(task)) {
          return callTaskParser(task.parser, outputStreams);
        }
        return callTaskParser(task.parser, outputStreams.asStrings());
      }
      async attemptEmptyTask(task, logger) {
        logger(`empty task bypassing child process to call to task's parser`);
        return task.parser(this);
      }
      handleTaskData(task, args, result, logger) {
        const { exitCode, rejection, stdOut, stdErr } = result;
        return new Promise((done, fail) => {
          logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
          const { error } = this._plugins.exec(
            "task.error",
            { error: rejection },
            {
              ...pluginContext(task, args),
              ...result
            }
          );
          if (error && task.onError) {
            logger.info(`exitCode=%s handling with custom error handler`);
            return task.onError(
              result,
              error,
              (newStdOut) => {
                logger.info(`custom error handler treated as success`);
                logger(`custom error returned a %s`, objectToString(newStdOut));
                done(
                  new GitOutputStreams(
                    Array.isArray(newStdOut) ? Buffer.concat(newStdOut) : newStdOut,
                    Buffer.concat(stdErr)
                  )
                );
              },
              fail
            );
          }
          if (error) {
            logger.info(
              `handling as error: exitCode=%s stdErr=%s rejection=%o`,
              exitCode,
              stdErr.length,
              rejection
            );
            return fail(error);
          }
          logger.info(`retrieving task output complete`);
          done(new GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
        });
      }
      async gitResponse(task, command, args, outputHandler, logger) {
        const outputLogger = logger.sibling("output");
        const spawnOptions = this._plugins.exec(
          "spawn.options",
          {
            cwd: this.cwd,
            env: this.env,
            windowsHide: true
          },
          pluginContext(task, task.commands)
        );
        return new Promise((done) => {
          const stdOut = [];
          const stdErr = [];
          logger.info(`%s %o`, command, args);
          logger("%O", spawnOptions);
          let rejection = this._beforeSpawn(task, args);
          if (rejection) {
            return done({
              stdOut,
              stdErr,
              exitCode: 9901,
              rejection
            });
          }
          this._plugins.exec("spawn.before", void 0, {
            ...pluginContext(task, args),
            kill(reason) {
              rejection = reason || rejection;
            }
          });
          const spawned = (0, import_child_process.spawn)(command, args, spawnOptions);
          spawned.stdout.on(
            "data",
            onDataReceived(stdOut, "stdOut", logger, outputLogger.step("stdOut"))
          );
          spawned.stderr.on(
            "data",
            onDataReceived(stdErr, "stdErr", logger, outputLogger.step("stdErr"))
          );
          spawned.on("error", onErrorReceived(stdErr, logger));
          if (outputHandler) {
            logger(`Passing child process stdOut/stdErr to custom outputHandler`);
            outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
          }
          this._plugins.exec("spawn.after", void 0, {
            ...pluginContext(task, args),
            spawned,
            close(exitCode, reason) {
              done({
                stdOut,
                stdErr,
                exitCode,
                rejection: rejection || reason
              });
            },
            kill(reason) {
              if (spawned.killed) {
                return;
              }
              rejection = reason;
              spawned.kill("SIGINT");
            }
          });
        });
      }
      _beforeSpawn(task, args) {
        let rejection;
        this._plugins.exec("spawn.before", void 0, {
          ...pluginContext(task, args),
          kill(reason) {
            rejection = reason || rejection;
          }
        });
        return rejection;
      }
    };
  }
});
var git_executor_exports = {};
__export2(git_executor_exports, {
  GitExecutor: () => GitExecutor
});
var GitExecutor;
var init_git_executor = __esm2({
  "src/lib/runners/git-executor.ts"() {
    "use strict";
    init_git_executor_chain();
    GitExecutor = class {
      constructor(cwd, _scheduler, _plugins) {
        this.cwd = cwd;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      chain() {
        return new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      push(task) {
        return this._chain.push(task);
      }
    };
  }
});
function taskCallback(task, response, callback = NOOP) {
  const onSuccess = (data) => {
    callback(null, data);
  };
  const onError2 = (err) => {
    if (err?.task === task) {
      callback(
        err instanceof GitResponseError ? addDeprecationNoticeToError(err) : err,
        void 0
      );
    }
  };
  response.then(onSuccess, onError2);
}
function addDeprecationNoticeToError(err) {
  let log = (name) => {
    console.warn(
      `simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}, this will no longer be available in version 3`
    );
    log = NOOP;
  };
  return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
  function descriptorReducer(all, name) {
    if (name in err) {
      return all;
    }
    all[name] = {
      enumerable: false,
      configurable: false,
      get() {
        log(name);
        return err.git[name];
      }
    };
    return all;
  }
}
var init_task_callback = __esm2({
  "src/lib/task-callback.ts"() {
    "use strict";
    init_git_response_error();
    init_utils();
  }
});
function changeWorkingDirectoryTask(directory, root) {
  return adhocExecTask((instance) => {
    if (!folderExists(directory)) {
      throw new Error(`Git.cwd: cannot change to non-directory "${directory}"`);
    }
    return (root || instance).cwd = directory;
  });
}
var init_change_working_directory = __esm2({
  "src/lib/tasks/change-working-directory.ts"() {
    "use strict";
    init_utils();
    init_task();
  }
});
function checkoutTask(args) {
  const commands8 = ["checkout", ...args];
  if (commands8[1] === "-b" && commands8.includes("-B")) {
    commands8[1] = remove2(commands8, "-B");
  }
  return straightThroughStringTask(commands8);
}
function checkout_default() {
  return {
    checkout() {
      return this._runTask(
        checkoutTask(getTrailingOptions(arguments, 1)),
        trailingFunctionArgument(arguments)
      );
    },
    checkoutBranch(branchName, startPoint) {
      return this._runTask(
        checkoutTask(["-b", branchName, startPoint, ...getTrailingOptions(arguments)]),
        trailingFunctionArgument(arguments)
      );
    },
    checkoutLocalBranch(branchName) {
      return this._runTask(
        checkoutTask(["-b", branchName, ...getTrailingOptions(arguments)]),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_checkout = __esm2({
  "src/lib/tasks/checkout.ts"() {
    "use strict";
    init_utils();
    init_task();
  }
});
function countObjectsResponse() {
  return {
    count: 0,
    garbage: 0,
    inPack: 0,
    packs: 0,
    prunePackable: 0,
    size: 0,
    sizeGarbage: 0,
    sizePack: 0
  };
}
function count_objects_default() {
  return {
    countObjects() {
      return this._runTask({
        commands: ["count-objects", "--verbose"],
        format: "utf-8",
        parser(stdOut) {
          return parseStringResponse(countObjectsResponse(), [parser2], stdOut);
        }
      });
    }
  };
}
var parser2;
var init_count_objects = __esm2({
  "src/lib/tasks/count-objects.ts"() {
    "use strict";
    init_utils();
    parser2 = new LineParser(
      /([a-z-]+): (\d+)$/,
      (result, [key, value]) => {
        const property = asCamelCase(key);
        if (result.hasOwnProperty(property)) {
          result[property] = asNumber(value);
        }
      }
    );
  }
});
function parseCommitResult(stdOut) {
  const result = {
    author: null,
    branch: "",
    commit: "",
    root: false,
    summary: {
      changes: 0,
      insertions: 0,
      deletions: 0
    }
  };
  return parseStringResponse(result, parsers, stdOut);
}
var parsers;
var init_parse_commit = __esm2({
  "src/lib/parsers/parse-commit.ts"() {
    "use strict";
    init_utils();
    parsers = [
      new LineParser(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (result, [branch, root, commit]) => {
        result.branch = branch;
        result.commit = commit;
        result.root = !!root;
      }),
      new LineParser(/\s*Author:\s(.+)/i, (result, [author]) => {
        const parts = author.split("<");
        const email = parts.pop();
        if (!email || !email.includes("@")) {
          return;
        }
        result.author = {
          email: email.substr(0, email.length - 1),
          name: parts.join("<").trim()
        };
      }),
      new LineParser(
        /(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g,
        (result, [changes, insertions, deletions]) => {
          result.summary.changes = parseInt(changes, 10) || 0;
          result.summary.insertions = parseInt(insertions, 10) || 0;
          result.summary.deletions = parseInt(deletions, 10) || 0;
        }
      ),
      new LineParser(
        /^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/,
        (result, [changes, lines, direction]) => {
          result.summary.changes = parseInt(changes, 10) || 0;
          const count = parseInt(lines, 10) || 0;
          if (direction === "-") {
            result.summary.deletions = count;
          } else if (direction === "+") {
            result.summary.insertions = count;
          }
        }
      )
    ];
  }
});
function commitTask(message, files, customArgs) {
  const commands8 = [
    "-c",
    "core.abbrev=40",
    "commit",
    ...prefixedArray(message, "-m"),
    ...files,
    ...customArgs
  ];
  return {
    commands: commands8,
    format: "utf-8",
    parser: parseCommitResult
  };
}
function commit_default() {
  return {
    commit(message, ...rest) {
      const next = trailingFunctionArgument(arguments);
      const task = rejectDeprecatedSignatures(message) || commitTask(
        asArray(message),
        asArray(filterType(rest[0], filterStringOrStringArray, [])),
        [...filterType(rest[1], filterArray, []), ...getTrailingOptions(arguments, 0, true)]
      );
      return this._runTask(task, next);
    }
  };
  function rejectDeprecatedSignatures(message) {
    return !filterStringOrStringArray(message) && configurationErrorTask(
      `git.commit: requires the commit message to be supplied as a string/string[]`
    );
  }
}
var init_commit = __esm2({
  "src/lib/tasks/commit.ts"() {
    "use strict";
    init_parse_commit();
    init_utils();
    init_task();
  }
});
function first_commit_default() {
  return {
    firstCommit() {
      return this._runTask(
        straightThroughStringTask(["rev-list", "--max-parents=0", "HEAD"], true),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_first_commit = __esm2({
  "src/lib/tasks/first-commit.ts"() {
    "use strict";
    init_utils();
    init_task();
  }
});
function hashObjectTask(filePath, write) {
  const commands8 = ["hash-object", filePath];
  if (write) {
    commands8.push("-w");
  }
  return straightThroughStringTask(commands8, true);
}
var init_hash_object = __esm2({
  "src/lib/tasks/hash-object.ts"() {
    "use strict";
    init_task();
  }
});
function parseInit(bare, path3, text) {
  const response = String(text).trim();
  let result;
  if (result = initResponseRegex.exec(response)) {
    return new InitSummary(bare, path3, false, result[1]);
  }
  if (result = reInitResponseRegex.exec(response)) {
    return new InitSummary(bare, path3, true, result[1]);
  }
  let gitDir = "";
  const tokens = response.split(" ");
  while (tokens.length) {
    const token = tokens.shift();
    if (token === "in") {
      gitDir = tokens.join(" ");
      break;
    }
  }
  return new InitSummary(bare, path3, /^re/i.test(response), gitDir);
}
var InitSummary;
var initResponseRegex;
var reInitResponseRegex;
var init_InitSummary = __esm2({
  "src/lib/responses/InitSummary.ts"() {
    "use strict";
    InitSummary = class {
      constructor(bare, path3, existing, gitDir) {
        this.bare = bare;
        this.path = path3;
        this.existing = existing;
        this.gitDir = gitDir;
      }
    };
    initResponseRegex = /^Init.+ repository in (.+)$/;
    reInitResponseRegex = /^Rein.+ in (.+)$/;
  }
});
function hasBareCommand(command) {
  return command.includes(bareCommand);
}
function initTask(bare = false, path3, customArgs) {
  const commands8 = ["init", ...customArgs];
  if (bare && !hasBareCommand(commands8)) {
    commands8.splice(1, 0, bareCommand);
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser(text) {
      return parseInit(commands8.includes("--bare"), path3, text);
    }
  };
}
var bareCommand;
var init_init = __esm2({
  "src/lib/tasks/init.ts"() {
    "use strict";
    init_InitSummary();
    bareCommand = "--bare";
  }
});
function logFormatFromCommand(customArgs) {
  for (let i = 0; i < customArgs.length; i++) {
    const format = logFormatRegex.exec(customArgs[i]);
    if (format) {
      return `--${format[1]}`;
    }
  }
  return "";
}
function isLogFormat(customArg) {
  return logFormatRegex.test(customArg);
}
var logFormatRegex;
var init_log_format = __esm2({
  "src/lib/args/log-format.ts"() {
    "use strict";
    logFormatRegex = /^--(stat|numstat|name-only|name-status)(=|$)/;
  }
});
var DiffSummary;
var init_DiffSummary = __esm2({
  "src/lib/responses/DiffSummary.ts"() {
    "use strict";
    DiffSummary = class {
      constructor() {
        this.changed = 0;
        this.deletions = 0;
        this.insertions = 0;
        this.files = [];
      }
    };
  }
});
function getDiffParser(format = "") {
  const parser4 = diffSummaryParsers[format];
  return (stdOut) => parseStringResponse(new DiffSummary(), parser4, stdOut, false);
}
var statParser;
var numStatParser;
var nameOnlyParser;
var nameStatusParser;
var diffSummaryParsers;
var init_parse_diff_summary = __esm2({
  "src/lib/parsers/parse-diff-summary.ts"() {
    "use strict";
    init_log_format();
    init_DiffSummary();
    init_diff_name_status();
    init_utils();
    statParser = [
      new LineParser(
        /^(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/,
        (result, [file, changes, alterations = ""]) => {
          result.files.push({
            file: file.trim(),
            changes: asNumber(changes),
            insertions: alterations.replace(/[^+]/g, "").length,
            deletions: alterations.replace(/[^-]/g, "").length,
            binary: false
          });
        }
      ),
      new LineParser(
        /^(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/,
        (result, [file, before, after]) => {
          result.files.push({
            file: file.trim(),
            before: asNumber(before),
            after: asNumber(after),
            binary: true
          });
        }
      ),
      new LineParser(
        /(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/,
        (result, [changed, summary]) => {
          const inserted = /(\d+) i/.exec(summary);
          const deleted = /(\d+) d/.exec(summary);
          result.changed = asNumber(changed);
          result.insertions = asNumber(inserted?.[1]);
          result.deletions = asNumber(deleted?.[1]);
        }
      )
    ];
    numStatParser = [
      new LineParser(
        /(\d+)\t(\d+)\t(.+)$/,
        (result, [changesInsert, changesDelete, file]) => {
          const insertions = asNumber(changesInsert);
          const deletions = asNumber(changesDelete);
          result.changed++;
          result.insertions += insertions;
          result.deletions += deletions;
          result.files.push({
            file,
            changes: insertions + deletions,
            insertions,
            deletions,
            binary: false
          });
        }
      ),
      new LineParser(/-\t-\t(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          after: 0,
          before: 0,
          binary: true
        });
      })
    ];
    nameOnlyParser = [
      new LineParser(/(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    nameStatusParser = [
      new LineParser(
        /([ACDMRTUXB])([0-9]{0,3})\t(.[^\t]*)(\t(.[^\t]*))?$/,
        (result, [status, similarity, from, _to, to]) => {
          result.changed++;
          result.files.push({
            file: to ?? from,
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: false,
            status: orVoid(isDiffNameStatus(status) && status),
            from: orVoid(!!to && from !== to && from),
            similarity: asNumber(similarity)
          });
        }
      )
    ];
    diffSummaryParsers = {
      [
        ""
        /* NONE */
      ]: statParser,
      [
        "--stat"
        /* STAT */
      ]: statParser,
      [
        "--numstat"
        /* NUM_STAT */
      ]: numStatParser,
      [
        "--name-status"
        /* NAME_STATUS */
      ]: nameStatusParser,
      [
        "--name-only"
        /* NAME_ONLY */
      ]: nameOnlyParser
    };
  }
});
function lineBuilder(tokens, fields) {
  return fields.reduce(
    (line, field, index) => {
      line[field] = tokens[index] || "";
      return line;
    },
    /* @__PURE__ */ Object.create({ diff: null })
  );
}
function createListLogSummaryParser(splitter = SPLITTER, fields = defaultFieldNames, logFormat = "") {
  const parseDiffResult = getDiffParser(logFormat);
  return function(stdOut) {
    const all = toLinesWithContent(
      stdOut.trim(),
      false,
      START_BOUNDARY
    ).map(function(item) {
      const lineDetail = item.split(COMMIT_BOUNDARY);
      const listLogLine = lineBuilder(lineDetail[0].split(splitter), fields);
      if (lineDetail.length > 1 && !!lineDetail[1].trim()) {
        listLogLine.diff = parseDiffResult(lineDetail[1]);
      }
      return listLogLine;
    });
    return {
      all,
      latest: all.length && all[0] || null,
      total: all.length
    };
  };
}
var START_BOUNDARY;
var COMMIT_BOUNDARY;
var SPLITTER;
var defaultFieldNames;
var init_parse_list_log_summary = __esm2({
  "src/lib/parsers/parse-list-log-summary.ts"() {
    "use strict";
    init_utils();
    init_parse_diff_summary();
    init_log_format();
    START_BOUNDARY = "\xF2\xF2\xF2\xF2\xF2\xF2 ";
    COMMIT_BOUNDARY = " \xF2\xF2";
    SPLITTER = " \xF2 ";
    defaultFieldNames = ["hash", "date", "message", "refs", "author_name", "author_email"];
  }
});
var diff_exports = {};
__export2(diff_exports, {
  diffSummaryTask: () => diffSummaryTask,
  validateLogFormatConfig: () => validateLogFormatConfig
});
function diffSummaryTask(customArgs) {
  let logFormat = logFormatFromCommand(customArgs);
  const commands8 = ["diff"];
  if (logFormat === "") {
    logFormat = "--stat";
    commands8.push("--stat=4096");
  }
  commands8.push(...customArgs);
  return validateLogFormatConfig(commands8) || {
    commands: commands8,
    format: "utf-8",
    parser: getDiffParser(logFormat)
  };
}
function validateLogFormatConfig(customArgs) {
  const flags = customArgs.filter(isLogFormat);
  if (flags.length > 1) {
    return configurationErrorTask(
      `Summary flags are mutually exclusive - pick one of ${flags.join(",")}`
    );
  }
  if (flags.length && customArgs.includes("-z")) {
    return configurationErrorTask(
      `Summary flag ${flags} parsing is not compatible with null termination option '-z'`
    );
  }
}
var init_diff = __esm2({
  "src/lib/tasks/diff.ts"() {
    "use strict";
    init_log_format();
    init_parse_diff_summary();
    init_task();
  }
});
function prettyFormat(format, splitter) {
  const fields = [];
  const formatStr = [];
  Object.keys(format).forEach((field) => {
    fields.push(field);
    formatStr.push(String(format[field]));
  });
  return [fields, formatStr.join(splitter)];
}
function userOptions(input) {
  return Object.keys(input).reduce((out, key) => {
    if (!(key in excludeOptions)) {
      out[key] = input[key];
    }
    return out;
  }, {});
}
function parseLogOptions(opt = {}, customArgs = []) {
  const splitter = filterType(opt.splitter, filterString, SPLITTER);
  const format = filterPlainObject(opt.format) ? opt.format : {
    hash: "%H",
    date: opt.strictDate === false ? "%ai" : "%aI",
    message: "%s",
    refs: "%D",
    body: opt.multiLine ? "%B" : "%b",
    author_name: opt.mailMap !== false ? "%aN" : "%an",
    author_email: opt.mailMap !== false ? "%aE" : "%ae"
  };
  const [fields, formatStr] = prettyFormat(format, splitter);
  const suffix = [];
  const command = [
    `--pretty=format:${START_BOUNDARY}${formatStr}${COMMIT_BOUNDARY}`,
    ...customArgs
  ];
  const maxCount = opt.n || opt["max-count"] || opt.maxCount;
  if (maxCount) {
    command.push(`--max-count=${maxCount}`);
  }
  if (opt.from || opt.to) {
    const rangeOperator = opt.symmetric !== false ? "..." : "..";
    suffix.push(`${opt.from || ""}${rangeOperator}${opt.to || ""}`);
  }
  if (filterString(opt.file)) {
    command.push("--follow", pathspec(opt.file));
  }
  appendTaskOptions(userOptions(opt), command);
  return {
    fields,
    splitter,
    commands: [...command, ...suffix]
  };
}
function logTask(splitter, fields, customArgs) {
  const parser4 = createListLogSummaryParser(splitter, fields, logFormatFromCommand(customArgs));
  return {
    commands: ["log", ...customArgs],
    format: "utf-8",
    parser: parser4
  };
}
function log_default() {
  return {
    log(...rest) {
      const next = trailingFunctionArgument(arguments);
      const options = parseLogOptions(
        trailingOptionsArgument(arguments),
        filterType(arguments[0], filterArray)
      );
      const task = rejectDeprecatedSignatures(...rest) || validateLogFormatConfig(options.commands) || createLogTask(options);
      return this._runTask(task, next);
    }
  };
  function createLogTask(options) {
    return logTask(options.splitter, options.fields, options.commands);
  }
  function rejectDeprecatedSignatures(from, to) {
    return filterString(from) && filterString(to) && configurationErrorTask(
      `git.log(string, string) should be replaced with git.log({ from: string, to: string })`
    );
  }
}
var excludeOptions;
var init_log = __esm2({
  "src/lib/tasks/log.ts"() {
    "use strict";
    init_log_format();
    init_pathspec();
    init_parse_list_log_summary();
    init_utils();
    init_task();
    init_diff();
    excludeOptions = /* @__PURE__ */ ((excludeOptions2) => {
      excludeOptions2[excludeOptions2["--pretty"] = 0] = "--pretty";
      excludeOptions2[excludeOptions2["max-count"] = 1] = "max-count";
      excludeOptions2[excludeOptions2["maxCount"] = 2] = "maxCount";
      excludeOptions2[excludeOptions2["n"] = 3] = "n";
      excludeOptions2[excludeOptions2["file"] = 4] = "file";
      excludeOptions2[excludeOptions2["format"] = 5] = "format";
      excludeOptions2[excludeOptions2["from"] = 6] = "from";
      excludeOptions2[excludeOptions2["to"] = 7] = "to";
      excludeOptions2[excludeOptions2["splitter"] = 8] = "splitter";
      excludeOptions2[excludeOptions2["symmetric"] = 9] = "symmetric";
      excludeOptions2[excludeOptions2["mailMap"] = 10] = "mailMap";
      excludeOptions2[excludeOptions2["multiLine"] = 11] = "multiLine";
      excludeOptions2[excludeOptions2["strictDate"] = 12] = "strictDate";
      return excludeOptions2;
    })(excludeOptions || {});
  }
});
var MergeSummaryConflict;
var MergeSummaryDetail;
var init_MergeSummary = __esm2({
  "src/lib/responses/MergeSummary.ts"() {
    "use strict";
    MergeSummaryConflict = class {
      constructor(reason, file = null, meta) {
        this.reason = reason;
        this.file = file;
        this.meta = meta;
      }
      toString() {
        return `${this.file}:${this.reason}`;
      }
    };
    MergeSummaryDetail = class {
      constructor() {
        this.conflicts = [];
        this.merges = [];
        this.result = "success";
      }
      get failed() {
        return this.conflicts.length > 0;
      }
      get reason() {
        return this.result;
      }
      toString() {
        if (this.conflicts.length) {
          return `CONFLICTS: ${this.conflicts.join(", ")}`;
        }
        return "OK";
      }
    };
  }
});
var PullSummary;
var PullFailedSummary;
var init_PullSummary = __esm2({
  "src/lib/responses/PullSummary.ts"() {
    "use strict";
    PullSummary = class {
      constructor() {
        this.remoteMessages = {
          all: []
        };
        this.created = [];
        this.deleted = [];
        this.files = [];
        this.deletions = {};
        this.insertions = {};
        this.summary = {
          changes: 0,
          deletions: 0,
          insertions: 0
        };
      }
    };
    PullFailedSummary = class {
      constructor() {
        this.remote = "";
        this.hash = {
          local: "",
          remote: ""
        };
        this.branch = {
          local: "",
          remote: ""
        };
        this.message = "";
      }
      toString() {
        return this.message;
      }
    };
  }
});
function objectEnumerationResult(remoteMessages) {
  return remoteMessages.objects = remoteMessages.objects || {
    compressing: 0,
    counting: 0,
    enumerating: 0,
    packReused: 0,
    reused: { count: 0, delta: 0 },
    total: { count: 0, delta: 0 }
  };
}
function asObjectCount(source) {
  const count = /^\s*(\d+)/.exec(source);
  const delta = /delta (\d+)/i.exec(source);
  return {
    count: asNumber(count && count[1] || "0"),
    delta: asNumber(delta && delta[1] || "0")
  };
}
var remoteMessagesObjectParsers;
var init_parse_remote_objects = __esm2({
  "src/lib/parsers/parse-remote-objects.ts"() {
    "use strict";
    init_utils();
    remoteMessagesObjectParsers = [
      new RemoteLineParser(
        /^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i,
        (result, [action, count]) => {
          const key = action.toLowerCase();
          const enumeration = objectEnumerationResult(result.remoteMessages);
          Object.assign(enumeration, { [key]: asNumber(count) });
        }
      ),
      new RemoteLineParser(
        /^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i,
        (result, [action, count]) => {
          const key = action.toLowerCase();
          const enumeration = objectEnumerationResult(result.remoteMessages);
          Object.assign(enumeration, { [key]: asNumber(count) });
        }
      ),
      new RemoteLineParser(
        /total ([^,]+), reused ([^,]+), pack-reused (\d+)/i,
        (result, [total, reused, packReused]) => {
          const objects = objectEnumerationResult(result.remoteMessages);
          objects.total = asObjectCount(total);
          objects.reused = asObjectCount(reused);
          objects.packReused = asNumber(packReused);
        }
      )
    ];
  }
});
function parseRemoteMessages(_stdOut, stdErr) {
  return parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers2, stdErr);
}
var parsers2;
var RemoteMessageSummary;
var init_parse_remote_messages = __esm2({
  "src/lib/parsers/parse-remote-messages.ts"() {
    "use strict";
    init_utils();
    init_parse_remote_objects();
    parsers2 = [
      new RemoteLineParser(/^remote:\s*(.+)$/, (result, [text]) => {
        result.remoteMessages.all.push(text.trim());
        return false;
      }),
      ...remoteMessagesObjectParsers,
      new RemoteLineParser(
        [/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/],
        (result, [pullRequestUrl]) => {
          result.remoteMessages.pullRequestUrl = pullRequestUrl;
        }
      ),
      new RemoteLineParser(
        [/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/],
        (result, [count, summary, url]) => {
          result.remoteMessages.vulnerabilities = {
            count: asNumber(count),
            summary,
            url
          };
        }
      )
    ];
    RemoteMessageSummary = class {
      constructor() {
        this.all = [];
      }
    };
  }
});
function parsePullErrorResult(stdOut, stdErr) {
  const pullError = parseStringResponse(new PullFailedSummary(), errorParsers, [stdOut, stdErr]);
  return pullError.message && pullError;
}
var FILE_UPDATE_REGEX;
var SUMMARY_REGEX;
var ACTION_REGEX;
var parsers3;
var errorParsers;
var parsePullDetail;
var parsePullResult;
var init_parse_pull = __esm2({
  "src/lib/parsers/parse-pull.ts"() {
    "use strict";
    init_PullSummary();
    init_utils();
    init_parse_remote_messages();
    FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
    SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
    ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
    parsers3 = [
      new LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
        result.files.push(file);
        if (insertions) {
          result.insertions[file] = insertions.length;
        }
        if (deletions) {
          result.deletions[file] = deletions.length;
        }
      }),
      new LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
        if (insertions !== void 0 || deletions !== void 0) {
          result.summary.changes = +changes || 0;
          result.summary.insertions = +insertions || 0;
          result.summary.deletions = +deletions || 0;
          return true;
        }
        return false;
      }),
      new LineParser(ACTION_REGEX, (result, [action, file]) => {
        append(result.files, file);
        append(action === "create" ? result.created : result.deleted, file);
      })
    ];
    errorParsers = [
      new LineParser(/^from\s(.+)$/i, (result, [remote]) => void (result.remote = remote)),
      new LineParser(/^fatal:\s(.+)$/, (result, [message]) => void (result.message = message)),
      new LineParser(
        /([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/,
        (result, [hashLocal, hashRemote, branchLocal, branchRemote]) => {
          result.branch.local = branchLocal;
          result.hash.local = hashLocal;
          result.branch.remote = branchRemote;
          result.hash.remote = hashRemote;
        }
      )
    ];
    parsePullDetail = (stdOut, stdErr) => {
      return parseStringResponse(new PullSummary(), parsers3, [stdOut, stdErr]);
    };
    parsePullResult = (stdOut, stdErr) => {
      return Object.assign(
        new PullSummary(),
        parsePullDetail(stdOut, stdErr),
        parseRemoteMessages(stdOut, stdErr)
      );
    };
  }
});
var parsers4;
var parseMergeResult;
var parseMergeDetail;
var init_parse_merge = __esm2({
  "src/lib/parsers/parse-merge.ts"() {
    "use strict";
    init_MergeSummary();
    init_utils();
    init_parse_pull();
    parsers4 = [
      new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
        summary.merges.push(autoMerge);
      }),
      new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file));
      }),
      new LineParser(
        /^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/,
        (summary, [reason, file, deleteRef]) => {
          summary.conflicts.push(new MergeSummaryConflict(reason, file, { deleteRef }));
        }
      ),
      new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, null));
      }),
      new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
        summary.result = result;
      })
    ];
    parseMergeResult = (stdOut, stdErr) => {
      return Object.assign(parseMergeDetail(stdOut, stdErr), parsePullResult(stdOut, stdErr));
    };
    parseMergeDetail = (stdOut) => {
      return parseStringResponse(new MergeSummaryDetail(), parsers4, stdOut);
    };
  }
});
function mergeTask(customArgs) {
  if (!customArgs.length) {
    return configurationErrorTask("Git.merge requires at least one option");
  }
  return {
    commands: ["merge", ...customArgs],
    format: "utf-8",
    parser(stdOut, stdErr) {
      const merge2 = parseMergeResult(stdOut, stdErr);
      if (merge2.failed) {
        throw new GitResponseError(merge2);
      }
      return merge2;
    }
  };
}
var init_merge = __esm2({
  "src/lib/tasks/merge.ts"() {
    "use strict";
    init_git_response_error();
    init_parse_merge();
    init_task();
  }
});
function pushResultPushedItem(local, remote, status) {
  const deleted = status.includes("deleted");
  const tag = status.includes("tag") || /^refs\/tags/.test(local);
  const alreadyUpdated = !status.includes("new");
  return {
    deleted,
    tag,
    branch: !tag,
    new: !alreadyUpdated,
    alreadyUpdated,
    local,
    remote
  };
}
var parsers5;
var parsePushResult;
var parsePushDetail;
var init_parse_push = __esm2({
  "src/lib/parsers/parse-push.ts"() {
    "use strict";
    init_utils();
    init_parse_remote_messages();
    parsers5 = [
      new LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
        result.repo = repo;
      }),
      new LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
        result.ref = {
          ...result.ref || {},
          local
        };
      }),
      new LineParser(/^[=*-]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
        result.pushed.push(pushResultPushedItem(local, remote, type));
      }),
      new LineParser(
        /^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/,
        (result, [local, remote, remoteName]) => {
          result.branch = {
            ...result.branch || {},
            local,
            remote,
            remoteName
          };
        }
      ),
      new LineParser(
        /^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/,
        (result, [local, remote, from, to]) => {
          result.update = {
            head: {
              local,
              remote
            },
            hash: {
              from,
              to
            }
          };
        }
      )
    ];
    parsePushResult = (stdOut, stdErr) => {
      const pushDetail = parsePushDetail(stdOut, stdErr);
      const responseDetail = parseRemoteMessages(stdOut, stdErr);
      return {
        ...pushDetail,
        ...responseDetail
      };
    };
    parsePushDetail = (stdOut, stdErr) => {
      return parseStringResponse({ pushed: [] }, parsers5, [stdOut, stdErr]);
    };
  }
});
var push_exports = {};
__export2(push_exports, {
  pushTagsTask: () => pushTagsTask,
  pushTask: () => pushTask
});
function pushTagsTask(ref = {}, customArgs) {
  append(customArgs, "--tags");
  return pushTask(ref, customArgs);
}
function pushTask(ref = {}, customArgs) {
  const commands8 = ["push", ...customArgs];
  if (ref.branch) {
    commands8.splice(1, 0, ref.branch);
  }
  if (ref.remote) {
    commands8.splice(1, 0, ref.remote);
  }
  remove2(commands8, "-v");
  append(commands8, "--verbose");
  append(commands8, "--porcelain");
  return {
    commands: commands8,
    format: "utf-8",
    parser: parsePushResult
  };
}
var init_push = __esm2({
  "src/lib/tasks/push.ts"() {
    "use strict";
    init_parse_push();
    init_utils();
  }
});
function show_default() {
  return {
    showBuffer() {
      const commands8 = ["show", ...getTrailingOptions(arguments, 1)];
      if (!commands8.includes("--binary")) {
        commands8.splice(1, 0, "--binary");
      }
      return this._runTask(
        straightThroughBufferTask(commands8),
        trailingFunctionArgument(arguments)
      );
    },
    show() {
      const commands8 = ["show", ...getTrailingOptions(arguments, 1)];
      return this._runTask(
        straightThroughStringTask(commands8),
        trailingFunctionArgument(arguments)
      );
    }
  };
}
var init_show = __esm2({
  "src/lib/tasks/show.ts"() {
    "use strict";
    init_utils();
    init_task();
  }
});
var fromPathRegex;
var FileStatusSummary;
var init_FileStatusSummary = __esm2({
  "src/lib/responses/FileStatusSummary.ts"() {
    "use strict";
    fromPathRegex = /^(.+)\0(.+)$/;
    FileStatusSummary = class {
      constructor(path3, index, working_dir) {
        this.path = path3;
        this.index = index;
        this.working_dir = working_dir;
        if (index === "R" || working_dir === "R") {
          const detail = fromPathRegex.exec(path3) || [null, path3, path3];
          this.from = detail[2] || "";
          this.path = detail[1] || "";
        }
      }
    };
  }
});
function renamedFile(line) {
  const [to, from] = line.split(NULL);
  return {
    from: from || to,
    to
  };
}
function parser3(indexX, indexY, handler) {
  return [`${indexX}${indexY}`, handler];
}
function conflicts(indexX, ...indexY) {
  return indexY.map((y) => parser3(indexX, y, (result, file) => append(result.conflicted, file)));
}
function splitLine(result, lineStr) {
  const trimmed2 = lineStr.trim();
  switch (" ") {
    case trimmed2.charAt(2):
      return data(trimmed2.charAt(0), trimmed2.charAt(1), trimmed2.substr(3));
    case trimmed2.charAt(1):
      return data(" ", trimmed2.charAt(0), trimmed2.substr(2));
    default:
      return;
  }
  function data(index, workingDir, path3) {
    const raw = `${index}${workingDir}`;
    const handler = parsers6.get(raw);
    if (handler) {
      handler(result, path3);
    }
    if (raw !== "##" && raw !== "!!") {
      result.files.push(new FileStatusSummary(path3, index, workingDir));
    }
  }
}
var StatusSummary;
var parsers6;
var parseStatusSummary;
var init_StatusSummary = __esm2({
  "src/lib/responses/StatusSummary.ts"() {
    "use strict";
    init_utils();
    init_FileStatusSummary();
    StatusSummary = class {
      constructor() {
        this.not_added = [];
        this.conflicted = [];
        this.created = [];
        this.deleted = [];
        this.ignored = void 0;
        this.modified = [];
        this.renamed = [];
        this.files = [];
        this.staged = [];
        this.ahead = 0;
        this.behind = 0;
        this.current = null;
        this.tracking = null;
        this.detached = false;
        this.isClean = () => {
          return !this.files.length;
        };
      }
    };
    parsers6 = new Map([
      parser3(
        " ",
        "A",
        (result, file) => append(result.created, file)
      ),
      parser3(
        " ",
        "D",
        (result, file) => append(result.deleted, file)
      ),
      parser3(
        " ",
        "M",
        (result, file) => append(result.modified, file)
      ),
      parser3(
        "A",
        " ",
        (result, file) => append(result.created, file) && append(result.staged, file)
      ),
      parser3(
        "A",
        "M",
        (result, file) => append(result.created, file) && append(result.staged, file) && append(result.modified, file)
      ),
      parser3(
        "D",
        " ",
        (result, file) => append(result.deleted, file) && append(result.staged, file)
      ),
      parser3(
        "M",
        " ",
        (result, file) => append(result.modified, file) && append(result.staged, file)
      ),
      parser3(
        "M",
        "M",
        (result, file) => append(result.modified, file) && append(result.staged, file)
      ),
      parser3("R", " ", (result, file) => {
        append(result.renamed, renamedFile(file));
      }),
      parser3("R", "M", (result, file) => {
        const renamed = renamedFile(file);
        append(result.renamed, renamed);
        append(result.modified, renamed.to);
      }),
      parser3("!", "!", (_result, _file) => {
        append(_result.ignored = _result.ignored || [], _file);
      }),
      parser3(
        "?",
        "?",
        (result, file) => append(result.not_added, file)
      ),
      ...conflicts(
        "A",
        "A",
        "U"
        /* UNMERGED */
      ),
      ...conflicts(
        "D",
        "D",
        "U"
        /* UNMERGED */
      ),
      ...conflicts(
        "U",
        "A",
        "D",
        "U"
        /* UNMERGED */
      ),
      [
        "##",
        (result, line) => {
          const aheadReg = /ahead (\d+)/;
          const behindReg = /behind (\d+)/;
          const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
          const trackingReg = /\.{3}(\S*)/;
          const onEmptyBranchReg = /\son\s([\S]+)$/;
          let regexResult;
          regexResult = aheadReg.exec(line);
          result.ahead = regexResult && +regexResult[1] || 0;
          regexResult = behindReg.exec(line);
          result.behind = regexResult && +regexResult[1] || 0;
          regexResult = currentReg.exec(line);
          result.current = regexResult && regexResult[1];
          regexResult = trackingReg.exec(line);
          result.tracking = regexResult && regexResult[1];
          regexResult = onEmptyBranchReg.exec(line);
          result.current = regexResult && regexResult[1] || result.current;
          result.detached = /\(no branch\)/.test(line);
        }
      ]
    ]);
    parseStatusSummary = function(text) {
      const lines = text.split(NULL);
      const status = new StatusSummary();
      for (let i = 0, l = lines.length; i < l; ) {
        let line = lines[i++].trim();
        if (!line) {
          continue;
        }
        if (line.charAt(0) === "R") {
          line += NULL + (lines[i++] || "");
        }
        splitLine(status, line);
      }
      return status;
    };
  }
});
function statusTask(customArgs) {
  const commands8 = [
    "status",
    "--porcelain",
    "-b",
    "-u",
    "--null",
    ...customArgs.filter((arg) => !ignoredOptions.includes(arg))
  ];
  return {
    format: "utf-8",
    commands: commands8,
    parser(text) {
      return parseStatusSummary(text);
    }
  };
}
var ignoredOptions;
var init_status = __esm2({
  "src/lib/tasks/status.ts"() {
    "use strict";
    init_StatusSummary();
    ignoredOptions = ["--null", "-z"];
  }
});
function versionResponse(major = 0, minor = 0, patch = 0, agent = "", installed = true) {
  return Object.defineProperty(
    {
      major,
      minor,
      patch,
      agent,
      installed
    },
    "toString",
    {
      value() {
        return `${this.major}.${this.minor}.${this.patch}`;
      },
      configurable: false,
      enumerable: false
    }
  );
}
function notInstalledResponse() {
  return versionResponse(0, 0, 0, "", false);
}
function version_default() {
  return {
    version() {
      return this._runTask({
        commands: ["--version"],
        format: "utf-8",
        parser: versionParser,
        onError(result, error, done, fail) {
          if (result.exitCode === -2) {
            return done(Buffer.from(NOT_INSTALLED));
          }
          fail(error);
        }
      });
    }
  };
}
function versionParser(stdOut) {
  if (stdOut === NOT_INSTALLED) {
    return notInstalledResponse();
  }
  return parseStringResponse(versionResponse(0, 0, 0, stdOut), parsers7, stdOut);
}
var NOT_INSTALLED;
var parsers7;
var init_version = __esm2({
  "src/lib/tasks/version.ts"() {
    "use strict";
    init_utils();
    NOT_INSTALLED = "installed=false";
    parsers7 = [
      new LineParser(
        /version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/,
        (result, [major, minor, patch, agent = ""]) => {
          Object.assign(
            result,
            versionResponse(asNumber(major), asNumber(minor), asNumber(patch), agent)
          );
        }
      ),
      new LineParser(
        /version (\d+)\.(\d+)\.(\D+)(.+)?$/,
        (result, [major, minor, patch, agent = ""]) => {
          Object.assign(result, versionResponse(asNumber(major), asNumber(minor), patch, agent));
        }
      )
    ];
  }
});
var simple_git_api_exports = {};
__export2(simple_git_api_exports, {
  SimpleGitApi: () => SimpleGitApi
});
var SimpleGitApi;
var init_simple_git_api = __esm2({
  "src/lib/simple-git-api.ts"() {
    "use strict";
    init_task_callback();
    init_change_working_directory();
    init_checkout();
    init_count_objects();
    init_commit();
    init_config();
    init_first_commit();
    init_grep();
    init_hash_object();
    init_init();
    init_log();
    init_merge();
    init_push();
    init_show();
    init_status();
    init_task();
    init_version();
    init_utils();
    SimpleGitApi = class {
      constructor(_executor) {
        this._executor = _executor;
      }
      _runTask(task, then) {
        const chain = this._executor.chain();
        const promise = chain.push(task);
        if (then) {
          taskCallback(task, promise, then);
        }
        return Object.create(this, {
          then: { value: promise.then.bind(promise) },
          catch: { value: promise.catch.bind(promise) },
          _executor: { value: chain }
        });
      }
      add(files) {
        return this._runTask(
          straightThroughStringTask(["add", ...asArray(files)]),
          trailingFunctionArgument(arguments)
        );
      }
      cwd(directory) {
        const next = trailingFunctionArgument(arguments);
        if (typeof directory === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory, this._executor), next);
        }
        if (typeof directory?.path === "string") {
          return this._runTask(
            changeWorkingDirectoryTask(
              directory.path,
              directory.root && this._executor || void 0
            ),
            next
          );
        }
        return this._runTask(
          configurationErrorTask("Git.cwd: workingDirectory must be supplied as a string"),
          next
        );
      }
      hashObject(path3, write) {
        return this._runTask(
          hashObjectTask(path3, write === true),
          trailingFunctionArgument(arguments)
        );
      }
      init(bare) {
        return this._runTask(
          initTask(bare === true, this._executor.cwd, getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
      merge() {
        return this._runTask(
          mergeTask(getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
      mergeFromTo(remote, branch) {
        if (!(filterString(remote) && filterString(branch))) {
          return this._runTask(
            configurationErrorTask(
              `Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings`
            )
          );
        }
        return this._runTask(
          mergeTask([remote, branch, ...getTrailingOptions(arguments)]),
          trailingFunctionArgument(arguments, false)
        );
      }
      outputHandler(handler) {
        this._executor.outputHandler = handler;
        return this;
      }
      push() {
        const task = pushTask(
          {
            remote: filterType(arguments[0], filterString),
            branch: filterType(arguments[1], filterString)
          },
          getTrailingOptions(arguments)
        );
        return this._runTask(task, trailingFunctionArgument(arguments));
      }
      stash() {
        return this._runTask(
          straightThroughStringTask(["stash", ...getTrailingOptions(arguments)]),
          trailingFunctionArgument(arguments)
        );
      }
      status() {
        return this._runTask(
          statusTask(getTrailingOptions(arguments)),
          trailingFunctionArgument(arguments)
        );
      }
    };
    Object.assign(
      SimpleGitApi.prototype,
      checkout_default(),
      commit_default(),
      config_default(),
      count_objects_default(),
      first_commit_default(),
      grep_default(),
      log_default(),
      show_default(),
      version_default()
    );
  }
});
var scheduler_exports = {};
__export2(scheduler_exports, {
  Scheduler: () => Scheduler
});
var createScheduledTask;
var Scheduler;
var init_scheduler = __esm2({
  "src/lib/runners/scheduler.ts"() {
    "use strict";
    init_utils();
    init_git_logger();
    createScheduledTask = /* @__PURE__ */ (() => {
      let id = 0;
      return () => {
        id++;
        const { promise, done } = (0, import_promise_deferred.createDeferred)();
        return {
          promise,
          done,
          id
        };
      };
    })();
    Scheduler = class {
      constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.logger = createLogger("", "scheduler");
        this.pending = [];
        this.running = [];
        this.logger(`Constructed, concurrency=%s`, concurrency);
      }
      schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
          this.logger(
            `Schedule attempt ignored, pending=%s running=%s concurrency=%s`,
            this.pending.length,
            this.running.length,
            this.concurrency
          );
          return;
        }
        const task = append(this.running, this.pending.shift());
        this.logger(`Attempting id=%s`, task.id);
        task.done(() => {
          this.logger(`Completing id=`, task.id);
          remove2(this.running, task);
          this.schedule();
        });
      }
      next() {
        const { promise, id } = append(this.pending, createScheduledTask());
        this.logger(`Scheduling id=%s`, id);
        this.schedule();
        return promise;
      }
    };
  }
});
var apply_patch_exports = {};
__export2(apply_patch_exports, {
  applyPatchTask: () => applyPatchTask
});
function applyPatchTask(patches, customArgs) {
  return straightThroughStringTask(["apply", ...customArgs, ...patches]);
}
var init_apply_patch = __esm2({
  "src/lib/tasks/apply-patch.ts"() {
    "use strict";
    init_task();
  }
});
function branchDeletionSuccess(branch, hash) {
  return {
    branch,
    hash,
    success: true
  };
}
function branchDeletionFailure(branch) {
  return {
    branch,
    hash: null,
    success: false
  };
}
var BranchDeletionBatch;
var init_BranchDeleteSummary = __esm2({
  "src/lib/responses/BranchDeleteSummary.ts"() {
    "use strict";
    BranchDeletionBatch = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.errors = [];
      }
      get success() {
        return !this.errors.length;
      }
    };
  }
});
function hasBranchDeletionError(data, processExitCode) {
  return processExitCode === 1 && deleteErrorRegex.test(data);
}
var deleteSuccessRegex;
var deleteErrorRegex;
var parsers8;
var parseBranchDeletions;
var init_parse_branch_delete = __esm2({
  "src/lib/parsers/parse-branch-delete.ts"() {
    "use strict";
    init_BranchDeleteSummary();
    init_utils();
    deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
    deleteErrorRegex = /^error[^']+'([^']+)'/m;
    parsers8 = [
      new LineParser(deleteSuccessRegex, (result, [branch, hash]) => {
        const deletion = branchDeletionSuccess(branch, hash);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      }),
      new LineParser(deleteErrorRegex, (result, [branch]) => {
        const deletion = branchDeletionFailure(branch);
        result.errors.push(deletion);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      })
    ];
    parseBranchDeletions = (stdOut, stdErr) => {
      return parseStringResponse(new BranchDeletionBatch(), parsers8, [stdOut, stdErr]);
    };
  }
});
var BranchSummaryResult;
var init_BranchSummary = __esm2({
  "src/lib/responses/BranchSummary.ts"() {
    "use strict";
    BranchSummaryResult = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.current = "";
        this.detached = false;
      }
      push(status, detached, name, commit, label) {
        if (status === "*") {
          this.detached = detached;
          this.current = name;
        }
        this.all.push(name);
        this.branches[name] = {
          current: status === "*",
          linkedWorkTree: status === "+",
          name,
          commit,
          label
        };
      }
    };
  }
});
function branchStatus(input) {
  return input ? input.charAt(0) : "";
}
function parseBranchSummary(stdOut) {
  return parseStringResponse(new BranchSummaryResult(), parsers9, stdOut);
}
var parsers9;
var init_parse_branch = __esm2({
  "src/lib/parsers/parse-branch.ts"() {
    "use strict";
    init_BranchSummary();
    init_utils();
    parsers9 = [
      new LineParser(
        /^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/,
        (result, [current, name, commit, label]) => {
          result.push(branchStatus(current), true, name, commit, label);
        }
      ),
      new LineParser(
        /^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s,
        (result, [current, name, commit, label]) => {
          result.push(branchStatus(current), false, name, commit, label);
        }
      )
    ];
  }
});
var branch_exports = {};
__export2(branch_exports, {
  branchLocalTask: () => branchLocalTask,
  branchTask: () => branchTask,
  containsDeleteBranchCommand: () => containsDeleteBranchCommand,
  deleteBranchTask: () => deleteBranchTask,
  deleteBranchesTask: () => deleteBranchesTask
});
function containsDeleteBranchCommand(commands8) {
  const deleteCommands = ["-d", "-D", "--delete"];
  return commands8.some((command) => deleteCommands.includes(command));
}
function branchTask(customArgs) {
  const isDelete = containsDeleteBranchCommand(customArgs);
  const commands8 = ["branch", ...customArgs];
  if (commands8.length === 1) {
    commands8.push("-a");
  }
  if (!commands8.includes("-v")) {
    commands8.splice(1, 0, "-v");
  }
  return {
    format: "utf-8",
    commands: commands8,
    parser(stdOut, stdErr) {
      if (isDelete) {
        return parseBranchDeletions(stdOut, stdErr).all[0];
      }
      return parseBranchSummary(stdOut);
    }
  };
}
function branchLocalTask() {
  const parser4 = parseBranchSummary;
  return {
    format: "utf-8",
    commands: ["branch", "-v"],
    parser: parser4
  };
}
function deleteBranchesTask(branches, forceDelete = false) {
  return {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", ...branches],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr);
    },
    onError({ exitCode, stdOut }, error, done, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      }
      done(stdOut);
    }
  };
}
function deleteBranchTask(branch, forceDelete = false) {
  const task = {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", branch],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr).branches[branch];
    },
    onError({ exitCode, stdErr, stdOut }, error, _, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      }
      throw new GitResponseError(
        task.parser(bufferToString(stdOut), bufferToString(stdErr)),
        String(error)
      );
    }
  };
  return task;
}
var init_branch = __esm2({
  "src/lib/tasks/branch.ts"() {
    "use strict";
    init_git_response_error();
    init_parse_branch_delete();
    init_parse_branch();
    init_utils();
  }
});
var parseCheckIgnore;
var init_CheckIgnore = __esm2({
  "src/lib/responses/CheckIgnore.ts"() {
    "use strict";
    parseCheckIgnore = (text) => {
      return text.split(/\n/g).map((line) => line.trim()).filter((file) => !!file);
    };
  }
});
var check_ignore_exports = {};
__export2(check_ignore_exports, {
  checkIgnoreTask: () => checkIgnoreTask
});
function checkIgnoreTask(paths) {
  return {
    commands: ["check-ignore", ...paths],
    format: "utf-8",
    parser: parseCheckIgnore
  };
}
var init_check_ignore = __esm2({
  "src/lib/tasks/check-ignore.ts"() {
    "use strict";
    init_CheckIgnore();
  }
});
var clone_exports = {};
__export2(clone_exports, {
  cloneMirrorTask: () => cloneMirrorTask,
  cloneTask: () => cloneTask
});
function disallowedCommand(command) {
  return /^--upload-pack(=|$)/.test(command);
}
function cloneTask(repo, directory, customArgs) {
  const commands8 = ["clone", ...customArgs];
  filterString(repo) && commands8.push(repo);
  filterString(directory) && commands8.push(directory);
  const banned = commands8.find(disallowedCommand);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  }
  return straightThroughStringTask(commands8);
}
function cloneMirrorTask(repo, directory, customArgs) {
  append(customArgs, "--mirror");
  return cloneTask(repo, directory, customArgs);
}
var init_clone = __esm2({
  "src/lib/tasks/clone.ts"() {
    "use strict";
    init_task();
    init_utils();
  }
});
function parseFetchResult(stdOut, stdErr) {
  const result = {
    raw: stdOut,
    remote: null,
    branches: [],
    tags: [],
    updated: [],
    deleted: []
  };
  return parseStringResponse(result, parsers10, [stdOut, stdErr]);
}
var parsers10;
var init_parse_fetch = __esm2({
  "src/lib/parsers/parse-fetch.ts"() {
    "use strict";
    init_utils();
    parsers10 = [
      new LineParser(/From (.+)$/, (result, [remote]) => {
        result.remote = remote;
      }),
      new LineParser(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.branches.push({
          name,
          tracking
        });
      }),
      new LineParser(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.tags.push({
          name,
          tracking
        });
      }),
      new LineParser(/- \[deleted]\s+\S+\s*-> (.+)$/, (result, [tracking]) => {
        result.deleted.push({
          tracking
        });
      }),
      new LineParser(
        /\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/,
        (result, [from, to, name, tracking]) => {
          result.updated.push({
            name,
            tracking,
            to,
            from
          });
        }
      )
    ];
  }
});
var fetch_exports = {};
__export2(fetch_exports, {
  fetchTask: () => fetchTask
});
function disallowedCommand2(command) {
  return /^--upload-pack(=|$)/.test(command);
}
function fetchTask(remote, branch, customArgs) {
  const commands8 = ["fetch", ...customArgs];
  if (remote && branch) {
    commands8.push(remote, branch);
  }
  const banned = commands8.find(disallowedCommand2);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser: parseFetchResult
  };
}
var init_fetch = __esm2({
  "src/lib/tasks/fetch.ts"() {
    "use strict";
    init_parse_fetch();
    init_task();
  }
});
function parseMoveResult(stdOut) {
  return parseStringResponse({ moves: [] }, parsers11, stdOut);
}
var parsers11;
var init_parse_move = __esm2({
  "src/lib/parsers/parse-move.ts"() {
    "use strict";
    init_utils();
    parsers11 = [
      new LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
        result.moves.push({ from, to });
      })
    ];
  }
});
var move_exports = {};
__export2(move_exports, {
  moveTask: () => moveTask
});
function moveTask(from, to) {
  return {
    commands: ["mv", "-v", ...asArray(from), to],
    format: "utf-8",
    parser: parseMoveResult
  };
}
var init_move = __esm2({
  "src/lib/tasks/move.ts"() {
    "use strict";
    init_parse_move();
    init_utils();
  }
});
var pull_exports = {};
__export2(pull_exports, {
  pullTask: () => pullTask
});
function pullTask(remote, branch, customArgs) {
  const commands8 = ["pull", ...customArgs];
  if (remote && branch) {
    commands8.splice(1, 0, remote, branch);
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser(stdOut, stdErr) {
      return parsePullResult(stdOut, stdErr);
    },
    onError(result, _error, _done, fail) {
      const pullError = parsePullErrorResult(
        bufferToString(result.stdOut),
        bufferToString(result.stdErr)
      );
      if (pullError) {
        return fail(new GitResponseError(pullError));
      }
      fail(_error);
    }
  };
}
var init_pull = __esm2({
  "src/lib/tasks/pull.ts"() {
    "use strict";
    init_git_response_error();
    init_parse_pull();
    init_utils();
  }
});
function parseGetRemotes(text) {
  const remotes = {};
  forEach(text, ([name]) => remotes[name] = { name });
  return Object.values(remotes);
}
function parseGetRemotesVerbose(text) {
  const remotes = {};
  forEach(text, ([name, url, purpose]) => {
    if (!remotes.hasOwnProperty(name)) {
      remotes[name] = {
        name,
        refs: { fetch: "", push: "" }
      };
    }
    if (purpose && url) {
      remotes[name].refs[purpose.replace(/[^a-z]/g, "")] = url;
    }
  });
  return Object.values(remotes);
}
function forEach(text, handler) {
  forEachLineWithContent(text, (line) => handler(line.split(/\s+/)));
}
var init_GetRemoteSummary = __esm2({
  "src/lib/responses/GetRemoteSummary.ts"() {
    "use strict";
    init_utils();
  }
});
var remote_exports = {};
__export2(remote_exports, {
  addRemoteTask: () => addRemoteTask,
  getRemotesTask: () => getRemotesTask,
  listRemotesTask: () => listRemotesTask,
  remoteTask: () => remoteTask,
  removeRemoteTask: () => removeRemoteTask
});
function addRemoteTask(remoteName, remoteRepo, customArgs) {
  return straightThroughStringTask(["remote", "add", ...customArgs, remoteName, remoteRepo]);
}
function getRemotesTask(verbose) {
  const commands8 = ["remote"];
  if (verbose) {
    commands8.push("-v");
  }
  return {
    commands: commands8,
    format: "utf-8",
    parser: verbose ? parseGetRemotesVerbose : parseGetRemotes
  };
}
function listRemotesTask(customArgs) {
  const commands8 = [...customArgs];
  if (commands8[0] !== "ls-remote") {
    commands8.unshift("ls-remote");
  }
  return straightThroughStringTask(commands8);
}
function remoteTask(customArgs) {
  const commands8 = [...customArgs];
  if (commands8[0] !== "remote") {
    commands8.unshift("remote");
  }
  return straightThroughStringTask(commands8);
}
function removeRemoteTask(remoteName) {
  return straightThroughStringTask(["remote", "remove", remoteName]);
}
var init_remote = __esm2({
  "src/lib/tasks/remote.ts"() {
    "use strict";
    init_GetRemoteSummary();
    init_task();
  }
});
var stash_list_exports = {};
__export2(stash_list_exports, {
  stashListTask: () => stashListTask
});
function stashListTask(opt = {}, customArgs) {
  const options = parseLogOptions(opt);
  const commands8 = ["stash", "list", ...options.commands, ...customArgs];
  const parser4 = createListLogSummaryParser(
    options.splitter,
    options.fields,
    logFormatFromCommand(commands8)
  );
  return validateLogFormatConfig(commands8) || {
    commands: commands8,
    format: "utf-8",
    parser: parser4
  };
}
var init_stash_list = __esm2({
  "src/lib/tasks/stash-list.ts"() {
    "use strict";
    init_log_format();
    init_parse_list_log_summary();
    init_diff();
    init_log();
  }
});
var sub_module_exports = {};
__export2(sub_module_exports, {
  addSubModuleTask: () => addSubModuleTask,
  initSubModuleTask: () => initSubModuleTask,
  subModuleTask: () => subModuleTask,
  updateSubModuleTask: () => updateSubModuleTask
});
function addSubModuleTask(repo, path3) {
  return subModuleTask(["add", repo, path3]);
}
function initSubModuleTask(customArgs) {
  return subModuleTask(["init", ...customArgs]);
}
function subModuleTask(customArgs) {
  const commands8 = [...customArgs];
  if (commands8[0] !== "submodule") {
    commands8.unshift("submodule");
  }
  return straightThroughStringTask(commands8);
}
function updateSubModuleTask(customArgs) {
  return subModuleTask(["update", ...customArgs]);
}
var init_sub_module = __esm2({
  "src/lib/tasks/sub-module.ts"() {
    "use strict";
    init_task();
  }
});
function singleSorted(a, b) {
  const aIsNum = isNaN(a);
  const bIsNum = isNaN(b);
  if (aIsNum !== bIsNum) {
    return aIsNum ? 1 : -1;
  }
  return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
  return input.trim();
}
function toNumber(input) {
  if (typeof input === "string") {
    return parseInt(input.replace(/^\D+/g, ""), 10) || 0;
  }
  return 0;
}
var TagList;
var parseTagList;
var init_TagList = __esm2({
  "src/lib/responses/TagList.ts"() {
    "use strict";
    TagList = class {
      constructor(all, latest) {
        this.all = all;
        this.latest = latest;
      }
    };
    parseTagList = function(data, customSort = false) {
      const tags = data.split("\n").map(trimmed).filter(Boolean);
      if (!customSort) {
        tags.sort(function(tagA, tagB) {
          const partsA = tagA.split(".");
          const partsB = tagB.split(".");
          if (partsA.length === 1 || partsB.length === 1) {
            return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
          }
          for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
            const diff = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
            if (diff) {
              return diff;
            }
          }
          return 0;
        });
      }
      const latest = customSort ? tags[0] : [...tags].reverse().find((tag) => tag.indexOf(".") >= 0);
      return new TagList(tags, latest);
    };
  }
});
var tag_exports = {};
__export2(tag_exports, {
  addAnnotatedTagTask: () => addAnnotatedTagTask,
  addTagTask: () => addTagTask,
  tagListTask: () => tagListTask
});
function tagListTask(customArgs = []) {
  const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
  return {
    format: "utf-8",
    commands: ["tag", "-l", ...customArgs],
    parser(text) {
      return parseTagList(text, hasCustomSort);
    }
  };
}
function addTagTask(name) {
  return {
    format: "utf-8",
    commands: ["tag", name],
    parser() {
      return { name };
    }
  };
}
function addAnnotatedTagTask(name, tagMessage) {
  return {
    format: "utf-8",
    commands: ["tag", "-a", "-m", tagMessage, name],
    parser() {
      return { name };
    }
  };
}
var init_tag = __esm2({
  "src/lib/tasks/tag.ts"() {
    "use strict";
    init_TagList();
  }
});
var require_git = __commonJS2({
  "src/git.js"(exports2, module2) {
    "use strict";
    var { GitExecutor: GitExecutor2 } = (init_git_executor(), __toCommonJS2(git_executor_exports));
    var { SimpleGitApi: SimpleGitApi2 } = (init_simple_git_api(), __toCommonJS2(simple_git_api_exports));
    var { Scheduler: Scheduler2 } = (init_scheduler(), __toCommonJS2(scheduler_exports));
    var { configurationErrorTask: configurationErrorTask2 } = (init_task(), __toCommonJS2(task_exports));
    var {
      asArray: asArray2,
      filterArray: filterArray2,
      filterPrimitives: filterPrimitives2,
      filterString: filterString2,
      filterStringOrStringArray: filterStringOrStringArray2,
      filterType: filterType2,
      getTrailingOptions: getTrailingOptions2,
      trailingFunctionArgument: trailingFunctionArgument2,
      trailingOptionsArgument: trailingOptionsArgument2
    } = (init_utils(), __toCommonJS2(utils_exports));
    var { applyPatchTask: applyPatchTask2 } = (init_apply_patch(), __toCommonJS2(apply_patch_exports));
    var {
      branchTask: branchTask2,
      branchLocalTask: branchLocalTask2,
      deleteBranchesTask: deleteBranchesTask2,
      deleteBranchTask: deleteBranchTask2
    } = (init_branch(), __toCommonJS2(branch_exports));
    var { checkIgnoreTask: checkIgnoreTask2 } = (init_check_ignore(), __toCommonJS2(check_ignore_exports));
    var { checkIsRepoTask: checkIsRepoTask2 } = (init_check_is_repo(), __toCommonJS2(check_is_repo_exports));
    var { cloneTask: cloneTask2, cloneMirrorTask: cloneMirrorTask2 } = (init_clone(), __toCommonJS2(clone_exports));
    var { cleanWithOptionsTask: cleanWithOptionsTask2, isCleanOptionsArray: isCleanOptionsArray2 } = (init_clean(), __toCommonJS2(clean_exports));
    var { diffSummaryTask: diffSummaryTask2 } = (init_diff(), __toCommonJS2(diff_exports));
    var { fetchTask: fetchTask2 } = (init_fetch(), __toCommonJS2(fetch_exports));
    var { moveTask: moveTask2 } = (init_move(), __toCommonJS2(move_exports));
    var { pullTask: pullTask2 } = (init_pull(), __toCommonJS2(pull_exports));
    var { pushTagsTask: pushTagsTask2 } = (init_push(), __toCommonJS2(push_exports));
    var {
      addRemoteTask: addRemoteTask2,
      getRemotesTask: getRemotesTask2,
      listRemotesTask: listRemotesTask2,
      remoteTask: remoteTask2,
      removeRemoteTask: removeRemoteTask2
    } = (init_remote(), __toCommonJS2(remote_exports));
    var { getResetMode: getResetMode2, resetTask: resetTask2 } = (init_reset(), __toCommonJS2(reset_exports));
    var { stashListTask: stashListTask2 } = (init_stash_list(), __toCommonJS2(stash_list_exports));
    var {
      addSubModuleTask: addSubModuleTask2,
      initSubModuleTask: initSubModuleTask2,
      subModuleTask: subModuleTask2,
      updateSubModuleTask: updateSubModuleTask2
    } = (init_sub_module(), __toCommonJS2(sub_module_exports));
    var { addAnnotatedTagTask: addAnnotatedTagTask2, addTagTask: addTagTask2, tagListTask: tagListTask2 } = (init_tag(), __toCommonJS2(tag_exports));
    var { straightThroughBufferTask: straightThroughBufferTask2, straightThroughStringTask: straightThroughStringTask2 } = (init_task(), __toCommonJS2(task_exports));
    function Git2(options, plugins) {
      this._plugins = plugins;
      this._executor = new GitExecutor2(
        options.baseDir,
        new Scheduler2(options.maxConcurrentProcesses),
        plugins
      );
      this._trimmed = options.trimmed;
    }
    (Git2.prototype = Object.create(SimpleGitApi2.prototype)).constructor = Git2;
    Git2.prototype.customBinary = function(command) {
      this._plugins.reconfigure("binary", command);
      return this;
    };
    Git2.prototype.env = function(name, value) {
      if (arguments.length === 1 && typeof name === "object") {
        this._executor.env = name;
      } else {
        (this._executor.env = this._executor.env || {})[name] = value;
      }
      return this;
    };
    Git2.prototype.stashList = function(options) {
      return this._runTask(
        stashListTask2(
          trailingOptionsArgument2(arguments) || {},
          filterArray2(options) && options || []
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    function createCloneTask(api, task, repoPath, localPath) {
      if (typeof repoPath !== "string") {
        return configurationErrorTask2(`git.${api}() requires a string 'repoPath'`);
      }
      return task(repoPath, filterType2(localPath, filterString2), getTrailingOptions2(arguments));
    }
    Git2.prototype.clone = function() {
      return this._runTask(
        createCloneTask("clone", cloneTask2, ...arguments),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.mirror = function() {
      return this._runTask(
        createCloneTask("mirror", cloneMirrorTask2, ...arguments),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.mv = function(from, to) {
      return this._runTask(moveTask2(from, to), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutLatestTag = function(then) {
      var git = this;
      return this.pull(function() {
        git.tags(function(err, tags) {
          git.checkout(tags.latest, then);
        });
      });
    };
    Git2.prototype.pull = function(remote, branch, options, then) {
      return this._runTask(
        pullTask2(
          filterType2(remote, filterString2),
          filterType2(branch, filterString2),
          getTrailingOptions2(arguments)
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.fetch = function(remote, branch) {
      return this._runTask(
        fetchTask2(
          filterType2(remote, filterString2),
          filterType2(branch, filterString2),
          getTrailingOptions2(arguments)
        ),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.silent = function(silence) {
      console.warn(
        "simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this will be an error in version 3"
      );
      return this;
    };
    Git2.prototype.tags = function(options, then) {
      return this._runTask(
        tagListTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.rebase = function() {
      return this._runTask(
        straightThroughStringTask2(["rebase", ...getTrailingOptions2(arguments)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.reset = function(mode) {
      return this._runTask(
        resetTask2(getResetMode2(mode), getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.revert = function(commit) {
      const next = trailingFunctionArgument2(arguments);
      if (typeof commit !== "string") {
        return this._runTask(configurationErrorTask2("Commit must be a string"), next);
      }
      return this._runTask(
        straightThroughStringTask2(["revert", ...getTrailingOptions2(arguments, 0, true), commit]),
        next
      );
    };
    Git2.prototype.addTag = function(name) {
      const task = typeof name === "string" ? addTagTask2(name) : configurationErrorTask2("Git.addTag requires a tag name");
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addAnnotatedTag = function(tagName, tagMessage) {
      return this._runTask(
        addAnnotatedTagTask2(tagName, tagMessage),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.deleteLocalBranch = function(branchName, forceDelete, then) {
      return this._runTask(
        deleteBranchTask2(branchName, typeof forceDelete === "boolean" ? forceDelete : false),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.deleteLocalBranches = function(branchNames, forceDelete, then) {
      return this._runTask(
        deleteBranchesTask2(branchNames, typeof forceDelete === "boolean" ? forceDelete : false),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.branch = function(options, then) {
      return this._runTask(
        branchTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.branchLocal = function(then) {
      return this._runTask(branchLocalTask2(), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.raw = function(commands8) {
      const createRestCommands = !Array.isArray(commands8);
      const command = [].slice.call(createRestCommands ? arguments : commands8, 0);
      for (let i = 0; i < command.length && createRestCommands; i++) {
        if (!filterPrimitives2(command[i])) {
          command.splice(i, command.length - i);
          break;
        }
      }
      command.push(...getTrailingOptions2(arguments, 0, true));
      var next = trailingFunctionArgument2(arguments);
      if (!command.length) {
        return this._runTask(
          configurationErrorTask2("Raw: must supply one or more command to execute"),
          next
        );
      }
      return this._runTask(straightThroughStringTask2(command, this._trimmed), next);
    };
    Git2.prototype.submoduleAdd = function(repo, path3, then) {
      return this._runTask(addSubModuleTask2(repo, path3), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleUpdate = function(args, then) {
      return this._runTask(
        updateSubModuleTask2(getTrailingOptions2(arguments, true)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.submoduleInit = function(args, then) {
      return this._runTask(
        initSubModuleTask2(getTrailingOptions2(arguments, true)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.subModule = function(options, then) {
      return this._runTask(
        subModuleTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.listRemote = function() {
      return this._runTask(
        listRemotesTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.addRemote = function(remoteName, remoteRepo, then) {
      return this._runTask(
        addRemoteTask2(remoteName, remoteRepo, getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.removeRemote = function(remoteName, then) {
      return this._runTask(removeRemoteTask2(remoteName), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.getRemotes = function(verbose, then) {
      return this._runTask(getRemotesTask2(verbose === true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.remote = function(options, then) {
      return this._runTask(
        remoteTask2(getTrailingOptions2(arguments)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.tag = function(options, then) {
      const command = getTrailingOptions2(arguments);
      if (command[0] !== "tag") {
        command.unshift("tag");
      }
      return this._runTask(straightThroughStringTask2(command), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.updateServerInfo = function(then) {
      return this._runTask(
        straightThroughStringTask2(["update-server-info"]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.pushTags = function(remote, then) {
      const task = pushTagsTask2(
        { remote: filterType2(remote, filterString2) },
        getTrailingOptions2(arguments)
      );
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rm = function(files) {
      return this._runTask(
        straightThroughStringTask2(["rm", "-f", ...asArray2(files)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.rmKeepLocal = function(files) {
      return this._runTask(
        straightThroughStringTask2(["rm", "--cached", ...asArray2(files)]),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.catFile = function(options, then) {
      return this._catFile("utf-8", arguments);
    };
    Git2.prototype.binaryCatFile = function() {
      return this._catFile("buffer", arguments);
    };
    Git2.prototype._catFile = function(format, args) {
      var handler = trailingFunctionArgument2(args);
      var command = ["cat-file"];
      var options = args[0];
      if (typeof options === "string") {
        return this._runTask(
          configurationErrorTask2("Git.catFile: options must be supplied as an array of strings"),
          handler
        );
      }
      if (Array.isArray(options)) {
        command.push.apply(command, options);
      }
      const task = format === "buffer" ? straightThroughBufferTask2(command) : straightThroughStringTask2(command);
      return this._runTask(task, handler);
    };
    Git2.prototype.diff = function(options, then) {
      const task = filterString2(options) ? configurationErrorTask2(
        "git.diff: supplying options as a single string is no longer supported, switch to an array of strings"
      ) : straightThroughStringTask2(["diff", ...getTrailingOptions2(arguments)]);
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.diffSummary = function() {
      return this._runTask(
        diffSummaryTask2(getTrailingOptions2(arguments, 1)),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.applyPatch = function(patches) {
      const task = !filterStringOrStringArray2(patches) ? configurationErrorTask2(
        `git.applyPatch requires one or more string patches as the first argument`
      ) : applyPatchTask2(asArray2(patches), getTrailingOptions2([].slice.call(arguments, 1)));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revparse = function() {
      const commands8 = ["rev-parse", ...getTrailingOptions2(arguments, true)];
      return this._runTask(
        straightThroughStringTask2(commands8, true),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.clean = function(mode, options, then) {
      const usingCleanOptionsArray = isCleanOptionsArray2(mode);
      const cleanMode = usingCleanOptionsArray && mode.join("") || filterType2(mode, filterString2) || "";
      const customArgs = getTrailingOptions2([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));
      return this._runTask(
        cleanWithOptionsTask2(cleanMode, customArgs),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.exec = function(then) {
      const task = {
        commands: [],
        format: "utf-8",
        parser() {
          if (typeof then === "function") {
            then();
          }
        }
      };
      return this._runTask(task);
    };
    Git2.prototype.clearQueue = function() {
      return this;
    };
    Git2.prototype.checkIgnore = function(pathnames, then) {
      return this._runTask(
        checkIgnoreTask2(asArray2(filterType2(pathnames, filterStringOrStringArray2, []))),
        trailingFunctionArgument2(arguments)
      );
    };
    Git2.prototype.checkIsRepo = function(checkType, then) {
      return this._runTask(
        checkIsRepoTask2(filterType2(checkType, filterString2)),
        trailingFunctionArgument2(arguments)
      );
    };
    module2.exports = Git2;
  }
});
init_pathspec();
init_git_error();
var GitConstructError = class extends GitError {
  constructor(config, message) {
    super(void 0, message);
    this.config = config;
  }
};
init_git_error();
init_git_error();
var GitPluginError = class extends GitError {
  constructor(task, plugin, message) {
    super(task, message);
    this.task = task;
    this.plugin = plugin;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
init_git_response_error();
init_task_configuration_error();
init_check_is_repo();
init_clean();
init_config();
init_diff_name_status();
init_grep();
init_reset();
function abortPlugin(signal) {
  if (!signal) {
    return;
  }
  const onSpawnAfter = {
    type: "spawn.after",
    action(_data, context) {
      function kill() {
        context.kill(new GitPluginError(void 0, "abort", "Abort signal received"));
      }
      signal.addEventListener("abort", kill);
      context.spawned.on("close", () => signal.removeEventListener("abort", kill));
    }
  };
  const onSpawnBefore = {
    type: "spawn.before",
    action(_data, context) {
      if (signal.aborted) {
        context.kill(new GitPluginError(void 0, "abort", "Abort already signaled"));
      }
    }
  };
  return [onSpawnBefore, onSpawnAfter];
}
function isConfigSwitch(arg) {
  return typeof arg === "string" && arg.trim().toLowerCase() === "-c";
}
function preventProtocolOverride(arg, next) {
  if (!isConfigSwitch(arg)) {
    return;
  }
  if (!/^\s*protocol(.[a-z]+)?.allow/.test(next)) {
    return;
  }
  throw new GitPluginError(
    void 0,
    "unsafe",
    "Configuring protocol.allow is not permitted without enabling allowUnsafeExtProtocol"
  );
}
function preventUploadPack(arg, method) {
  if (/^\s*--(upload|receive)-pack/.test(arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of --upload-pack or --receive-pack is not permitted without enabling allowUnsafePack`
    );
  }
  if (method === "clone" && /^\s*-u\b/.test(arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of clone with option -u is not permitted without enabling allowUnsafePack`
    );
  }
  if (method === "push" && /^\s*--exec\b/.test(arg)) {
    throw new GitPluginError(
      void 0,
      "unsafe",
      `Use of push with option --exec is not permitted without enabling allowUnsafePack`
    );
  }
}
function blockUnsafeOperationsPlugin({
  allowUnsafeProtocolOverride = false,
  allowUnsafePack = false
} = {}) {
  return {
    type: "spawn.args",
    action(args, context) {
      args.forEach((current, index) => {
        const next = index < args.length ? args[index + 1] : "";
        allowUnsafeProtocolOverride || preventProtocolOverride(current, next);
        allowUnsafePack || preventUploadPack(current, context.method);
      });
      return args;
    }
  };
}
init_utils();
function commandConfigPrefixingPlugin(configuration) {
  const prefix = prefixedArray(configuration, "-c");
  return {
    type: "spawn.args",
    action(data) {
      return [...prefix, ...data];
    }
  };
}
init_utils();
var never = (0, import_promise_deferred2.deferred)().promise;
function completionDetectionPlugin({
  onClose = true,
  onExit = 50
} = {}) {
  function createEvents() {
    let exitCode = -1;
    const events = {
      close: (0, import_promise_deferred2.deferred)(),
      closeTimeout: (0, import_promise_deferred2.deferred)(),
      exit: (0, import_promise_deferred2.deferred)(),
      exitTimeout: (0, import_promise_deferred2.deferred)()
    };
    const result = Promise.race([
      onClose === false ? never : events.closeTimeout.promise,
      onExit === false ? never : events.exitTimeout.promise
    ]);
    configureTimeout(onClose, events.close, events.closeTimeout);
    configureTimeout(onExit, events.exit, events.exitTimeout);
    return {
      close(code) {
        exitCode = code;
        events.close.done();
      },
      exit(code) {
        exitCode = code;
        events.exit.done();
      },
      get exitCode() {
        return exitCode;
      },
      result
    };
  }
  function configureTimeout(flag, event, timeout) {
    if (flag === false) {
      return;
    }
    (flag === true ? event.promise : event.promise.then(() => delay(flag))).then(timeout.done);
  }
  return {
    type: "spawn.after",
    async action(_data, { spawned, close }) {
      const events = createEvents();
      let deferClose = true;
      let quickClose = () => void (deferClose = false);
      spawned.stdout?.on("data", quickClose);
      spawned.stderr?.on("data", quickClose);
      spawned.on("error", quickClose);
      spawned.on("close", (code) => events.close(code));
      spawned.on("exit", (code) => events.exit(code));
      try {
        await events.result;
        if (deferClose) {
          await delay(50);
        }
        close(events.exitCode);
      } catch (err) {
        close(events.exitCode, err);
      }
    }
  };
}
init_utils();
var WRONG_NUMBER_ERR = `Invalid value supplied for custom binary, requires a single string or an array containing either one or two strings`;
var WRONG_CHARS_ERR = `Invalid value supplied for custom binary, restricted characters must be removed or supply the unsafe.allowUnsafeCustomBinary option`;
function isBadArgument(arg) {
  return !arg || !/^([a-z]:)?([a-z0-9/.\\_-]+)$/i.test(arg);
}
function toBinaryConfig(input, allowUnsafe) {
  if (input.length < 1 || input.length > 2) {
    throw new GitPluginError(void 0, "binary", WRONG_NUMBER_ERR);
  }
  const isBad = input.some(isBadArgument);
  if (isBad) {
    if (allowUnsafe) {
      console.warn(WRONG_CHARS_ERR);
    } else {
      throw new GitPluginError(void 0, "binary", WRONG_CHARS_ERR);
    }
  }
  const [binary, prefix] = input;
  return {
    binary,
    prefix
  };
}
function customBinaryPlugin(plugins, input = ["git"], allowUnsafe = false) {
  let config = toBinaryConfig(asArray(input), allowUnsafe);
  plugins.on("binary", (input2) => {
    config = toBinaryConfig(asArray(input2), allowUnsafe);
  });
  plugins.append("spawn.binary", () => {
    return config.binary;
  });
  plugins.append("spawn.args", (data) => {
    return config.prefix ? [config.prefix, ...data] : data;
  });
}
init_git_error();
function isTaskError(result) {
  return !!(result.exitCode && result.stdErr.length);
}
function getErrorMessage(result) {
  return Buffer.concat([...result.stdOut, ...result.stdErr]);
}
function errorDetectionHandler(overwrite = false, isError = isTaskError, errorMessage = getErrorMessage) {
  return (error, result) => {
    if (!overwrite && error || !isError(result)) {
      return error;
    }
    return errorMessage(result);
  };
}
function errorDetectionPlugin(config) {
  return {
    type: "task.error",
    action(data, context) {
      const error = config(data.error, {
        stdErr: context.stdErr,
        stdOut: context.stdOut,
        exitCode: context.exitCode
      });
      if (Buffer.isBuffer(error)) {
        return { error: new GitError(void 0, error.toString("utf-8")) };
      }
      return {
        error
      };
    }
  };
}
init_utils();
var PluginStore = class {
  constructor() {
    this.plugins = /* @__PURE__ */ new Set();
    this.events = new import_node_events.EventEmitter();
  }
  on(type, listener) {
    this.events.on(type, listener);
  }
  reconfigure(type, data) {
    this.events.emit(type, data);
  }
  append(type, action) {
    const plugin = append(this.plugins, { type, action });
    return () => this.plugins.delete(plugin);
  }
  add(plugin) {
    const plugins = [];
    asArray(plugin).forEach((plugin2) => plugin2 && this.plugins.add(append(plugins, plugin2)));
    return () => {
      plugins.forEach((plugin2) => this.plugins.delete(plugin2));
    };
  }
  exec(type, data, context) {
    let output = data;
    const contextual = Object.freeze(Object.create(context));
    for (const plugin of this.plugins) {
      if (plugin.type === type) {
        output = plugin.action(output, contextual);
      }
    }
    return output;
  }
};
init_utils();
function progressMonitorPlugin(progress) {
  const progressCommand = "--progress";
  const progressMethods = ["checkout", "clone", "fetch", "pull", "push"];
  const onProgress = {
    type: "spawn.after",
    action(_data, context) {
      if (!context.commands.includes(progressCommand)) {
        return;
      }
      context.spawned.stderr?.on("data", (chunk) => {
        const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(chunk.toString("utf8"));
        if (!message) {
          return;
        }
        progress({
          method: context.method,
          stage: progressEventStage(message[1]),
          progress: asNumber(message[2]),
          processed: asNumber(message[3]),
          total: asNumber(message[4])
        });
      });
    }
  };
  const onArgs = {
    type: "spawn.args",
    action(args, context) {
      if (!progressMethods.includes(context.method)) {
        return args;
      }
      return including(args, progressCommand);
    }
  };
  return [onArgs, onProgress];
}
function progressEventStage(input) {
  return String(input.toLowerCase().split(" ", 1)) || "unknown";
}
init_utils();
function spawnOptionsPlugin(spawnOptions) {
  const options = pick(spawnOptions, ["uid", "gid"]);
  return {
    type: "spawn.options",
    action(data) {
      return { ...options, ...data };
    }
  };
}
function timeoutPlugin({
  block,
  stdErr = true,
  stdOut = true
}) {
  if (block > 0) {
    return {
      type: "spawn.after",
      action(_data, context) {
        let timeout;
        function wait2() {
          timeout && clearTimeout(timeout);
          timeout = setTimeout(kill, block);
        }
        function stop() {
          context.spawned.stdout?.off("data", wait2);
          context.spawned.stderr?.off("data", wait2);
          context.spawned.off("exit", stop);
          context.spawned.off("close", stop);
          timeout && clearTimeout(timeout);
        }
        function kill() {
          stop();
          context.kill(new GitPluginError(void 0, "timeout", `block timeout reached`));
        }
        stdOut && context.spawned.stdout?.on("data", wait2);
        stdErr && context.spawned.stderr?.on("data", wait2);
        context.spawned.on("exit", stop);
        context.spawned.on("close", stop);
        wait2();
      }
    };
  }
}
init_pathspec();
function suffixPathsPlugin() {
  return {
    type: "spawn.args",
    action(data) {
      const prefix = [];
      let suffix;
      function append2(args) {
        (suffix = suffix || []).push(...args);
      }
      for (let i = 0; i < data.length; i++) {
        const param = data[i];
        if (isPathSpec(param)) {
          append2(toPaths(param));
          continue;
        }
        if (param === "--") {
          append2(
            data.slice(i + 1).flatMap((item) => isPathSpec(item) && toPaths(item) || item)
          );
          break;
        }
        prefix.push(param);
      }
      return !suffix ? prefix : [...prefix, "--", ...suffix.map(String)];
    }
  };
}
init_utils();
var Git = require_git();
function gitInstanceFactory(baseDir, options) {
  const plugins = new PluginStore();
  const config = createInstanceConfig(
    baseDir && (typeof baseDir === "string" ? { baseDir } : baseDir) || {},
    options
  );
  if (!folderExists(config.baseDir)) {
    throw new GitConstructError(
      config,
      `Cannot use simple-git on a directory that does not exist`
    );
  }
  if (Array.isArray(config.config)) {
    plugins.add(commandConfigPrefixingPlugin(config.config));
  }
  plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
  plugins.add(suffixPathsPlugin());
  plugins.add(completionDetectionPlugin(config.completion));
  config.abort && plugins.add(abortPlugin(config.abort));
  config.progress && plugins.add(progressMonitorPlugin(config.progress));
  config.timeout && plugins.add(timeoutPlugin(config.timeout));
  config.spawnOptions && plugins.add(spawnOptionsPlugin(config.spawnOptions));
  plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
  config.errors && plugins.add(errorDetectionPlugin(config.errors));
  customBinaryPlugin(plugins, config.binary, config.unsafe?.allowUnsafeCustomBinary);
  return new Git(config, plugins);
}
init_git_response_error();
var esm_default = gitInstanceFactory;

// src/utils/git/shadowRepo.ts
var AI_COMMIT_PREFIX = "chore(ai): apply suggestion";
var LAST_COMMIT_PREFIX_KEY = "ai.shadow.lastCommit";
function convertToPosix(p) {
  return p.replace(/\\/g, "/");
}
function getWorkspaceRootForUri(docUri) {
  const workspaceFolder = vscode8.workspace.getWorkspaceFolder(docUri);
  if (workspaceFolder?.uri?.fsPath) {
    return workspaceFolder.uri.fsPath;
  }
  const firstFolderUri = vscode8.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (firstFolderUri) {
    return firstFolderUri;
  }
  throw new Error("No workspace folder found for this document.");
}
function slugWorkTree(fsPath) {
  return fsPath.replace(/[:\\\/]/g, "_").slice(-120);
}
async function ensureDir(fsPath) {
  await vscode8.workspace.fs.createDirectory(vscode8.Uri.file(fsPath));
}
async function openShadowRepoForDocument(context, docUri) {
  const workTree = getWorkspaceRootForUri(docUri);
  const slug = slugWorkTree(workTree);
  const repoRoot = path.join(context.globalStorageUri.fsPath, "shadow", slug);
  const gitDir = path.join(repoRoot, ".git");
  const lastKey = `${LAST_COMMIT_PREFIX_KEY}.${slug}`;
  await ensureDir(context.globalStorageUri.fsPath);
  await ensureDir(repoRoot);
  const git = esm_default({ baseDir: workTree });
  try {
    await git.raw(["--git-dir", gitDir, "rev-parse", "--git-dir"]);
  } catch {
    await git.raw(["-C", repoRoot, "init"]);
    await git.raw(["--git-dir", gitDir, "config", "user.name", "AI Reviewer"]);
    await git.raw(["--git-dir", gitDir, "config", "user.email", "ai@example.local"]);
    await git.raw(["--git-dir", gitDir, "config", "core.worktree", workTree]);
  }
  return { git, gitDir, workTree, repoRoot, lastKey };
}
async function shadowCommitFiles(context, shadow, absFiles, aiExplanation) {
  const relativeFilePaths = absFiles.map((f) => convertToPosix(path.relative(shadow.workTree, f)));
  for (const relativeFilePath of relativeFilePaths) {
    if (relativeFilePath.startsWith("..")) {
      throw new Error(`File is outside the workspace root tracked by shadow Git: ${relativeFilePath}`);
    }
  }
  await shadow.git.raw(["--git-dir", shadow.gitDir, "-C", shadow.workTree, "add", "--", ...relativeFilePaths]);
  const commitMessage = `${AI_COMMIT_PREFIX} (${aiExplanation})`;
  await shadow.git.raw(["--git-dir", shadow.gitDir, "-C", shadow.workTree, "commit", "-m", commitMessage]);
  const head = (await shadow.git.raw(["--git-dir", shadow.gitDir, "rev-parse", "HEAD"])).trim();
  await context.globalState.update(shadow.lastKey, head);
  return head;
}
async function shadowIsTracked(shadow, relPosixPath) {
  try {
    await shadow.git.raw(["--git-dir", shadow.gitDir, "-C", shadow.workTree, "ls-files", "--error-unmatch", "--", relPosixPath]);
    return true;
  } catch {
    return false;
  }
}
async function shadowEnsureBaseline(shadow, absPath) {
  const rel = convertToPosix(path.relative(shadow.workTree, absPath));
  if (await shadowIsTracked(shadow, rel)) {
    return;
  }
  await shadow.git.raw(["--git-dir", shadow.gitDir, "-C", shadow.workTree, "add", "--", rel]);
  await shadow.git.raw(["--git-dir", shadow.gitDir, "-C", shadow.workTree, "commit", "-m", `chore(ai): baseline ${rel}`]);
}

// src/utils/webview/webviewMessageHandler.ts
function handleWebviewMessage(panelInstance2, context) {
  panelInstance2.webview.onDidReceiveMessage(
    async (message) => {
      try {
        const originalSelection = new vscode9.Selection(
          new vscode9.Position(message.selection.start.line, message.selection.start.character),
          new vscode9.Position(message.selection.end.line, message.selection.end.character)
        );
        switch (message.command) {
          case "accept":
            await handleAccept(context, message, originalSelection, panelInstance2);
            break;
          case "reject":
            vscode9.window.showInformationMessage("AI suggestion rejected.");
            panelInstance2.dispose();
            break;
          case "editPreferences":
            vscode9.commands.executeCommand("extension.setAIPreferences", message.documentUri);
            break;
          case "clearPreferences":
            vscode9.commands.executeCommand("extension.clearAIPreferences", message.documentUri);
            break;
          case "changeModel":
            vscode9.commands.executeCommand("extension.changeOllamaModel", message.documentUri);
            break;
          case "requestModels":
            await sendModelsList(context, panelInstance2);
            break;
          case "setModelDirect":
            const picked = String(message.model || "").trim();
            if (!picked) {
              break;
            }
            await setCurrentModel(context, picked);
            vscode9.window.showInformationMessage(`Ollama model set to: ${picked}`);
            await sendModelsList(context, panelInstance2);
            await promptAndShowSuggestion(message.documentUri);
            break;
          case "stopStream":
            abortActiveRequest();
            break;
          case "refresh":
            const docUri = vscode9.Uri.parse(message.documentUri);
            const doc = await vscode9.workspace.openTextDocument(docUri);
            const editor = await vscode9.window.showTextDocument(doc, {
              preserveFocus: false,
              viewColumn: vscode9.ViewColumn.One
            });
            if (message.selection) {
              const selection = new vscode9.Selection(
                new vscode9.Position(message.selection.start.line, message.selection.start.character),
                new vscode9.Position(message.selection.end.line, message.selection.end.character)
              );
              editor.selection = selection;
              editor.revealRange(
                new vscode9.Range(selection.start, selection.end),
                vscode9.TextEditorRevealType.InCenterIfOutsideViewport
              );
            }
            await vscode9.commands.executeCommand("extension.showSuggestion");
            break;
          case "toggleRag":
            try {
              const cfg = vscode9.workspace.getConfiguration("wsCodeReview");
              const cur = cfg.get("rag.enable", false);
              const next = !cur;
              try {
                await cfg.update("rag.enable", next, vscode9.ConfigurationTarget.Workspace);
              } catch {
                await cfg.update("rag.enable", next, vscode9.ConfigurationTarget.Global);
              }
              panelInstance2.webview.postMessage({ command: "ragStatus", enabled: next });
              vscode9.window.setStatusBarMessage(`RAG ${next ? "enabled" : "disabled"}`, 3e3);
            } catch (e) {
              vscode9.window.showErrorMessage(`Failed to toggle RAG: ${e?.message ?? e}`);
            }
            break;
          default:
            console.warn(`Unhandled command received from webview: ${message.command}`);
            break;
        }
      } catch (err) {
        console.error(`Error handling message from webview: ${err}`);
        vscode9.window.showErrorMessage("An error occurred while processing the suggestion.");
      }
    },
    void 0
  );
}
async function sendModelsList(context, panelInstance2) {
  const [currentModel, models] = await Promise.all([
    getCurrentModel(context),
    listOllamaModels(context)
  ]);
  panelInstance2.webview.postMessage({
    command: "modelsList",
    currentModel,
    models
  });
}
async function handleAccept(context, message, originalSelection, panelInstance2) {
  if (!message.aiSuggestedCode) {
    vscode9.window.showErrorMessage("AI did not provide improved code to apply.");
    return;
  }
  if (!message.selection || !message.documentUri) {
    vscode9.window.showErrorMessage("Missing selection or document URI for applying suggestion.");
    return;
  }
  const docUri = vscode9.Uri.parse(message.documentUri);
  const workspaceConfig = vscode9.workspace.getConfiguration("wsCodeReview");
  const enableShadow = workspaceConfig.get("git.enable", false);
  try {
    let doc = await vscode9.workspace.openTextDocument(docUri);
    if (enableShadow && doc.isDirty) {
      await doc.save();
    }
    let shadow;
    if (enableShadow) {
      shadow = await openShadowRepoForDocument(context, docUri);
      await shadowEnsureBaseline(shadow, docUri.fsPath);
    }
    await applySuggestion(message.aiSuggestedCode, originalSelection, docUri, message.applyMode || "full" /* Full */);
    doc = await vscode9.workspace.openTextDocument(docUri);
    if (enableShadow) {
      await doc.save();
    }
    if (enableShadow && shadow) {
      const hash = await shadowCommitFiles(context, shadow, [docUri.fsPath], message.aiExplanation);
      vscode9.window.setStatusBarMessage(`AI snapshot (shadow): ${hash.slice(0, 7)}`, 4e3);
    }
  } catch (error) {
    vscode9.window.showWarningMessage(`Shadow commit failed: ${error?.message ?? String(error)}`);
  }
  panelInstance2.dispose();
}

// src/utils/ui/suggestionWebview.ts
async function showSuggestionWebview(_initialResponsePlaceholder, context, fileName) {
  const existingPanel = getPanel();
  const userPreferences = await getUserPreferences(context);
  if (existingPanel) {
    existingPanel.reveal(vscode10.ViewColumn.Beside);
    existingPanel.webview.html = getWebviewContent(
      existingPanel.webview,
      context.extensionUri,
      fileName,
      userPreferences
    );
    return existingPanel;
  }
  const newPanel = vscode10.window.createWebviewPanel(
    "aiSuggestionPanel",
    "WS Code Review",
    vscode10.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode10.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR),
        vscode10.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR, "highlightjs"),
        vscode10.Uri.joinPath(context.extensionUri, "src", "utils", "webview")
      ]
    }
  );
  setPanel(newPanel);
  newPanel.onDidDispose(() => {
    setPanel(void 0);
  }, null, context.subscriptions);
  handleWebviewMessage(newPanel, context);
  newPanel.webview.html = getWebviewContent(
    newPanel.webview,
    context.extensionUri,
    fileName,
    userPreferences
  );
  return newPanel;
}

// src/commands/showSuggestion.ts
function expandToWholeLines(doc, selection) {
  const start = new vscode11.Position(selection.start.line, 0);
  const endLineText = doc.lineAt(selection.end.line).text;
  const end = new vscode11.Position(selection.end.line, endLineText.length);
  return new vscode11.Selection(start, end);
}
function registerShowSuggestion(context) {
  return vscode11.commands.registerCommand("extension.showSuggestion", async () => {
    vscode11.window.setStatusBarMessage("\u{1F916} Analyzing F# code...", 5e3);
    const editor = vscode11.window.activeTextEditor;
    if (!editor) {
      vscode11.window.showErrorMessage("No active F# editor found.");
      return;
    }
    const document2 = editor.document;
    if (document2.languageId !== "fsharp") {
      vscode11.window.showErrorMessage("This command only works on F# files.");
      return;
    }
    const fileName = document2.fileName;
    const rawSel = editor.selection;
    const wholeFileContent = document2.getText();
    const lineCount = wholeFileContent.split(/\r?\n/).length;
    const isBig = lineCount >= BIG_FILE_LINE_THRESHOLD;
    const selection = isBig ? expandToWholeLines(document2, rawSel) : rawSel;
    const selectedCode = document2.getText(selection);
    if (selection.isEmpty || !selectedCode.trim()) {
      vscode11.window.showWarningMessage("Please select some F# code to review.");
      return;
    }
    const { prompt, applyMode } = await buildPrompt(
      selectedCode,
      wholeFileContent,
      fileName,
      selection,
      context
    );
    console.log(prompt);
    const suggestionPanel = await showSuggestionWebview("", context, fileName);
    if (!suggestionPanel) {
      vscode11.window.showErrorMessage("Failed to open suggestion panel.");
      return;
    }
    const userPreferences = await getUserPreferences(context);
    const currentModel = getCurrentModel(context);
    const workspaceConfig = vscode11.workspace.getConfiguration("wsCodeReview");
    const ragEnabled = workspaceConfig.get("rag.enable", false);
    suggestionPanel.webview.postMessage({
      command: "init",
      wholeFileContent,
      selection: selection ? {
        start: { line: selection.start.line, character: selection.start.character },
        end: { line: selection.end.line, character: selection.end.character }
      } : null,
      documentUri: document2.uri?.toString() || null,
      userPreferences,
      currentModel,
      applyMode,
      ragEnabled
    });
    let accumulatedResponse = "";
    let hadStreamError = false;
    try {
      for await (const chunk of queryAIStream(suggestionPanel, prompt, context)) {
        accumulatedResponse += chunk;
        suggestionPanel.webview.postMessage({ command: "aiChunk", chunk });
      }
      if (!hadStreamError) {
        suggestionPanel.webview.postMessage({ command: "aiStreamEnd", fullResponse: accumulatedResponse });
        showOutput(fileName, accumulatedResponse);
      }
    } catch (error) {
      if (error instanceof UserAbort || error.name === "UserAbort") {
        return;
      }
      hadStreamError = true;
      console.error("Error during AI response streaming:", error);
      suggestionPanel.webview.postMessage({
        command: "aiError",
        error: "Failed to get full response from Ollama. (Make sure Ollama is running)"
      });
    }
  });
}

// src/commands/aiPreferences.ts
var vscode12 = __toESM(require("vscode"));
function registerSetAIPreferences(context) {
  return vscode12.commands.registerCommand(
    "extension.setAIPreferences",
    (documentUri) => setUserPreferences(context, documentUri)
  );
}
function registerShowAIPreferences(context) {
  return vscode12.commands.registerCommand(
    "extension.showAIPreferences",
    () => showUserPreferences(context)
  );
}
function registerClearAIPreferences(context) {
  return vscode12.commands.registerCommand(
    "extension.clearAIPreferences",
    (documentUri) => clearUserPreferences(context, documentUri)
  );
}

// src/commands/changeOllamaModel.ts
var vscode13 = __toESM(require("vscode"));
var CMD_CHANGE_MODEL = "extension.changeOllamaModel";
var CMD_SHOW_SUGGESTION = "extension.showSuggestion";
var DEFAULT_API = "http://localhost:11434/api/generate";
function registerChangeOllamaModel(context) {
  return vscode13.commands.registerCommand(
    CMD_CHANGE_MODEL,
    async (documentUri) => {
      try {
        const api = await pickEndpoint(context);
        if (!api) {
          return;
        }
        await setCurrentApi(context, api);
        const model = await pickModel(context);
        if (!model) {
          return;
        }
        await setCurrentModel(context, model);
        vscode13.window.showInformationMessage(`Ollama model set to: ${model}`);
        if (documentUri) {
          await promptAndShowSuggestion(documentUri);
        }
      } catch (err) {
        vscode13.window.showErrorMessage(
          `Failed to change Ollama model: ${err?.message ?? String(err)}`
        );
      }
    }
  );
}
async function promptAndShowSuggestion(documentUri) {
  const go = await vscode13.window.showInformationMessage(
    `Run "Show Suggestion" now with the new model?`,
    "Yes",
    "No"
  );
  if (go === "Yes") {
    const doc = await vscode13.workspace.openTextDocument(
      vscode13.Uri.parse(documentUri)
    );
    await vscode13.window.showTextDocument(doc, {
      preserveFocus: false,
      viewColumn: vscode13.ViewColumn.One
    });
    await vscode13.commands.executeCommand(CMD_SHOW_SUGGESTION);
  }
}
async function pickEndpoint(context) {
  const current = getCurrentApi(context) || DEFAULT_API;
  const choice = await vscode13.window.showQuickPick(
    [
      { label: "Use current endpoint", description: current, value: current },
      {
        label: "Enter custom endpoint\u2026",
        description: "e.g. http://localhost:11434/api/generate"
      }
    ],
    { placeHolder: "Select Ollama endpoint" }
  );
  if (!choice) {
    return;
  }
  if (!choice.value) {
    const entered = await vscode13.window.showInputBox({
      prompt: "Ollama Generate API endpoint",
      value: current,
      validateInput: (v) => v.trim() ? void 0 : "Endpoint is required"
    });
    return entered?.trim();
  }
  return choice.value;
}
async function pickModel(context) {
  const [current, models] = await Promise.all([
    getCurrentModel(context),
    listOllamaModels(context)
  ]);
  const discovered = models.map((m) => ({ label: m, value: m }));
  const items = [
    ...discovered,
    {
      label: "Enter custom model\u2026",
      description: "Type any local Ollama model tag"
    }
  ];
  const picked = await vscode13.window.showQuickPick(items, {
    placeHolder: models.length ? `Select model (current: ${current})` : `No models found. Enter a custom model (current: ${current}).`,
    matchOnDescription: true
  });
  if (!picked) {
    return;
  }
  if (!picked.value) {
    const manual = await vscode13.window.showInputBox({
      prompt: "Enter the Ollama model tag",
      value: current,
      validateInput: (v) => v.trim() ? void 0 : "Model is required"
    });
    return manual?.trim();
  }
  return picked.value;
}

// src/commands/showShadowHistory.ts
var vscode14 = __toESM(require("vscode"));
var path2 = __toESM(require("node:path"));
function relPosix(from, abs) {
  return path2.relative(from, abs).split(path2.sep).join("/");
}
function registerShowShadowHistory(context) {
  return vscode14.commands.registerCommand("extension.showShadowHistory", async () => {
    const editor = vscode14.window.activeTextEditor;
    if (!editor) {
      vscode14.window.showWarningMessage("No active editor.");
      return;
    }
    const docUri = editor.document.uri;
    try {
      const shadow = await openShadowRepoForDocument(context, docUri);
      const relativePath = relPosix(shadow.workTree, docUri.fsPath);
      const log = await shadow.git.raw([
        "--git-dir",
        shadow.gitDir,
        "-C",
        shadow.workTree,
        "log",
        "--follow",
        "--oneline",
        "--decorate",
        "--",
        relativePath
      ]);
      const lines = log.split(/\r?\n/).filter(Boolean);
      if (!lines.length) {
        vscode14.window.showInformationMessage("No shadow commits for this file yet.");
        return;
      }
      const pick2 = await vscode14.window.showQuickPick(
        lines.map((line) => ({ label: line, description: relativePath })),
        { placeHolder: "Select a commit to view details" }
      );
      if (!pick2) {
        return;
      }
      const commit = pick2.label.split(" ")[0];
      const detail = await shadow.git.raw([
        "--git-dir",
        shadow.gitDir,
        "-C",
        shadow.workTree,
        "show",
        "--patch",
        "--stat",
        "-U3",
        commit,
        "--",
        relativePath
      ]);
      const doc = await vscode14.workspace.openTextDocument({
        content: detail,
        language: "diff"
      });
      await vscode14.window.showTextDocument(doc, {
        preview: true,
        viewColumn: vscode14.ViewColumn.Beside
      });
    } catch (e) {
      vscode14.window.showErrorMessage(`Shadow history error: ${e?.message ?? e}`);
    }
  });
}

// src/commands/clearShadowHistory.ts
var vscode15 = __toESM(require("vscode"));
async function deleteUri(uri) {
  await vscode15.workspace.fs.delete(uri, { recursive: true, useTrash: true });
}
function registerClearShadowHistory(context) {
  return vscode15.commands.registerCommand("extension.clearShadowHistory", async () => {
    const pick2 = await vscode15.window.showQuickPick(
      [
        { label: "Clear current workspace shadow Git history", action: "current" },
        { label: "Clear ALL shadow Git histories", action: "all" },
        { label: "Cancel", action: "cancel" }
      ],
      { placeHolder: "This only affects the extension's shadow repos (not your own Git)." }
    );
    if (!pick2 || pick2.action === "cancel") {
      return;
    }
    try {
      if (pick2.action === "current") {
        const editor = vscode15.window.activeTextEditor;
        if (!editor) {
          vscode15.window.showWarningMessage("No active editor.");
          return;
        }
        const activeUri = editor.document.uri;
        const workTree = getWorkspaceRootForUri(activeUri);
        if (!workTree) {
          vscode15.window.showWarningMessage("No workspace folder found.");
          return;
        }
        const slug = slugWorkTree(workTree);
        const shadowDir = vscode15.Uri.joinPath(context.globalStorageUri, "shadow", slug);
        const lastKey = `${LAST_COMMIT_PREFIX_KEY}.${slug}`;
        const confirm = await vscode15.window.showWarningMessage(
          `Delete shadow history for this workspace?
${shadowDir.fsPath}`,
          { modal: true },
          "Delete"
        );
        if (confirm !== "Delete") {
          return;
        }
        await deleteUri(shadowDir);
        await context.globalState.update(lastKey, void 0);
        vscode15.window.showInformationMessage("Shadow history cleared for current workspace.");
      } else if (pick2.action === "all") {
        const root = vscode15.Uri.joinPath(context.globalStorageUri, "shadow");
        const confirm = await vscode15.window.showWarningMessage(
          `Delete ALL shadow histories?
${root.fsPath}`,
          { modal: true },
          "Delete ALL"
        );
        if (confirm !== "Delete ALL") {
          return;
        }
        await deleteUri(root);
        await context.globalState.update("ai.shadow.lastCommit", void 0);
        vscode15.window.showInformationMessage("All shadow histories cleared.");
      }
    } catch (e) {
      vscode15.window.showErrorMessage(`Failed to clear shadow history: ${e?.message ?? e}`);
    }
  });
}

// src/extension.ts
function activate(context) {
  context.subscriptions.push(
    registerShowSuggestion(context),
    registerSetAIPreferences(context),
    registerShowAIPreferences(context),
    registerClearAIPreferences(context),
    registerChangeOllamaModel(context),
    registerShowShadowHistory(context),
    registerClearShadowHistory(context)
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
