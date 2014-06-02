define([
        "dojo/_base/declare", // declare
        "dojo/_base/array", // array.map
        "dijit/layout/ContentPane",
        "dojo/dnd/Source"
    ],
    function (declare, array, ContentPane, Source) {
        return declare(ContentPane, {
            postCreate: function() {
                // Create the top "toolbar" for our sitemap GUI

                // Create the sitemap itself
                var sitemapList = new Source(this.domNode);
                sitemapList.insertNodes(false, [
                    "Wrist watch",
                    "Life jacket",
                    "Toy bulldozer",
                    "Vintage microphone",
                    "TIE fighter"
                ]);
            },

            // Set the sitemap page
            setSitemap: function(sitemap) {

            },

            // Get the sitemap page
            getSitemap: function() {

            }
        });
    });
