define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/layout/ContentPane",
        "dojo/request",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/on"
    ],
    function (declare, lang, Container, request, array, domConstruct, topic, on) {
        return declare(Container, {
            style: "border: 2px solid;",

            buildRendering: function () {
                this.inherited(arguments);
            }
        })
    });