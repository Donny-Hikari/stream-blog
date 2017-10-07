/*
* Stream Blogs Loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.4.9
*/

var DEBUG_MODE = true;
var DEBUG_VERBOSE = DEBUG_MODE && false;

function getFolder(fullpath) {
  var i = fullpath.lastIndexOf('/');
  if (i <= 0)
    return "";
  else
    return fullpath.substring(0, i + 1);
}

function getFilename(fullpath) {
  return fullpath.split('/').pop();
}

function processPostXML(postinfo, postXML) {
  if (DEBUG_VERBOSE) console.log(postXML);

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
      if (DEBUG_VERBOSE) console.log(CSSLinks[i].sheet);
      if (CSSLinks[i].sheet == null) return false;
    }
  }
  if (DEBUG_MODE) console.log("CSSs Loaded.");
  callback();
  return true;
}

/*
Exclude elements that's in b from a
*/
function array_exclude(a, b, callback) {
  var excludedArray = [];
  a.forEach(function (i) {
    var repeated = b.find(function (j) {
      return callback(i, j);
    });
    if (repeated == undefined)
      excludedArray.push(i);
  });
  return excludedArray;
}

function getLoadedMainScripts() {
  // Get loaded scripts, excluding those brought by posts
  return Array.from($("script")).filter(function (curScript) {
    return undefined == Array.from($(curScript).parents()).find(function (curParent) {
      return curParent.id == "postContainer";
    });
  });
}

function loadJavascriptFile(loadedscripts, newscripts, callback) {
  var fleshscripts = [];
  fleshscripts = array_exclude(newscripts, loadedscripts, function (cur_newscript, cur_oldscript) {
    return (getFilename(cur_oldscript.src) == getFilename(cur_newscript.src));
  });
  fleshscripts.forEach(function (script) {
    $.getScript(script.src);
  });
}

function processpostHTML(postinfo, rawHTML) {
  // Redirect address
  rawHTML = rawHTML.replace(/=\".\//g, "=\"" + postinfo.folder);
  if (DEBUG_VERBOSE) console.log(rawHTML);

  // Get loaded scripts
  var loadedscripts = getLoadedMainScripts();

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

  // Loading javascript files.
  var newscripts = Array.from(postContainer.getElementsByTagName("script"));
  loadJavascriptFile(loadedscripts, newscripts);

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

function loadpost(folder, infofilename) {
  if (!infofilename) infofilename = "postinfo.json";
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
  xhttp.open("GET", folder + infofilename, true);
  xhttp.send();
}

// Load post preview for current post
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
        var urlparam = getUrlParam();

        $postInfoMask.find(".posttitle").text(postinfo.title);
        $postInfoMask.find(".postdate").text(postinfo.date);
        $postPreviewer.click(function (){
          pushHistoryState(
            "?" +
            "type=post" +
            "&category=" + urlparam.category +
            "&year=" + $postPreviewer.urlparamdata.year +
            "&article=" + $postPreviewer.urlparamdata.article
          );
          loadpostMain(postinfo);
        });
        $postPreviewer.css("cursor", "pointer");
        $postPreviewer.css("background-image", "url(\"" + postFolder + postinfo.poster + "\")");
    }
  };
  xhttp.open("GET", infourl, true);
  xhttp.send();
}

function isSpecialModeOn() {
  return getHashParam()["mode"] == "secret";
}

function getPostDescr(postinfo) {
  if (!postinfo || (typeof postinfo === 'string')) return { infofile: postinfo };
  switch (postinfo.mode)
  {
  case "secret":
    //isSpecialModeOn() && (postinfo = postinfo.infofile) || (postinfo = null);
    isSpecialModeOn() || (postinfo = undefined);
    break;
  default:
    //postinfo = postinfo.infofile;
  }
  return postinfo;
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
      postslist.forEach(function (curPost, curIndex) {
        if (!(curPost = getPostDescr(curPost))) return;

        var $curPreviewer = $postPreviewer.clone();

        // Regist appear callback
        $curPreviewer.infoFile = listFolder + curPost.infofile;
        $curPreviewer.urlparamdata = {
          "year": $yearContainer.year_number,
          "article": (postslist.length - curIndex) + 654415
        };
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

function loadCategory(listurl) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var $presentList = $("#presentList");
      $presentList.empty();
      //$presentList.remove(".yearcontainer");

      var postslist_yearly = JSON.parse(this.responseText);
      var $yearContainer = $("<div>", { class: "yearcontainer" })
        .append( $("<div>", { class: "yearbanner" }).append($("<div>")) )
        .append( $("<div>", { class: "listcontainer" }) );

      postslist_yearly && postslist_yearly.forEach(function (curList) {
        var year_number = getFilename(curList).split('.')[0];
        var yearTitle = "YEAR " + year_number;
        var $curContainer = $yearContainer.clone();

        // Assign title
        $curContainer.find(".yearbanner")
          .append( $("<p>").append($("<i>").text(yearTitle)) )
          .append( $("<p>", { class: "postscount" }) );

        // Regist appear callback
        $curContainer.postslist = getFolder(listurl) + curList;
        $curContainer.year_number = year_number;
        $curContainer.onappear_callback = function () { loadList($curContainer); };
        $curContainer.appear($curContainer.onappear_callback);

        $presentList.append($curContainer);

        if ($curContainer.is(':appeared'))
          $curContainer.trigger('appear', [$curContainer]);
      });
    }
  };
  xhttp.open("GET", listurl, true);
  xhttp.send();
}

function analyzePostsParam(params, callback) {
  var excep_wa = "Wrong Arguments.";

  // parse param
  if (!params.year) throw excep_wa;
  if (!params.article) throw excep_wa;
  params.article = parseInt(params.article) - 654415;
  if (DEBUG_MODE) console.log("Loading article [" + params.article + "] in year " + params.year);

  // Load mainList
  var listurl_yearly = streamblogs.pages.categories[params.category];
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var postslist_yearly = JSON.parse(this.responseText);
      if (!postslist_yearly) return callback();

      var matchyear = postslist_yearly.filter(function (curList) {
        var curyear = getFilename(curList).split('.')[0];
        return (curyear == params.year);
      });
      if (!matchyear) return callback();
      else matchyear = matchyear[0];

      // Load yearlists that match params.year
      var listurl_curyear = getFolder(listurl_yearly) + matchyear;
      var yearfolder = getFolder(listurl_curyear);
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var postslist = JSON.parse(this.responseText); // all posts in this year
          if (!postslist) return callback();

          var aimpost = postslist[postslist.length - params.article];
          if (!aimpost) return callback();
          if (!(aimpost = getPostDescr(aimpost))) return callback();
          var postfolder = getFolder(yearfolder + aimpost.infofile);
          var infofilename = getFilename(aimpost.infofile);
          
          loadpost(postfolder, infofilename);
        }
      };
      xhttp.open("GET", listurl_curyear, true);
      xhttp.send();

    }
  };
  xhttp.open("GET", listurl_yearly, true);
  xhttp.send();

}