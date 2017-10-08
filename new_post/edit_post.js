/*
* Stream Blogs Edit Post Function
*
* Copyright (c) 2017 Donny Hikari
* licensed under MIT license.
*
* https://github.com/Donny-Hikari/stream-blog
*
* Version: 0.1.0
*/

function uploadfile(file, url, callback) {
    var formData = new FormData();
    formData.append(file.name, file);
    $.ajax({
        type: 'POST',
        url: url,
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            callback(data);
        },
        error: function (data) {
            console.log("Error occur when uploading " + file.name);
            console.log(data);
        }
    });
}

var upload_url = "/new_post/upload";
var post_url = "/new_post/post";

function textarea_auto_grow(element) {
    var scrollPostition = $(window).scrollTop();
    var bBottom = (scrollPostition + screen.availHeight >= $(document).height());
    var $element = $(element);
    var minHeight = parseFloat($element.css("minHeight"));
    $element.css("height", minHeight + "px");
    var scrollHeight = $element.prop('scrollHeight');
    if (scrollHeight > minHeight)
        $element.css("height", scrollHeight + "px");
    if (bBottom)
        $(window).scrollTop($(document).height());
    else
        $(window).scrollTop(scrollPostition);
}

var $focus_element = null;
function processPostElement(element) {
    element.focus(function () {
        $focus_element && $focus_element.removeClass('selected');
        $focus_element = $(this);
        console.log($focus_element);
    });
    element.click(function () {
        element.triggerHandler('focus');
    });
}

var $post_body = null;
function isPostBodyElement(e) {
    return e && e.parent().is($post_body);
}

function buildMediaContainerTemplate() {

    var $container_template = $('<div>').addClass('media_container');
    var $position_layer = $('<div>').addClass('position_layer');
    var $control_layer = $('<div>').addClass('control_layer');

    var $mask_layer = $('<div>').addClass('mask_layer');
    var $blur_layer = $('<div>').addClass('blur_layer');
    var $color_layer = $('<div>').addClass('color_layer');
    $mask_layer.append($blur_layer);
    $mask_layer.append($color_layer);

    var $btn_layer = $('<div>').addClass('btn_layer');
    var $btn_insertAfter = $('<div>').addClass('ctrl_btn btn_insertAfter');
    var $btn_unlink = $('<div>').addClass('ctrl_btn btn_unlink');
    var $btn_select = $('<div>').addClass('ctrl_btn btn_select');
    $btn_layer.append($btn_insertAfter);
    $btn_layer.append($btn_unlink);
    $btn_layer.append($btn_select);

    function getParent_MediaContainer($element) {
        return $element.parents().filter(function (index, cur_parent) {
            return $(cur_parent).hasClass("media_container");
        });
    }
    $btn_insertAfter.click(function () {
        var $container = getParent_MediaContainer($(this));
        $focus_element = $container;
        $('#choose_media').trigger('click');
    });
    $btn_unlink.click(function () {
        var $container = getParent_MediaContainer($(this));
        $container.remove();
        var filename = ($container.mediaInfo) ? $container.mediaInfo.name : $container.file.name;
        console.log('Media ' + filename + ' removed.');
    });
    $btn_select.click(function () {
        var $container = getParent_MediaContainer($(this));
        $focus_element = $container;
        $focus_element.addClass('selected');
    });

    $control_layer.append($mask_layer);
    $control_layer.append($btn_layer);
    $position_layer.append($control_layer);
    $container_template.append($position_layer);

    $container_template.hover(
        /* In */
        function () {
            $(this).find('.control_layer').css('opacity', '1');
        },
        /* Out */
        function () {
            $(this).find('.control_layer').css('opacity', '0');
        }
    );

    return $container_template;
}

