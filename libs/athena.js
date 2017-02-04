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
  if ($("#myprofile").attr("lang") == "centerized") {
    $("#myprofile").attr("lang", "");
  } else {
    $("#myprofile").attr("lang", "centerized");
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
      var params = document.location.search.split('&');
      if (DEBUG_MODE) console.log(params);
      if (params[0].substr(1, 4) == "type") {
        var type = params[0].split("=")[1];
        if (DEBUG_MODE) console.log(type);
        switch (type)
        {
        case "posts":
          analyzePostsParam(params, onfailfallback);
          break;
        case "aboutme":
          loadAboutme(onfailfallback);
          break;
        }
      } // params[0].substr(1, 4) == "type"
    } // has search params
  } catch (e) {
    onfailfallback();
  }

}

$(window).ready(function (){

  window.onpopstate = function (e) {
    analyzeUrlParam();
  };

  // Initialize for menuPanel
  $("#menuPanel").css("left", "-" + $("#menuPanel").width() + "px");

  analyzeUrlParam();

});