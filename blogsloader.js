/*
* Blogs Loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.3.2
*/

var DEBUG_MODE = true;

var blogroot = "./blogs/";
var mainList = blogroot + "list/years.json";

const HomeStateEnum = {
  UNLOADED: 0,
  LOADED: 1,
  LOADING: 2
};
var homepageState = HomeStateEnum.UNLOADED; // 0: unload, 1: loaded, 2: loading

function getFolder(fullpath) {
    var i = fullpath.lastIndexOf('/');
    if (i <= 0)
      return "";
    else
      return fullpath.substring(0, i + 1);
}

const PageStateEnum = {
  HOME: 0,
  BLOGPOST: 1
};

function setPageTitle(title) {
  var postTitle = $("#postTitleContainer");
  if (!title || title == "") {
    document.title = "Donny's Blogs";
    postTitle.text("");
  }
  else {
    document.title = title + " - Donny's Blogs";
    postTitle.text(title);
  }
}

var homepageScrollTop = 0;
function switchPage(page) {
  switch (page)
  {
  case PageStateEnum.HOME:
    $("#postContainer").hide();
    setPageTitle();
    $('#homebtn').find('span').removeClass("home").text("Donny's Blogs");
    $("#presentList").show();
    $(window).scrollTop(homepageScrollTop);
    break;
  case PageStateEnum.BLOGPOST:
    homepageScrollTop = $(window).scrollTop();
    $("#presentList").hide();
    $("#postContainer").show();
    $(window).scrollTop(0);
    $('#homebtn').find('span').addClass("home").text("Home");
    break;
  }
}

function processPostXML(postinfo, postXML) {
  if (DEBUG_MODE) console.log(postXML);

  // Setting title
	var title = (postinfo.title) ? (postinfo.title) : postXML.getElementsByTagName("title")[0].innerHTML;
  setPageTitle(title);

  // Assign context
  var body = postXML.getElementsByTagName("body");
  var postContainer = document.getElementById("postContainer");
  postContainer.innerHTML = body[0].innerHTML;

  switchPage(PageStateEnum.BLOGPOST);
  // postContainer.style.display = "block";
}

function checkCSSState(CSSLinks, callback) {
  for (var i = 0; i < CSSLinks.length; ++i) {
    if (CSSLinks[i].rel == "stylesheet") { // Is css file
      console.log(CSSLinks[i].sheet);
      if (CSSLinks[i].sheet == null) return false;
    }
  }
  callback();
  return true;
}

function processpostHTML(postinfo, rawHTML) {
  // Redirect address
  rawHTML = rawHTML.replace(/=\".\//g, "=\"" + postinfo.folder);
  if (DEBUG_MODE) console.log(rawHTML);

  // Assign context
  var postContainer = document.getElementById("postContainer");
  postContainer.innerHTML = rawHTML;

  // Setting title
  var title = (postinfo.title) ? (postinfo.title) : document.getElementById("postTitle").innerHTML;
  setPageTitle(title);

  // Loading css files, prevent display before css loaded
  var links = postContainer.getElementsByTagName("link");
  var cssStateMonitor = setInterval(function () {
    checkCSSState(links, function () {
      // Loading finished
      clearInterval(cssStateMonitor);
      switchPage(PageStateEnum.BLOGPOST);
      // postContainer.style.display = "block";
    });
  }, 20);
}

function loadpostMain(postinfo) {
  postinfo.url = postinfo.folder + postinfo.main;
  postinfo.folder = getFolder(postinfo.url);
  if (DEBUG_MODE) console.log("Loading %s...", postinfo.url);
  if (DEBUG_MODE) console.log(postinfo);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (postinfo.bHTML)
        processpostHTML(postinfo, this.responseText);
      else
        processPostXML(postinfo, this.responseXML);
    }
  };
  xhttp.open("GET", postinfo.url, true);
  xhttp.send();
}

function parsePostInfo(rawJSONText, postfolder) {
  var postinfo = JSON.parse(rawJSONText);
  if (!postinfo) return null;

  // initial folder
  postinfo.folder = postfolder;

  // type
  if (postinfo.type && /XML/i.test(postinfo.type))
    postinfo.bHTML = false;
  else
    postinfo.bHTML = true;

  // main
  if (!postinfo.main)
    postinfo.main = (postinfo.bHTML) ? "index.html" : "index.xml";

  return postinfo;
}

