define("lib/html", [function() {
  function Html() {
    this.parse = function(html_text) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html_text, "text/html");
      return doc;

      var doctype = document.implementation.createDocumentType(
        'html',
        '-//W3C//DTD XHTML 1.0 Strict//EN',
        'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'
      );

      var dom = document.implementation.createDocument(
        'http://www.w3.org/1999/xhtml',
        'html',
        doctype
      );

      dom.documentElement.innerHTML = html_text;
      return dom;
    }
  }
  return new Html();
}]);
