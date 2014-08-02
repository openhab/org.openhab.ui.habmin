HABmin.Router.map(function () {
    this.resource("sitemap", function () {
        this.route("view", {path: "/:id:page"});
    });
    this.resource("chart", function () {
        this.route("", {path: "/"});
    });
});