function presentMedia($container, mediaInfo) {
    function autoReloadSource($mediaElement) {
        function reloadSource(e) {
            setTimeout(function () {
                $mediaElement.get(0).load();
            }, 500);
        }

        $mediaElement.on('error', reloadSource);

        var $sourceElement = $mediaElement.find('source');
        $sourceElement && $sourceElement.on('error', reloadSource);
    }

    var $mediaElement = null;
    switch (mediaInfo.type.split('/')[0])
    {
    case 'audio':
        $mediaElement = $('<audio controls="controls"><source src="' + mediaInfo.src + '" type="' + mediaInfo.type + '"/></audio>').addClass('musicbox_media');
        autoReloadSource($mediaElement);

        var $outerContainer = $('<div>').addClass('musicbox_outer_container');
        var $innerContainer = $('<div>').addClass('musicbox_inner_container');
        var $tag = $('<textarea>').addClass('musicbox_tag_editor').attr({
            'placeholder': "Audio Tag",
            'onkeyup': "textarea_auto_grow(this)",
            'onkeydown': "textarea_auto_grow(this)",
        });
        var $colon = $('<span>').addClass('musicbox_colon').text(':');
        $innerContainer.append($tag);
        $innerContainer.append($colon);
        $innerContainer.append($mediaElement);
        $outerContainer.append($innerContainer);

        $mediaElement = $outerContainer;

        $container.find('.control_layer').addClass('control_layer_music');
        $mediaElement.data("mediatype", "music");
        break;
    case 'video':
        $mediaElement = $('<video width="100%" controls="controls"><source src="' + mediaInfo.src + '" type="' + mediaInfo.type + '" /></video>');
        autoReloadSource($mediaElement);
        $mediaElement.addClass('media_place_below');
        $mediaElement.data("mediatype", "video");
        break;
    case 'image':
        $mediaElement = $('<img width="100%" src="' + mediaInfo.src + '" alt="' + mediaInfo.name + '" />');
        $mediaElement.get(0).load = function () {
            this.src = this.src;
        }
        autoReloadSource($mediaElement);
        $mediaElement.addClass('media_place_below');
        $mediaElement.data("mediatype", "image");
        break;
    }

    $container.mediaInfo = mediaInfo;
    $mediaElement.addClass('media_body');
    $container.find('.media_substituter').replaceWith($mediaElement);
    // $container.append($mediaElement);
    console.log('Media ' + mediaInfo.name + ' appended.');
}

function attachfile(e) {
    e = e || window.event;
    var files = this.files;
    if (files == null) return;

    var $curElement = $focus_element;
    if (($curElement == null) || ($curElement.parent == null) || (!isPostBodyElement($curElement)))
        $curElement = $post_body.children().last();
    var $container_template = buildMediaContainerTemplate();

    for(var i = 0, curfile; curfile = files[i]; i++) {
        let $container = $container_template.clone(true, true);
        $container.file = curfile;

        var $media_substituter = $('<div>').addClass('media_substituter').text(curfile.name);
        $container.append($media_substituter);

        $container.insertAfter($curElement);
        $curElement = $container;

        uploadfile(curfile, upload_url, function (mediumInfo) {
            mediumInfo.forEach(function (cur_media) {
                presentMedia($container, cur_media);
            });
        }); // uploadfile

        // var reader = new FileReader();
        // reader.onload = function(e) { };
        // reader.readAsDataURL(curfile);
    } // for all files

    if ($curElement.next().attr("class") != "ta_container") {
        var $next_body = $('<div class="ta_container"><textarea class="ta_body" placeholder="&#x2606Write freely&#x2606" onkeyup="textarea_auto_grow(this)" onkeydown="textarea_auto_grow(this)"/></div>');
        processPostElement($next_body);
        $next_body.insertAfter($curElement);
    }

    $('#choose_media').prop("value", "");

}

function unlinkfile(e) {
    if (isPostBodyElement($focus_element) &&
        (!$focus_element.hasClass('ta_container') || $post_body.find('.ta_container').length > 1))
        $focus_element.remove();
}

function translateMediaElement($srcMedia) {
    var $destMedia = $srcMedia.clone();
    switch ($srcMedia.data("mediatype"))
    {
    case "music":
        $destMedia.removeClass("media_body musicbox_outer_container")
                  .addClass("musicbox");
        $destMedia.find(".musicbox_inner_container")
                  .removeClass("musicbox_inner_container")
                  .addClass("musicbox_inner");
        var $tagEditor = $destMedia.find(".musicbox_tag_editor");
        $destMedia.find(".musicbox_colon")
                  .removeClass("musicbox_colon")
                  .addClass("musicbox_tag")
                  .text($tagEditor.val());
        $tagEditor.remove();
        break;
    case "video":
        break;
    case "image":
        break;
    }
    return $destMedia;
}

