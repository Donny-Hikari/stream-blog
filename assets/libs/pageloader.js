/*
* Pageloader - ACM homepage loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.1.2
*/

/*
blogsloader depend on the following variables/function in pageloader:
+ PageStateEnum
+ homepageScrollTop
- pushHistoryState
- setPageTitle
- switchPage
*/

function pushHistoryState(params) {
  if (window.location.search == params) return;
  window.history.pushState(null, null, window.location.pathname + params + document.location.hash);
}


const PageStateEnum = {
  HOME: 0,
  BLOGPOST: 1
};

function setPageTitle(title) {
  var postTitle = $("#postTitleContainer");
  if (!title || title == "") {
    document.title = streamblogs.blogname;
    postTitle.text("");
  }
  else {
    document.title = title + " - " + streamblogs.blogname;
    postTitle.text(title);
  }
}

var homepageScrollTop = 0;
function switchPage(page) {
  switch (page)
  {
  case PageStateEnum.HOME:
    $("#postContainer").hide();
    setPageTitle(getUrlParam()["category"]);
    $('#homebtn').find('span').removeClass("home").text(streamblogs.blogname);
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

var categoryStatus = null;

function gotoCategory(category) {
  if (DEBUG_MODE) console.log("Loading category " + category + " ...");
  pushHistoryState("?type=lists&category=" + category);
  switchPage(PageStateEnum.HOME);
  if (categoryStatus == category) return;
  categoryStatus = category;
  loadCategory(streamblogs.pages.categories[category]);
}

function gotoHomepage() {
  if (DEBUG_MODE) console.log("Loading homepage...");
  pushHistoryState("");
  var categories = streamblogs.pages.categories;
  gotoCategory(Object.keys(categories)[0]);
}

function gotoLink(linkname) {
  var link = streamblogs.pages.links[linkname];
  pushHistoryState("?type=links&linkname=" + linkname);
  loadpost(getFolder(link), getFilename(link));
}

function gotoNewPost(callback) {
  var newpostfile = streamblogs.pages.newpostfile;
  pushHistoryState("?type=newpost");
  loadpost(getFolder(newpostfile), getFilename(newpostfile));
}

function analyzeCategory(params, callback) {
  var except_wa = "Wrong Arguments.";

  if (!params.category) throw except_wa;
  gotoCategory(params.category);
}