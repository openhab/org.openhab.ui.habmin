define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/LayoutContainer",
        "dojo/request",
        "dgrid/Grid",
        "dgrid/extensions/DijitRegistry",
        "dgrid/Selection",
        "dgrid/Keyboard",
        "dijit/form/Button",
        "dijit/Toolbar",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/on",
        "app/dashboard/DashboardToolbar"
    ],
    function (declare, lang, Container, request, Grid, Registry, Selection, Keyboard, Button, Toolbar, array, domConstruct, topic, on, dTool) {
        return declare(Container, {

            buildRendering: function () {
                this.inherited(arguments);

                var toolDefinition = [
                    {
                        label: "New",
                        menuRef: "new",
                        iconClass: "habminIconNew",
                        select: menuNew
                    },
                    {
                        label: "Delete",
                        menuRef: "delete",
                        iconClass: "habminIconDelete",
                        select: xNew
                    },
                    {
                        label: "Edit",
                        menuRef: "edit",
                        iconClass: "habminIconEdit",
                        select: toolbarEdit
                    }
                ];
                this.toolbar = new Toolbar({region: "top"});
                array.forEach(toolDefinition, lang.hitch(this, function (def) {
                    var button = new Button({
                        // note: should always specify a label, for accessibility reasons.
                        // Just set showLabel=false if you don't want it to be displayed normally
                        label: def.label,
                        showLabel: true,
//                        disabled: true,
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

                    //
                    topic.publish("/dashboard/set", "chart", cell.row.data.id);
                }));

                this.addChild(this.toolbar);
                this.addChild(this.grid);

                function cellRenderer(object, value, node, options) {
                    node.innerHTML =
                        "<span class='habminListIcon'><img src='/images/" + object.icon + ".png'></span>" + value;
                }

                function menuNew() {
                    console.log("menuNew pressed");
                    var x = new dTool();
                    x.placeAt(document.body);
                    x.startup();
                    x.show();
                }

                function xNew() {
                    console.log("menuNew pressed");
                    var x = new dTool();
                    x.placeAt(document.body);
                    x.startup();
                    x.show();
                }

                function toolbarEdit() {
                    console.log("Dashboard EDIT pressed");
                    topic.publish("/dashboard/edit", "current");
                    var x = new dTool({style: "width:180px;"}, domConstruct.create('div', null, this.domNode));
                    x.startup();
                }

            },
            startup: function () {
                this.inherited(arguments);
                this.resize();

                request("/services/habmin/persistence/dashboard", {
                    timeout: 5000,
                    handleAs: 'json',
                    preventCache: true,
                    headers: {
                        "Content-Type": 'application/json; charset=utf-8',
                        "Accept": "application/json"
                    }
                }).then(
                    lang.hitch(this, function (data) {
                        console.log("The (Dashboard) response is: ", data);
                        this.grid.renderArray(data.chart);
                    }),
                    lang.hitch(this, function (error) {
                        console.log("An error occurred with dashboard response: " + error);
                    })
                );
            }
        })
            ;
    })
;