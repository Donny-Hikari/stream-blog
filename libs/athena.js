/*
* Athena - framework loader
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.1.0
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


$(window).ready(function (){

  $("#menuPanel").css("left", "-" + $("#menuPanel").width() + "px");

  // if ($(window).width() >= 1000) {
  //   $("#myprofile").on('click', onChangeAvatarStyle);
  // }

});