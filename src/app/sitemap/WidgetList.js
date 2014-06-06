define([
        "dojo/_base/declare", // declare
        "dojo/_base/lang",
        "dojo/_base/array", // array.map
        "dijit/layout/ContentPane",
        "dojo/dnd/Source",

        "dojo/text!app/sitemap/templates/widget.html"
    ],
    function (declare, lang, array, ContentPane, Source, template) {
        return declare(ContentPane, {

            postCreate: function () {
                var widgetList = new Source(this.domNode, {copyOnly: true, accept: []});


                var widgets = [
                    {}
                ];

                widgetList.insertNodes(false, [
                    "<div class='habminWidget habminWidgetGroup'>Group</div>",
                    "<div class='habminWidget habminWidgetFrame'>Frame</div>",
                    "<div class='habminWidget habminWidgetImage'>Image</div>",
                    "<div class='habminWidget habminWidgetSelection'>Selection</div>",
                    "<div class='habminWidget habminWidgetSlider'>Slider</div>",
                    "<div class='habminWidget habminWidgetChart'>Chart</div>",
                    "<div class='habminWidget habminWidgetVideo'>Video</div>",
                    "<div class='habminWidget habminWidgetWebview'>Webview</div>",
                    "<div class='habminWidget habminWidgetSetpoint'>Setpoint</div>",
                    "<div class='habminWidget habminWidgetSwitch'>Switch</div>",
                    "<div class='habminWidget habminWidgetColorpicker'>Colorpicker</div>",
                    "<div class='habminWidget habminWidgetText'>Text</div>"
                ]);

/*                array.forEach(this.chartDef.axis, lang.hitch(this, function (widget) {
                    var widgetPane = new ContentPane(widget);
                    widgetList.insertNodes(false, [widgetPane]);
                }));*/
            }
        });
    });