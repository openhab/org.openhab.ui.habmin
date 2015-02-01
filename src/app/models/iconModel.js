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
            "alarm": {class: "oa-message_presence"},
            "baramoter": {class: "oa-weather_barometric_pressure"},
            "bath": {class: "oa-scene_bath"},
            "bedroom": {class: ""},
            "bluetooth": {class: ""},
            "chart": {class: "oa-time_graph"},
            "climate": {class: "oa-temp_control"},
            "colorwheel": {class: ""},
            "desktop-computer": {class: "oa-it_pc"},
            "dishwasher": {class: "oa-scene_dishwasher"},
            "door-open": {class: "oa-fts_door_open"},
            "energy": {class: "oa-measure_power"},
            "fan_control": {class: "oa-vent_ventilation_control"},
            "fan_level_0": {class: "oa-vent_ventilation_level_0"},
            "fan_level_1": {class: "oa-vent_ventilation_level_1"},
            "fan_level_2": {class: "oa-vent_ventilation_level_2"},
            "fan_level_3": {class: "oa-vent_ventilation_level_3"},
            "fire": {class: "fa fire"},
            "frontdoor": {class: "oa-fts_door_open"},
            "garage": {class: "oa-fts_garage"},
            "garagedoor": {class: "oa-fts_garage_door_100"},
            "garden": {class: "oa-scene_garden"},
            "heating": {class: "oa-sani_heating"},
            "heating_floor": {class: "oa-sani_floor_heating"},
            "key": {class: "fa fa-key"},
            "kitchen": {class: ""},
            "light": {class: "oa-light_light"},
            "light-control": {class: "oa-light_control"},
            "light-off": {class: "oa-light_light_dim_00"},
            "light-on": {class: "oa-light_light_dim_100"},
            "light-0": {class: "oa-light_light_dim_00"},
            "light-10": {class: "oa-light_light_dim_10"},
            "light-20": {class: "oa-light_light_dim_20"},
            "light-30": {class: "oa-light_light_dim_30"},
            "light-40": {class: "oa-light_light_dim_40"},
            "light-50": {class: "oa-light_light_dim_50"},
            "light-60": {class: "oa-light_light_dim_60"},
            "light-70": {class: "oa-light_light_dim_70"},
            "light-80": {class: "oa-light_light_dim_80"},
            "light-90": {class: "oa-light_light_dim_90"},
            "light-100": {class: "oa-light_light_dim_100"},
            "motionsensor": {class: "oa-message_presence"},
            "motionsensor_disabled": {class: "oa-message_presence_disabled"},
            "network": {class: "oa-it_router"},
            "outdoorlight": {class: ""},
            "raingauge": {class: "oa-weather_rain_gauge"},
            "remote-control": {class: "oa-it_remote"},
            "scene_sleeping": {class: "oa-scene_sleeping"},
            "slider": {class: "fa fa-sliders"},
            "socket": {class: "oa-message_socket"},
            "sun_clouds": {class: "wi-day-cloudy"},
            "switch": {class: "oa-message_socket_on_off"},
            "temperature": {class: "oa-temp_temperature"},
            "temperature_setpoint": {class: "oa-temp_control"},
            "temperature_boiler": {class: "oa-sani_boiler_temp"},
            "temperature_inside": {class: "oa-temp_inside"},
            "temperature_outside": {class: "oa-temp_outside"},
            "temperature_min": {class: "oa-temp_temperature_min"},
            "temperature_max": {class: "oa-temp_temperature_max"},
            "weather": {class: "oa-weather_cloudy"},
            "wifi": {class: "oa-it_wifi"},
            "wind": {class: "oa-weather_wind"},
            "wind_dir-0": {class: "wi-wind-default._0-deg"},
            "wind_dir-45": {class: "wi-wind-default._45-deg"},
            "wind_dir-90": {class: "wi-wind-default._90-deg"},
            "wind_dir-135": {class: "wi-wind-default._135-deg"},
            "wind_dir-180": {class: "wi-wind-default._180-deg"},
            "wind_dir-225": {class: "wi-wind-default._225-deg"},
            "wind_dir-270": {class: "wi-wind-default._270-deg"},
            "wind_dir-315": {class: "wi-wind-default._315-deg"},
            "zwave": {class: "oa-it_wireless_dcf77"}
        };

        this.lookupImage = function (src) {
            if(src === undefined || src === "") {
                return "";
            }
            if (this._lookupTable[src] === undefined || this._lookupTable[src].class === "") {
                console.log("Unknown icon", src);
                return "";
            }
            return this._lookupTable[src].class;
        };
    })

    .directive('habminIcon', function (ImgFactory) {
        return {
            template: '',
            restrict: 'E',
            link: function (scope, element, attrs, ctrl, transclude) {
                var css = attrs.class;
                if(css !== undefined && css.length !== 0) {
                    css += ' ';
                }
                var data = "<span class='" + css + ImgFactory.lookupImage(attrs.icon) + "'></span>";
                element.append(data);

                var el = element;
                attrs.$observe('icon', function (val) {
                    var data = "<span class='" + css + ImgFactory.lookupImage(val) + "'></span>";
                    var newEl = el.find('span');
                    newEl.replaceWith(data);
                });
            }
        };
    })
;


