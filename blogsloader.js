var DEBUG_MODE = true;

function processBlogXML(bloginfo, blogXML) {
  if (DEBUG_MODE) console.log(blogXML);

	var title = (bloginfo.title) ? (bloginfo.title) : blogXML.getElementsByTagName("title")[0].innerHTML;
  if (title) {
  	document.title = title + " - Donny's Blogs";
    var blogtitle = document.getElementById("blogTitleContainer");
    blogtitle.innerHTML = title;
  }

  var body = blogXML.getElementsByTagName("body");
  var blogContainer = document.getElementById("blogContainer");
  blogContainer.innerHTML = body[0].innerHTML;

  blogContainer.style.display = "block";
}

function processBlogHTML(bloginfo, rawHTML) {
  // Redirect address
  rawHTML = rawHTML.replace(/=\".\//g, "=\"" + bloginfo.folder);
  if (DEBUG_MODE) console.log(rawHTML);

  // Assign context
  var blogContainer = document.getElementById("blogContainer");
  blogContainer.innerHTML = rawHTML;

  // Setting title
  var title = (bloginfo.title) ? (bloginfo.title) : document.getElementById("blogtitle").innerHTML;
  if (title) {
    document.title = title + " - Donny's Blogs";
    var blogtitle = document.getElementById("blogTitleContainer");
    blogtitle.innerHTML = title;
  }

  blogContainer.style.display = "block";
}

function loadBlogMain(bloginfo) {
  bloginfo.url = bloginfo.folder + bloginfo.main;
  if (DEBUG_MODE) console.log("Loading %s...", bloginfo.url);
  if (DEBUG_MODE) console.log(bloginfo);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (bloginfo.bHTML)
        processBlogHTML(bloginfo, this.responseText);
      else
        processBlogXML(bloginfo, this.responseXML);
    }
  };
  xhttp.open("GET", bloginfo.url, true);
  xhttp.send();
}

function loadBlog(folder) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState != 4) return;

    var bloginfo;
    switch (this.status)
    {
      case 200: // Has "bloginfo.json" file
        if (!this.responseText) { // Regard as HTML by default
          bloginfo.folder = folder;
          bloginfo.bHTML = true;
          bloginfo.main = "index.html";
          loadBlogMain(bloginfo);
        } else { // Loading "bloginfo.json"
          bloginfo = JSON.parse(this.responseText);
          bloginfo.folder = folder;

          // type
          if (bloginfo.type && /XML/i.test(bloginfo.type))
            bloginfo.bHTML = false;
          else
            bloginfo.bHTML = true;

          // main
          if (!bloginfo.main)
            bloginfo.main = (bloginfo.bHTML) ? "index.html" : "index.xml";

          loadBlogMain(bloginfo);
        }
        break;
      case 404: // Is xml type
        bloginfo.folder = folder;
        bloginfo.bHTML = false;
        bloginfo.main = "index.xml";
        loadBlogMain(bloginfo);
        break;
    }
  };
  xhttp.open("GET", folder + "bloginfo.json", true);
  xhttp.send();
}