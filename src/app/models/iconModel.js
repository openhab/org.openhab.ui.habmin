/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 *
 */

angular.module('HABmin.iconModel', [
])
        .service("ImgFactory", function ($resource) {
            this._lookupTable = {
                baramoter: {class: "oa-weather_barometric_pressure"},
                bath: {class: "oa-scene_bath"},
                bedroom: {class: ""},
                chart: {class: "oa-time_graph"},
                climate: {class: "oa-temp_control"},
                colorwheel: {class: ""},
                energy: {class: "oa-measure_power"},
                fan_control: {class: "oa-vent_ventilation_control"},
                fan_level_0: {class: "oa-vent_ventilation_level_0"},
                fan_level_1: {class: "oa-vent_ventilation_level_1"},
                fan_level_2: {class: "oa-vent_ventilation_level_2"},
                fan_level_3: {class: "oa-vent_ventilation_level_3"},
                fire: {class: "fa fire"},
                garage: {class: ""},
                garagedoor: {class: ""},
                garden: {class: "oa-scene_garden"},
                heating: {class: "oa-sani_heating"},
                kitchen: {class: ""},
                light: {class: "fa-lightbulb-o"},
                network: {class: ""},
                outdoorlight: {class: ""},
                raingauge: {class: "oa-weather_rain_gauge"},
                slider: {class: "fa fa-sliders"},
                socket: {class: "oa-message_socket"},
                "switch": {class: ""},
                temperature: {class: "oa-temp_temperature"},
                temperature_boiler: {class: "oa-sani_boiler_temp"},
                temperature_inside: {class: "oa-temp_inside"},
                temperature_outside: {class: "oa-temp_outside"},
                temperature_min: {class: "oa-temp_temperature_min"},
                temperature_max: {class: "oa-temp_temperature_max"},
                weather: {class: "oa-weather_cloudy"}
            };

            this.lookupImage = function(src) {
                if(this._lookupTable[src] === undefined) {
                    return "";
                }
                return "../../images/" + this._lookupTable[src].icon;
            };
        });
