define("lib/dependency_loader", ["lib/http", "lib/html", function(http, html) {
  function DependencyLoader() {
  }
  DependencyLoader.prototype.load = function(path) {
    var defer = new RequireRuntime.later();
    http.get(path).then(function(data) {
      var links = [];
      for (var i = 0;i<html.parse(data).body.getElementsByTagName('a').length;i++) {
        var a = html.parse(data).body.getElementsByTagName('a')[i];
        var link = a.getAttribute("href");
        if (result = link.match(/(\w+).js$/)) links.push(path+"/"+result[1]);
      }
      return links;
    }).then(function(links) {
      RequireRuntime.require(links, function() {
        console.log("All dependencies loaded");
        defer.resolve(links);
      })
    });
    return defer;
  }
  return new DependencyLoader();
}]);