// Return html of article
function generateArticle() {
    var curelement = $post_body.children();
    var $article = $('<div class="bodytext">');

    curelement.each(function (i) {
        var $e = $(curelement[i]);
        console.log($e);
        if ($e.hasClass('ta_container')) // text
        {
            //var $paragraph = $("<p>");
            var bodytext = $e.find('.ta_body').val();
            bodytext = "<p>" + bodytext.replace(/\n/g, "</p>\n<p>") + "</p>";
            var $paragraph = $.parseHTML(bodytext);
            //$paragraph.html(bodytext);
            $article.append($paragraph);
        }
        else if ($e.hasClass('media_container'))
        {
            var $mediaElement = translateMediaElement($e.find('.media_body'));
            $article.append($mediaElement);
        }
    });

    var $html = $('<html>');
    var $head = $('<head>');
    var $meta1 = $('<meta>').attr({
        'http-equiv': 'Content-Type',
        'content': 'text/html; charset=utf-8'
    });
    var $link1 = $('<link>').attr({
        'rel': 'stylesheet',
        'href': './main.css',
        'type': 'text/css'
    });
    $head.append($meta1);
    $head.append($link1);

    var $body = $('<body>');
    var $mainbody = $('<div>').addClass('mainbody');
    var $headline = $('<h1>').addClass('headline').attr('id', 'mainbody');
    $headline.text($('#ta_headline').val());
    var $author = $('<div>').addClass('author');
    $author.text($('#ta_author').val());
    var $signature = $('<div>').addClass('signature');
    $signature.text("By " + $('#ta_author').val());
    var $last_edit = $('<div>').addClass('last_edit');
    $last_edit.text("Last modified: " + new Date().toJSON().slice(0,10));

    $mainbody.append($headline);
    $mainbody.append($author);
    $mainbody.append($article);
    $mainbody.append($signature);
    $mainbody.append($last_edit);
    $body.append($mainbody);

    $html.append($head);
    $html.append($body);

    return $html.prop('outerHTML');
}

function postArticle() {

    var title = $('#ta_headline').val();
    var author = $('#ta_author').val();
    var created_date = $('#ta_createdate').val();

    var filetitle = title.trim().replace(/ /g, '-');
    var article_filename = created_date + '-' + filetitle + '.html';
    var article_content = generateArticle();
    var article_blob = new Blob([article_content]);
    var article_file = new File([article_blob], article_filename);
    uploadfile(article_file, upload_url, function (data) { console.log(data); });

    var posterImg = $(post_body).find('img')[0];
    var poster = (posterImg) ? (posterImg.src) : (null);
    var postinfo = {
        'main': article_filename,
        'title': title,
        'author': author,
        'date': created_date,
        'poster': poster
    };
    var postinfo_str = JSON.stringify(postinfo);
    var postinfo_blob = new Blob([postinfo_str]);
    var postinfo_file = new File([postinfo_blob], filetitle + '-' + 'postinfo.json');
    uploadfile(postinfo_file, post_url, function (data) {
        console.log(data);
        if (data == "Post accepted.")
        {
            $(".post_state p").text("Post Succeeded!");
            $(".post_state").css('background-color', 'rgba(188, 255, 124, 0.89)');
            $(".post_state").css('display', 'block');
        }
        else
        {
            $(".post_state p").text("Post Failed!");
            $(".post_state").css('background-color', 'rgba(249, 82, 82, 0.81)');
            $(".post_state").css('display', 'block');
        }
        setTimeout(function () { $(".post_state").css('display', 'none'); }, 1600);
    });

}

$(document).ready(function () {
    $post_body = $('#post_body');

    $('#ta_createdate').val(new Date().toJSON().slice(0,10));
    $('#btn_dispose').click(function () {
        if (confirm("Sure to dispose?")) {
            jumpToHome();
        }
    });
    $('#btn_post').click(postArticle);

    $('#choose_media').change(attachfile);
    $('#unlink_media').click(unlinkfile);
    
    processPostElement($('.ta_container'));
});