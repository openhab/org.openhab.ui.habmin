define([
        "dojo/_base/declare",
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

            cfgType: 'general',
            cfgPeriod: 172800,
            cfgIcon: "",
            cfgName: "",
            cfgTitle: "",

            postCreate: function () {
                this.inherited(arguments);

                var childStyle = "width:98%";

                this.periodMemoryStore = new Memory({
                    data: [
                        {id: '3600', label: langSaveChart.GraphPeriod1Hour},
                        {id: '7200', label: langSaveChart.GraphPeriod2Hours},
                        {id: '10800', label: langSaveChart.GraphPeriod3Hours},
                        {id: '14400', label: langSaveChart.GraphPeriod4Hours},
                        {id: '21600', label: langSaveChart.GraphPeriod6Hours},
                        {id: '43200', label: langSaveChart.GraphPeriod12Hours},
                        {id: '86400', label: langSaveChart.GraphPeriod1Day},
                        {id: '172800', label: langSaveChart.GraphPeriod2Days},
                        {id: '259200', label: langSaveChart.GraphPeriod3Days},
                        {id: '345600', label: langSaveChart.GraphPeriod4Days},
                        {id: '432000', label: langSaveChart.GraphPeriod5Days},
                        {id: '864000', label: langSaveChart.GraphPeriod10Days},
                        {id: '604800', label: langSaveChart.GraphPeriod1Week},
                        {id: '1209600', label: langSaveChart.GraphPeriod2Weeks}
                    ]
                });
                var periodStore = new ObjectStore({ objectStore: this.periodMemoryStore });

                var stateStore = new Memory({
                    data: [
                        {label: "<img width='14px' height='14px' src='app/images/compass.png'/>Egypt", name: "1", id: "AL"},
                        {label: "<img width='14px' height='14px' src='app/images/compass.png'/>Egypt 2", name: "2", id: "A2"}
                    ]
                });

                var os = new ObjectStore({ objectStore: stateStore });

                // Create the name editor
                this.nameEditor = new TextBox({
                    label: langSaveChart.Name,
                    style: childStyle,
                    value: this.cfgName
                });
                this.addChild(this.nameEditor);

                // Create the title editor
                this.titleEditor = new TextBox({
                    label: langSaveChart.Title,
                    style: childStyle,
                    value: this.cfgTitle
                });
                this.addChild(this.titleEditor);

                // Find the icon and create the select list
                this.iconEditor = new Select({
                    label: langSaveChart.Icon,
                    style: childStyle,
                    store: os
                });
                this.addChild(this.iconEditor);

                // Find the period in the store and create the combo box
                var periodResult = this.periodMemoryStore.query({id: this.cfgPeriod});
                var periodValue = langSaveChart.GraphPeriod2Days;
                if (periodResult != null && periodResult.length == 1)
                    periodValue = periodResult[0].label;
                this.periodEditor = new ComboBox({
                    label: langSaveChart.Period,
                    style: childStyle,
                    value: periodValue,
                    store: periodStore,
                    autoComplete: true,
                    required: true,
                    searchAttr: "label"
                });
                this.addChild(this.periodEditor);
            },
            updateData: function () {
                this.cfgName = this.nameEditor.get("value");
                this.cfgTitle = this.titleEditor.get("value");
                this.cfgIcon = this.iconEditor.get("value");
                this.cfgPeriod = this.periodEditor.get('value');
                var periodResult = this.periodMemoryStore.query({label: this.cfgPeriod});
                if (periodResult.length != 0)
                    this.cfgPeriod = periodResult[0].id;
            }
        })
    });
