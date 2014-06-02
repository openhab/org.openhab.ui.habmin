define([
        "dojo/_base/declare", // declare
        "dojo/_base/array", // array.map
        "dijit/layout/ContentPane",
        "dojo/dnd/Source"
    ],
    function (declare, array, ContentPane, Source) {
        return declare(ContentPane, {

           postCreate: function() {
                var widgetList = new Source(this.domNode, {copyOnly: true, accept: []});

                widgetList.insertNodes(false, [
                    "Group",
                    "Frame",
                    "Image",
                    "Selection",
                    "Slider",
                    "Chart",
                    "Video",
                    "Webview",
                    "Setpoint",
                    "Switch",
                    "Colorpicker",
                    "Text"
                ]);
            }
        });
    });