function loadpost(folder) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState != 4) return;

    var postinfo = {};
    switch (this.status)
    {
    case 200: // Has "postinfo.json" file
      if (!this.responseText) { // Regard as HTML by default
        postinfo.folder = folder;
        postinfo.bHTML = true;
        postinfo.main = "index.html";
        loadpostMain(postinfo);
      } else { // Loading "postinfo.json"
        postinfo = parsePostInfo(this.responseText, folder);
        loadpostMain(postinfo);
      }
      break;
    case 404: // Is xml type
      postinfo.folder = folder;
      postinfo.bHTML = false;
      postinfo.main = "index.xml";
      loadpostMain(postinfo);
      break;
    }
  };
  xhttp.open("GET", folder + "postinfo.json", true);
  xhttp.send();
}

/*
function onLoadingpost() {
  console.log("onLoadingpost");
}
*/

function loadPostPreview($postPreviewer) {
  var infourl = $postPreviewer.infoFile;
  if (DEBUG_MODE) console.log("Loading post preview \"%s\" ...", infourl);
  $postPreviewer.appear_off($postPreviewer.onappear_callback);

  var postFolder = getFolder(infourl);
  var $postInfoMask = $postPreviewer.find(".infomask");

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var postinfo = parsePostInfo(this.responseText, postFolder);

        $postInfoMask.find(".posttitle").text(postinfo.title);
        $postInfoMask.find(".postdate").text(postinfo.date);
        $postPreviewer.click(function (){ loadpostMain(postinfo); });
        $postPreviewer.css("cursor", "pointer");
        $postPreviewer.css("background-image", "url(\"" + postFolder + postinfo.poster + "\")");
    }
  };
  xhttp.open("GET", infourl, true);
  xhttp.send();
}

// Load list of posts of a current year
function loadList($yearContainer) {
  var listurl = $yearContainer.postslist;
  if (DEBUG_MODE) console.log("Loading list \"%s\" ...", listurl);
  $yearContainer.appear_off($yearContainer.onappear_callback);

  var listContainer = $yearContainer.find(".listcontainer");
  var listFolder = getFolder(listurl);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var postslist = JSON.parse(this.responseText); // all posts in this year
      if (!postslist) return;

      var $postPreviewer = $("<article>", { class: "postpreviewer" })
        .append( $("<section>") );
      var $infomask = $("<div>", { class: "infomask" })
        .append( $("<h1>", { class: "posttitle" }) )
        .append( $("<p>", { class: "postdate" }) );
      $postPreviewer.append($infomask);

      $yearContainer.find(".postscount").text(postslist.length)
        .append( $("<span>").css("padding-left", "15px").text("POSTS") );
      postslist.forEach(function (curList) {
        var $curPreviewer = $postPreviewer.clone();

        // Regist appear callback
        $curPreviewer.infoFile = listFolder + curList;
        $curPreviewer.onappear_callback = function () { loadPostPreview($curPreviewer); };
        $curPreviewer.appear($curPreviewer.onappear_callback);

        listContainer.append($curPreviewer);

        if ($curPreviewer.is(':appeared'))
          $curPreviewer.trigger('appear', [$curPreviewer]);
      });
    }
  };
  xhttp.open("GET", listurl, true);
  xhttp.send();
}

function loadHomepage() {
  switch (homepageState)
  {
  case HomeStateEnum.LOADED:
    switchPage(PageStateEnum.HOME);
  case HomeStateEnum.LOADING:
    return;
  case HomeStateEnum.UNLOADED:
    homepageState = HomeStateEnum.LOADING;
    break;
  }

  var listurl = mainList;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      homepageState = HomeStateEnum.LOADED;

      var postslist = JSON.parse(this.responseText);
      var $yearContainer = $("<div>")
        .append( $("<div>", { class: "yearbanner" }).append($("<div>")) )
        .append( $("<div>", { class: "listcontainer" }) );

      postslist && postslist.forEach(function (curList) {
        var yearTitle = "YEAR " + curList.split('/').pop().split('.')[0];
        var $curContainer = $yearContainer.clone();

        // Assign title
        $curContainer.find(".yearbanner")
          .append( $("<p>").append($("<i>").text(yearTitle)) )
          .append( $("<p>", { class: "postscount" }) );

        // Regist appear callback
        $curContainer.postslist = getFolder(listurl) + curList;
        $curContainer.onappear_callback = function () { loadList($curContainer); };
        $curContainer.appear($curContainer.onappear_callback);

        $("#presentList").append($curContainer);

        if ($curContainer.is(':appeared'))
          $curContainer.trigger('appear', [$curContainer]);
      });
    }
  };
  xhttp.open("GET", listurl, true);
  xhttp.send();
}