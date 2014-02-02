/**
 * @author hiebj (Jonathan Hieb)
 *
 * QuickFilter is a simple text filter plugin that docks to a grid and filters the visible columns.
 *
 * The QuickFilter is implemented as a single textfield with the {@link Ext.AbstractPlugin} mixin. When the
 * contents of the field change, the plugin will filter the Grid's underlying store using a "word matching"
 * strategy, comparing the words in the filter against the rendered content of the cells.
 *
 * In short, a record passes the filter if each word of the filter is contained within at least one visible
 * cell for that record.
 *
 * For a live example, check out the Fiddle: https://fiddle.sencha.com/#fiddle/1b1
 */
Ext.define('Ext.ux.grid.QuickFilter', {
    mixins: { plugin: 'Ext.AbstractPlugin' },
    extend: 'Ext.form.field.Text',
    alias: 'plugin.grid',

    /**
     * @cfg {Number} buffer
     * How long the field will wait between keystrokes before filtering. Defaults to 500
     */
    buffer: 500,

    /**
     * @cfg {Boolean} selectSingle
     * By default, the TextFilter will automatically select a record if it is the only record matching the filter.
     * Set this to 'false' to disable this behavior.
     */
    selectSingle: true,

    /**
     * @cfg {String} emptyText
     * The text to display when the filter is empty. Defaults to 'filter...'
     */
    emptyText: 'filter...',

    init: function(grid) {
        this.grid = grid;
        this.emptyText = this.emptyText || 'filter...';
        this.dock = this.dock || 'top';
        this.filterTask = new Ext.util.DelayedTask();
        this.searchMap = new Ext.util.MixedCollection();
        this.grid.on({
            columnschanged: this.clear,
            reconfigure: function() {
                this.clear();
                this.bindStore(this.grid.store);
            },
            scope: this
        });
        this.bindStore(this.grid.store);
        grid.textFilter = this;
        this.mixins.plugin.init.apply(this, arguments);
        this.initComponent();
        grid.addDocked(this);
    },

    bindStore: function(store) {
        store.on({
            load: this.clear,
            bulkremove: this.onBulkRemove,
            clear: this.clear,
            update: this.onUpdate,
            scope: this
        });
    },

    // Clears the cached search string when a record is changed
    onUpdate: function(store, record) {
        this.remove(record);
    },

    remove: function(record) {
        this.searchMap.removeAtKey(record.internalId);
    },

    // Clears the whole cache when grid configuration is changed
    clear: function() {
        this.searchMap.clear();
    },

    onBulkRemove: function(store, records) {
        Ext.each(records, function(record) {
            this.remove(record);
        }, this);
    },

    /**
     * @override
     * Prevent the default behavior (validate and checkDirty) from executing, rather than using an event
     */
    onChange: function(newVal, oldVal) {
        this.filterTask.cancel();
        this.filterTask.delay(this.buffer, this.doFilter, this);
    },

    /**
     * @private
     * Search the rows for each "word" in the filter.
     * If each word of the filter is contained within at least one field of a row, it's considered a match.
     */
    doFilter: function() {
        var filter = this.normalize(this.getValue()),
            store = this.grid.getStore(),
            filterId = this.id + '-filter-text';
        if (!Ext.isEmpty(filter)) {
            filter = filter.split(' ');
            store.addFilter({
                id: filterId,
                filterFn: function(record) {
                    var show = true;
                    // Check each word
                    Ext.each(filter, function(word) {
                        show = this.checkRecord(record, word);
                        return show; // Break whenever show is false
                    }, this);
                    return show;
                },
                scope: this
            });
        } else {
            store.removeFilter(filterId);
        }
        this.afterFilter();
    },

    afterFilter: function() {
        // Re-focus the selected row if it is still in the grid
        var view = this.grid.getView(),
            store = this.grid.getStore(),
            selModel = this.grid.getSelectionModel(),
            selected;
        if (selModel && view) {
            // Auto-select the first item in the grid if there is exactly one result
            if (selModel && store.getCount() === 1 && this.selectSingle) {
                selModel.select(store.first());
            }
            selected = selModel.getSelection()[0];
            if (selected) {
                view.focusRow(selected);
                // Make sure the filter still has focus - prevent browser 'back'
                this.focus();
            }
        }
    },

    // Checks to see if a record passes the text filter.
    checkRecord: function(record, filter) {
        return this.getSearchString(record).indexOf(filter) > -1;
    },

    // Retrieves an easily searchable string containing all the VISIBLE text represented in a grid row.
    getSearchString: function(record) {
        var id = record.internalId;
        if (!this.searchMap.containsKey(id)) {
            var view = this.grid.getView(),
                row = view.getNode(record),
                html;
            if (row) {
                // Use the row as it is rendered in the table view.
                html = row.innerHTML;
            } else {
                // Row is not rendered in the view.
                // Render the row manually as a metadata record. See Ext.view.Table.renderRow()
                view.rowValues.view = view;
                html = view.renderRow(record, -1);
                delete view.rowValues.view;
            }
            this.searchMap.add(id, this.normalize(Ext.String.htmlDecode(this.stripHTML(html))));
        }
        return this.searchMap.getByKey(id);
    },

    // Utility function to normalize a string (lowercase, trim, convert consecutive whitespace to a single ' ')
    normalize: function(string) {
        return Ext.String.trim((string + '').toLowerCase().replace(/\s+/gm, ' '));
    },

    // Utility function to remove HTML tags from a given string. The default replacement separator is a space.
    // NOTE THAT THIS IS NOT "SAFE"; DO NOT USE THIS TO SANITIZE INPUT.
    stripHTML: function(string, separator) {
        separator = separator || ' ';
        return Ext.String.trim((string + '').replace(/<(?:.|\n)*?>+/gm, separator));
    }
});
