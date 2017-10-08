/*
* Athena - framework loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.2.3
*/

/* Trigger onpushstate when pushState */
function listenPushState() {
  var pushState = window.history.pushState;
  window.history.pushState = function(state) {
      var result = pushState.apply(window.history, arguments);
      if (typeof window.onpushstate == "function") {
          window.onpushstate({state: state});
      }
      return result;
  }
}

/* Parse search param */
function getUrlParam() {
  var params = { category: Object.keys(streamblogs.pages.categories)[0] };
  if (!document.location.search) return params;
  document.location.search.split('?').pop().split('&').forEach((val)=>{
    var param = val.split("=");
    if (param && param.length == 2)
      params[param[0]] = param[1];
  });
  return params;
}

/* Parse hash param */
function getHashParam() {
  var attachments = {};
  if (!document.location.hash) return attachments;
  document.location.hash.split('#').pop().split('&').forEach((val)=>{
    var param = val.split("=");
    if (param && param.length == 2)
    attachments[param[0]] = param[1];
  });
  return attachments;
}


function onClickMenuBtn () {
  $("#menuPanel").show();
  $("#menuUnderMask").show();
  $("#menuPanel").css("left", "0");
  $("#menuUnderMask").css("opacity", "1");
}

function onCloseMenu() {
  $("#menuPanel").css("left", "-" + $("#menuPanel").width() + "px");
  $("#menuUnderMask").css("opacity", "0");
  $("#menuUnderMask").on('transitionend', function () {
    $("#menuUnderMask").off('transitionend');
    $("#menuPanel").hide();
    $("#menuUnderMask").hide();
  });
}

function onChangeAvatarStyle() {
  if ($("#myprofile").hasClass("profile-centerized")) {
    $("#myprofile").removeClass("profile-centerized");
  } else {
    $("#myprofile").addClass("profile-centerized");
  }
}

function onClickHomeBtn () {
  gotoCategory(getUrlParam().category);
}

function onScrollToTop() {
  $(window).scrollTop(0);
}

function onCreateNewPost() {
  gotoNewPost();
}

function dynamicNewPostBtn() {
  var hostname = document.location.hostname;
  var type = getUrlParam().type;
  if (((hostname == "localhost") || (hostname == "192.168.139.1")) && (!type || type != "newpost")) {
    $(".new_post_btn").css('visibility', 'visible');
  } else {
    $(".new_post_btn").css('visibility', 'hidden');
  }
}

function loadRmService() {
  $.ajax({
    url: "./libs/rmservice.js",
    dataType: "script",
    success: () => {},
    error: () => {}
  });
}

function analyzeUrlParam() {

  // fallback
  function onfailfallback() {
    if (DEBUG_MODE) console.log("Error occured when analyzing url. Load homepage instead.");
    gotoHomepage();
  }

  try {
    var params = getUrlParam();
    if (DEBUG_MODE) console.log(params);

    var type = params.type;
    switch (type)
    {
    case "lists": // Analyzing categories like Articles(homepage), ACM, etc
      analyzeCategory(params, onfailfallback);
      break;
    case "post":
      analyzePostsParam(params, onfailfallback);
      break;
    case "links":
      gotoLink(params.linkname);
      break;
    case "newpost":
      gotoNewPost();
      break;
    default: // undefined or so
      gotoHomepage();
      break;
    } // switch page type
  } catch (e) {
    onfailfallback();
  }

}

function loadUserConfig() {
  var user = streamblogs.user;
  var pages = streamblogs.pages;

  // Set blogs title
  document.title = streamblogs.blogname;
  // Set home button
  $("#homebtn").append($("<span>").text(streamblogs.blogname));

  // Set user profile
  $("#userprofile-avatar").attr("src", user.avatarurl);
  $("#userprofile-username").text(user.fullname);

  // Set categories
  Object.keys(pages.categories).forEach((val) => {
      var nxtCategory = $("<div>", { class: "links transit-bkcolor" });
      var categoryName = $("<span>");
      if (pages.categories_name[val]) categoryName.text(pages.categories_name[val]);
      else categoryName.text(val);
      nxtCategory.append(categoryName);
      nxtCategory.click(() => {
          onCloseMenu();
          gotoCategory(val);
      });
      $(".navlist").append(nxtCategory);
  });

  // Set links
  Object.keys(pages.links).forEach((val) => {
      var nxtLink = $("<div>", { class: "links transit-bkcolor" });
      var linkName = $("<span>");
      if (pages.links_name[val]) linkName.text(pages.links_name[val]);
      else linkName.text(val);
      nxtLink.append(linkName);
      nxtLink.click(() => {
          onCloseMenu();
          gotoLink(val);
      });
      $(".navlist").append(nxtLink);
  });

}

$(window).ready(function (){

  listenPushState();
  window.onpopstate = function (e) {
    analyzeUrlParam();
    dynamicNewPostBtn();
  };
  window.onpushstate = function (e) {
    dynamicNewPostBtn();
  };
  
  // Initialize for menuPanel
  $("#menuPanel").css("left", "-" + $("#menuPanel").width() + "px");

  loadUserConfig();

  dynamicNewPostBtn();

  analyzeUrlParam();
  
  //loadRmService();

});