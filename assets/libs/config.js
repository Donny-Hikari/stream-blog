
var blogroot = "./blogs/";

streamblogs = {};

streamblogs.blogname = "Donny's Blogs";

streamblogs.user = {
    fullname: "Donny Hikari",
    name: "Donny",
    avatarurl: "./users/avatar.small.png"
};

streamblogs.pages = {
    categories: {
        "Articles": blogroot + "list/years.json",
        "ACM": blogroot + "list/acm.json"
    },
    categories_name: { /* Optional */
        "ACM": "ACM's Trip"
    },
    links: {
        "About": "./about/aboutme.json"
    },
    links_name: { /* Optional */
    },
    aboutmefile: "./about/aboutme.json",
    newpostfile: "./new_post/editpost.json"
};
