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

function getUrlParam() {
  var params = { category: "Articles" };
  if (!document.location.search) return params;
  document.location.search.split('?').pop().split('&').forEach((val)=>{
    var param = val.split("=");
    if (param && param.length == 2)
      params[param[0]] = param[1];
  });
  return params;
}

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
  jumpToCategory("ACM");
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

function dynamicNewPostBtn() {
  var hostname = document.location.hostname;
  var type = getUrlParam().type;
  if (((hostname == "localhost") || (hostname == "192.168.139.1")) && (!type || type != "newpost")) {
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
    case "aboutme":
      loadAboutme(onfailfallback);
      break;
    case "newpost":
      loadNewPost();
      break;
    default: // undefined or so
      loadHomepage();
      break;
    } // switch page type
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