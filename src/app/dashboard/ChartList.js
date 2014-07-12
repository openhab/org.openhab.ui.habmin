define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/LayoutContainer",
        "dojo/request",
        "dojo/on",

        "dgrid/Grid",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Selection",
        "dgrid/Keyboard",

        "dijit/form/Button",
        "dijit/Toolbar",
        "dojo/_base/array",
        "dojo/topic",
        "app/dashboard/SaveChart/SaveChart",

        "app/common/ConfirmDialog",
        "app/common/ChartModelStore",

        "app/main/Notification",

        "dojox/string/sprintf",

        "dojo/i18n!app/nls/Dashboard"
    ],
    function (declare, lang, Container, request, on, Grid, Registry, Selection, Keyboard, Button, Toolbar, array, topic, SaveChart, ConfirmDialog, ChartModelStore, Notification, sprintf, langDashboard) {
        return declare(Container, {

            buildRendering: function () {
                this.inherited(arguments);

                var toolDefinition = [
                    {
                        label: "Delete",
                        menuRef: "delete",
                        iconClass: "habminIconDelete",
                        select: deleteChart
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit",
                        select: editChart
                    }
                ];
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, lang.hitch(this, function (def) {
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: def.label,
                        showLabel: true,
                        disabled: true,
                        iconClass: "habminButtonIcon " + def.iconClass
                    });

                    on(button, "click", lang.hitch(this, def.select));

                    this.toolbar.addChild(button);
                }));

                this.grid = new (declare([Grid, Registry, Selection]))({
                    region: "center",
                    showHeader: false,
                    selectionMode: "single",
                    columns: [
                        {label: "Name", field: 'name', renderCell: cellRenderer}
                    ]
                });

                this.grid.on(".dgrid-cell:click", lang.hitch(this, function (evt) {
                    // Enable the toolbar
                    this.toolbar.getChildren()[0].set("disabled", false);
                    this.toolbar.getChildren()[1].set("disabled", false);

                    var cell = this.grid.cell(evt);
                    this.selectedChartId = cell.row.data.id;
                    this.selectedChartName = cell.row.data.name;

                    //
                    topic.publish("/dashboard/set", "chart", this.selectedChartId);
                }));

                this.addChild(this.toolbar);
                this.addChild(this.grid);

                function cellRenderer(object, value, node, options) {
                    node.innerHTML =
                        "<span class='habminListIcon'><img src='/images/" + object.icon + ".png'></span>" + value;
                }

                function editChart() {
                    console.log("editChart pressed");

                    var dialog = new SaveChart();
                    dialog.placeAt(document.body);
                    dialog.startup();
                    dialog.loadChart(this.selectedChartId);
                    dialog.show().then(
                        lang.hitch(this, function () {
                            console.log("Save dialog closed ok");
                            this._loadStore(true);
                        }),
                        lang.hitch(this, function () {
                            console.log("Save dialog closed error");
                        })
                    );
                }

                function deleteChart() {
                    console.log("deleteChart pressed");

                    var dialog = new ConfirmDialog({
                            title: langDashboard.ConfirmDeleteTitle,
                            text: sprintf(langDashboard.ConfirmDelete, this.selectedChartName)
                        }
                    );
                    dialog.show().then(
                        lang.hitch(this, function () {
                            ChartModelStore().delete(this.selectedChartId);
                            return;
                        }),
                        lang.hitch(this, function () {
                        })
                    );
                }
            },
            startup: function () {
                this.inherited(arguments);
                this.resize();

                this._loadStore();
            },
            _loadStore: function (reload) {
                ChartModelStore().loadStore(reload).then(lang.hitch(this, function () {
                    console.log("Inner called");
                    console.log("Store is", ChartModelStore().getStore());

                    var results = ChartModelStore().getStore().query();

                    this.grid.refresh();
                    this.grid.renderArray(results);
                }));
            }
        })
    })
;