define("lib/http", [function() {
  function Http() {
    console.warn("create Http class");
    this.get = function(url) {
      var defer = new RequireRuntime.later();
      var myRequest = new XMLHttpRequest();
      myRequest.onreadystatechange = function(event) {
        if (myRequest.readyState == 4) {
          defer.resolve(myRequest.response);
        }
      }
      myRequest.open("GET", url);
      myRequest.send();
      return defer;
    }
  }
  return new Http();
}]);
