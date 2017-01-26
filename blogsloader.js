function processBlog(blogXML) {
	console.log("Hello");
	var title = blogXML.getElementById("Title");
	document.title = title + " - Donny's Blogs";
}

function loadBlog(url) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //document.getElementById("demo").innerHTML = this.responseText;
      processBlog(this.responseXML);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}