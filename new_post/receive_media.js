
const server_url = '/new_post/upload',
	  server_port = 10077,
	  relative_url = '/stream/new_post/',
	  storage_folder = './tmp/',
	  model_folder = './model/',
	  blogs_url = '/stream/blogs/';

var fs = require('fs.extra'),
	express = require('express'),
	multer = require('multer');

var app = express();
var storage = multer.diskStorage({
	destination: function (req, file, cb){
		cb(null, storage_folder);
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});
app.use(multer({ storage: storage }).any());
if (!fs.existsSync(storage_folder)) fs.mkdirSync(storage_folder);

app.post(server_url, function (req, res, next) {
	console.log('Client accepted.');
	console.log(req.files);

	var mediumInfo = [];
	var cur_media = {};
	req.files.forEach(function (curfile) {
		cur_media.name = curfile.originalname;
		cur_media.type = curfile.mimetype;
		cur_media.src = relative_url + storage_folder + cur_media.name;
		mediumInfo.push(cur_media);
	});
	console.log(mediumInfo);
	res.send(mediumInfo);
});
app.post("/new_post/post", function (req, res, next) {
	console.log("Accepting post...");
	console.log(req.files);

	try
	{
		// Write postinfo file
		var postinfoFile = storage_folder + req.files[0].originalname;
		var postinfo = JSON.parse(fs.readFileSync(postinfoFile));
		if (postinfo.poster)
			postinfo.poster = postinfo.poster.split('/').pop();
		fs.writeFileSync(postinfoFile, JSON.stringify(postinfo));

		// Redirect urls
		var rawpost = fs.readFileSync(storage_folder + postinfo.main, 'utf8');
		rawpost = rawpost.replace(new RegExp("=\"" + relative_url + storage_folder, 'g'), "=\".\/");
		fs.writeFileSync(storage_folder + postinfo.main, rawpost);

		var year = postinfo.date.slice(0, 4);
		var month = postinfo.date.slice(5, 7);
		var day = postinfo.date.slice(8, 10);
		var post_url = "../.." + blogs_url + year + "/";
		var yearinfo_url = post_url + year + ".json";
		if (!fs.existsSync(post_url))
		{
			fs.mkdirSync(post_url);
			// TODO: Add year to lists
		}
		post_url = post_url + month + "/";
		if (!fs.existsSync(post_url)) fs.mkdirSync(post_url);
		post_url = post_url + day + "/";
		if (!fs.existsSync(post_url)) fs.mkdirSync(post_url);
		var yearinfo = JSON.parse(fs.readFileSync(yearinfo_url, 'utf8'));
		postinfo.direct = true;
		postinfo.postfolder = "./" + month + "/" + day + "/";
		postinfo.infofile = postinfo.postfolder + req.files[0].originalname;
		yearinfo.splice(0, 0, postinfo);
		console.log(yearinfo);
		fs.writeFileSync(yearinfo_url, JSON.stringify(yearinfo));

		const maincss = "main.css";
		var rawcss = fs.readFileSync(model_folder + maincss);
		fs.writeFileSync(post_url + maincss, rawcss);

		fs.copyRecursive(storage_folder, post_url, function (err) {
			if (err) {
				res.send("Post failed.").end();
				console.log("Post failed.");
			} else {
				res.send("Post accepted.").end();
				console.log("Post accepted.");
				fs.removeSync(storage_folder);
				fs.mkdirSync(storage_folder);
			}
		});
	} catch (e) {
		console.log(e);
		res.send("Post failed.").end();
		console.log("Post failed.");
	}
});
app.listen(server_port);
console.log('Listening at ' + server_port);