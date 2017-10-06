/*
* Athena - framework loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.1.9
*/

var DEBUG_MODE = true;
var DEBUG_VERBOSE = DEBUG_MODE && true;

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
  jumpToHome();
}

function onClickBlogsHome() {
  jumpToHome();
  $(window).scrollTop(0);
}

function onClickAboutme() {
  jumpToAboutme();
}

function onClickACMHome() {
  if (window.location.hash) window.location.hash+="&filter=acm";
  else window.location.hash="#filter=acm";
  window.location.reload();
  $(window).scrollTop(0);
}

function loadRmService() {
  $.ajax({
    url: "./libs/rmservice.js",
    dataType: "script",
    success: null
  });
}

function onCreateNewPost() {
  jumpToNewPost();
}

function onScrollToTop() {
  $(window).scrollTop(0);
}

function getUrlParam() {
  return document.location.search.split('&');
}

function getUrlParam_Type(params) {
    if (params[0].substr(1, 4) != "type")
      return null;
    else
      return params[0].split("=")[1];
}

function dynamicNewPostBtn() {
  var hostname = document.location.hostname;
  if (((hostname == "localhost") || (hostname == "192.168.139.1")) && (getUrlParam_Type(getUrlParam()) != "newpost")) {
    $(".new_post_btn").css('visibility', 'visible');
  } else {
    $(".new_post_btn").css('visibility', 'hidden');
  }
}

function analyzeUrlParam() {

  // fallback
  function onfailfallback() {
    if (DEBUG_MODE) console.log("Error occured when analyzing url. Load homepage instead.");
    jumpToHome();
  }

  try {
    if (!document.location.search || (document.location.search.length == 0))
      loadHomepage();
    else {
      var params = getUrlParam();
      if (DEBUG_MODE) console.log(params);

      var type = getUrlParam_Type(params);
      if (type) {
        if (DEBUG_MODE) console.log(type);
        switch (type)
        {
        case "posts":
          analyzePostsParam(params, onfailfallback);
          break;
        case "aboutme":
          loadAboutme(onfailfallback);
          break;
        case "newpost":
          loadNewPost();
          break;
        }

      } // params[0].substr(1, 4) == "type"
    } // has search params
  } catch (e) {
    onfailfallback();
  }

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

  dynamicNewPostBtn();

  analyzeUrlParam();
  
  loadRmService();

});