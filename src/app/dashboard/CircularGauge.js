define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/ready",
        "dojo/dom",
        "dojo/_base/connect",
        "dojo/_base/Color",
        "dojo/dom-construct",
        "dojox/dgauges/CircularGauge",
        "dojox/dgauges/LinearScaler",
        "dojox/dgauges/CircularScale",
        "dojox/dgauges/CircularValueIndicator",
        "dojox/dgauges/CircularRangeIndicator",
        "dojox/dgauges/TextIndicator",
        "dojox/dgauges/components/utils",
        "dojox/dgauges/components/black/CircularLinearGauge",
        "dojox/dgauges/components/black/SemiCircularLinearGauge",
        "dojox/dgauges/components/black/HorizontalLinearGauge",
        "dojo/parser"],
    function (declare, lang, ready, dom, connect, Color, domConstruct, CircularGauge, LinearScaler, CircularScale, CircularValueIndicator, CircularRangeIndicator, TextIndicator, utils) {
        return declare(CircularGauge, {
            value: 20,
            start: 10,
            end: 75,
            font: {
                family: "Arial",
                style: "normal",
                size: "14pt",
                color: "white"
            },

            constructor: function () {
                this.inherited(arguments);

                // Draw background
                this.addElement("background", function (g) {
                    g.createPath({path: "M372.8838 205.5688 C372.9125 204.4538 372.93 194.135 372.94 185.6062 C372.4475 83.0063 289.1138 -0 186.4063 0.035 C83.7 0.0713 0.4225 83.1325 0 185.7325 C0.01 194.2175 0.0275 204.4638 0.0563 205.5763 C0.235 212.3488 5.7763 217.7462 12.5525 217.7462 L360.3888 217.7462 C367.1663 217.7462 372.71 212.3438 372.8838 205.5688"
                    }).setFill("blue");
                });

                // Scale
                var scale = new CircularScale({
                    originX: 186.46999,
                    originY: 184.74814,
                    radius: 140,
                    startAngle: -180,
                    endAngle: 0,
                    labelPosition: "outside",
                    orientation: "clockwise",
                    scaler: new LinearScaler(),
                    labelGap: 8,
                    tickShapeFunc: function (group, scale, tickItem) {
                        return group.createLine({
                            x1: 0,
                            y1: 0,
                            x2: tickItem.isMinor ? 0 : 5,
                            y2: 0
                        }).setStroke({
                            color: "white",
                            width: 1
                        });
                    },
                    font: {
                        family: "Arial",
                        style: "normal",
                        size: "14pt",
                        color: "white"
                    }
                });

                this.addElement("scale", scale);

                // A range indicator that goes from 0 to 100
                this.indicator = new CircularRangeIndicator({
                    start: this.start,
                    value: this.end,
                    radius: 135,
                    startThickness: 50,
                    endThickness: 50,
                    fill: "white"
                });
                scale.addIndicator("indicatorBg", this.indicator);

                // An interactive range indicator that shows the current value
                this.indicator = new CircularRangeIndicator({
                    start: this.start,
                    value: this.end,
                    radius: 125,
                    startThickness: 30,
                    endThickness: 30,
                    fill: "gray",
                    interactionArea: "gauge",
                    interactionMode: "mouse",
                    animationDuration: 250
//                    animationEaser:
                });
                scale.addIndicator("indicator", this.indicator);

                // Indicator Text
                var indicatorText = new TextIndicator({
                    indicator: this.indicator,
                    x: 186,
                    y: 184,
                    font: {
                        family: "Arial",
                        style: "normal",
                        variant: "small-caps",
                        weight: "bold",
                        size: "36pt"
                    },
                    color: "gray"
                });
                this.addElement("indicatorText", indicatorText);
            }
        })
    });