define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/dom-style",

        "dijit/form/DropDownButton",
        "dijit/ColorPalette"
    ],
    function (declare, lang, domConstruct, domStyle, DropDownButton, ColorPalette) {
        return declare([DropDownButton], {
            colorValue: "black",

            postCreate: function () {
                this.inherited(arguments);
                domConstruct.place('<span id="' + this.id + '_colorSwatch" style="height: 10px; width: 100%; border: 1px solid black; background-color: '+ this.colorValue + ';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>', this.containerNode, "only");

                this.dropDown = new ColorPalette({
                    onChange: lang.hitch(this, function( color ) {
                        this.colorValue = color;
                        console.log("Color clicked:", color);
                        domStyle.set(this.id + '_colorSwatch', 'backgroundColor', color);
                    })
                });
            },

            getValue: function() {
                return colorValue;
            }
        })
    });
