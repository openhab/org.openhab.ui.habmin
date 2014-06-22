define([
        "../../../dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom",

        "dojox/layout/TableContainer",
        "dojo/store/Memory",
        "dojo/data/ObjectStore",

        "dijit/form/ValidationTextBox",
        "dijit/form/ComboBox",
        "dijit/form/Select",

        "dojo/i18n!app/nls/SaveChart"
    ],
    function (declare, lang, dom, TableContainer, Memory, ObjectStore, TextBox, ComboBox, Select, langSaveChart) {
        return declare([TableContainer], {
            cols: 1,
            labelWidth: "150",

            cfgPeriod: 172800,
            cfgIcon: "",
            cfgName: "",
            cfgTitle: "",

            postCreate: function () {
                this.inherited(arguments);

                var periodMemoryStore = new Memory({
                    data: [
                        {period: '3600', name: langSaveChart.GraphPeriod1Hour},
                        {period: '7200', name: langSaveChart.GraphPeriod2Hours},
                        {period: '10800', name: langSaveChart.GraphPeriod3Hours},
                        {period: '14400', name: langSaveChart.GraphPeriod4Hours},
                        {period: '21600', name: langSaveChart.GraphPeriod6Hours},
                        {period: '43200', name: langSaveChart.GraphPeriod12Hours},
                        {period: '86400', name: langSaveChart.GraphPeriod1Day},
                        {period: '172800', name: langSaveChart.GraphPeriod2Days},
                        {period: '259200', name: langSaveChart.GraphPeriod3Days},
                        {period: '345600', name: langSaveChart.GraphPeriod4Days},
                        {period: '432000', name: langSaveChart.GraphPeriod5Days},
                        {period: '864000', name: langSaveChart.GraphPeriod10Days},
                        {period: '604800', name: langSaveChart.GraphPeriod1Week},
                        {period: '1209600', name: langSaveChart.GraphPeriod2Weeks}
                    ]
                });
                var periodStore = new ObjectStore({ objectStore: periodMemoryStore });

                var stateStore = new Memory({
                    data: [
                        {label:"<img width='14px' height='14px' src='app/images/compass.png'/>Egypt", name: "1", id:"AL"},
                         {label:"<img width='14px' height='14px' src='app/images/compass.png'/>Egypt 2", name: "2", id:"A2"}
                    ]
                });

                var os = new ObjectStore({ objectStore: stateStore });

                // Create the name editor
                this.nameEditor = new TextBox({label: langSaveChart.Name,
                    style: "width:100%",
                    value: this.cfgName
                });
                this.addChild(this.nameEditor);

                // Create the title editor
                this.titleEditor = new TextBox({label: langSaveChart.Title,
                    style: "width:100%",
                    value: this.cfgTitle
                });
                this.addChild(this.titleEditor);

                // Find the icon and create the select list
                this.iconEditor = new Select({label: langSaveChart.Icon,
                    style: "width:100%",
                    store: os
                });
                this.addChild(this.iconEditor);

                // Find the period in the store and create the combo box
                var periodResult = periodMemoryStore.query({period: this.cfgPeriod});
                var periodValue = langSaveChart.GraphPeriod2Days;
                if(periodResult != null && periodResult.length == 1)
                    periodValue = periodResult[0].name;
                this.periodEditor = new ComboBox({label: langSaveChart.Period,
                    style: "width:100%",
                    value: periodValue,
                    store: periodStore,
                    searchAttr: "name"
                });
                this.addChild(this.periodEditor);
            }
        })
    });
