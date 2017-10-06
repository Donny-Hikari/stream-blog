/*
* ACMLoader - ACM homepage loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.0.1
*/

var DEBUG_MODE = true;
var DEBUG_VERBOSE = DEBUG_MODE && true;

var blogroot = "./blogs/";
var categories = {
  "Articles": blogroot + "list/years.json",
  "ACM": blogroot + "list/acm.json"
};
var aboutmefile = "./about/aboutme.json";
var newpostfile = "./new_post/editpost.json";

/*
blogsloader depend on the following variables/function:
+ PageStateEnum
+ homepageScrollTop
- pushHistoryState
- setPageTitle
- switchPage
*/

function pushHistoryState(params) {
  window.history.pushState(null, null, window.location.pathname + params + document.location.hash);
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
    setPageTitle(getUrlParam()["category"]);
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

var categoryStatus = null;

function gotoCategory(category) {
  switchPage(PageStateEnum.HOME);
  if (categoryStatus == category) return;
  categoryStatus = category;
  loadCategory(category);
}

function loadHomepage() {
  if (DEBUG_MODE) console.log("Loading homepage...");
  gotoCategory(categories["Articles"]);
}

function jumpToHome() {
  pushHistoryState("");
  loadHomepage();
}

function loadAboutme(callback) {
  loadpost(getFolder(aboutmefile), getFilename(aboutmefile));
}

function jumpToAboutme() {
  pushHistoryState("?type=aboutme");
  loadAboutme(jumpToHome);
}

function loadNewPost(callback) {
  loadpost(getFolder(newpostfile), getFilename(newpostfile));
}

function jumpToNewPost() {
  pushHistoryState("?type=newpost");
  loadNewPost(jumpToHome);
}

function jumpToCategory(category) {
  if (DEBUG_MODE) console.log("Loading category " + category + " ...");
  pushHistoryState("?type=lists&category=" + category);
  gotoCategory(categories[category]);
}

function analyzeCategory(params, callback) {
  var except_wa = "Wrong Arguments.";

  if (!params.category) throw except_wa;
  gotoCategory(categories[params.category]);
}