define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/LayoutContainer",
        "app/dashboard/SaveChart/SaveChart",
        "dojo/request",
        "dojo/store/Memory",
        "dojo/on",
        "app/common/ItemModelStore",
        "dgrid/OnDemandGrid",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Selection",
        "dgrid/Keyboard",
        "dijit/form/Button",
        "dijit/Toolbar",
        "dijit/form/TextBox",
        "dojo/_base/array",
        "dojo/topic"
    ],
    function (declare, lang, Container, SaveChart, request, Store, on, ItemModelStore, Grid, Registry, Selection, Keyboard, Button, Toolbar, TextBox, array, topic) {
        return declare(Container, {
            buildRendering: function () {
                this.inherited(arguments);

                var toolDefinition = [
                    {
                        label: "Clear",
                        menuRef: "clear",
                        iconClass: "habminIconClear",
                        select: clearChart
                    },
                    {
                        label: "Save",
                        menuRef: "save",
                        iconClass: "habminIconSave",
                        select: saveChart
                    },
                    {
                        label: "Update",
                        menuRef: "update",
                        iconClass: "habminIconUpdate",
                        select: updateChart
                    }
                ];
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, lang.hitch(this, function (def) {
                    var button = new Button({
                        label: def.label,
                        showLabel: true,
                        disabled: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });

                    on(button, "click", lang.hitch(this, def.select));

                    this.toolbar.addChild(button);
                }));

                this.store = new Store({
                    idProperty: "name"
                });

                this.grid = new (declare([Grid, Registry, Selection]))({
                    region: "center",
                    showHeader: false,
                    selectionMode: "toggle",
                    columns: [
                        {label: "Item", field: 'label', renderCell: cellRenderer}
                    ],
                    store: this.store
                });

                this.grid.on(".dgrid-cell:click", lang.hitch(this, function (evt) {
                    var selected = this.grid.selection;
                    var size = 0, key;
                    for (key in selected) {
                        if (selected.hasOwnProperty(key))
                            size++;
                    }
                    console.log("Grid rows selected (" + size + ") :", selected);

                    // Enable/Disable the toolbar
                    if (size > 0) {
                        this.toolbar.getChildren()[0].set("disabled", false);
                        this.toolbar.getChildren()[1].set("disabled", false);
                        this.toolbar.getChildren()[2].set("disabled", false);
                    }
                    else {
                        this.toolbar.getChildren()[0].set("disabled", true);
                        this.toolbar.getChildren()[1].set("disabled", true);
                        this.toolbar.getChildren()[2].set("disabled", true);
                    }
                }));

                var filterBox = new TextBox({
                    name: "filter",
                    intermediateChanges: true,
                    placeHolder: "Filter items",
                    style: "width:100%"
                });
                on(filterBox, "change", lang.hitch(this, filterList));

                this.toolbar.addChild(filterBox);
                this.addChild(this.toolbar);
                this.addChild(this.grid);

                function filterList(value) {
                    console.log("Filter changed to:", value);
                    this.grid.set("query", { name: new RegExp(value, "i") });
                }

                function clearChart() {
                    console.log("clearChart pressed");
                }

                function saveChart() {
                    console.log("saveChart pressed");
                    var selected = this.grid.selection;
                    var items = [];
                    var key;
                    for (key in selected) {
                        if (selected.hasOwnProperty(key))
                            items.push(key);
                    }
                    var dlg = new SaveChart();
                    dlg.placeAt(document.body);
                    dlg.startup();
                    dlg.loadItems(items);
                    dlg.show();
                }

                function updateChart() {
                    console.log("updateChart pressed");

                    var x = ItemModelStore();
                    ItemModelStore().loadStore().then(lang.hitch(this, function () {
                        var store = x.getStore();

                        var selected = this.grid.selection;
                        var items = [];
                        var key;
                        for (key in selected) {
                            var i = {};
                            i.name = key;

                            var sel = x.query({name: key});
                            if(sel.length == 1)
                                i.label = sel[0].label;

                            if (selected.hasOwnProperty(key))
                                items.push(i);
                        }
                        topic.publish("/dashboard/set", "items", items);
                    }));
                }

                function cellRenderer(object, value, node, options) {
                    node.innerHTML =
                        "<span class='habminListIcon'><img src='/images/" + object.icon + ".png'></span>" + value;
                }

                function getItemList() {
                    // Create the list of items
                    var selected = this.grid.selection;
                    var items = [];
                    var key;
                    for (key in selected) {
                        if (selected.hasOwnProperty(key))
                            items.push(key);
                    }

                    return items;
                }
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();

                request("/services/habmin/persistence/items", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The (Items) response is: ", data);
                        this.store.setData(data.items);
                        this.grid.set("query", {});
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred: " + error);
                    })
                );
            }
        })
            ;
    })
;