define([
        "dojo/_base/declare",
        "app/config/test3.js",
        "app/config/test2"
    ],
    function (declare, t1, t2) {
        return declare([t1], {
            hello:1
        })
    });
