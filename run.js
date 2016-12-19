var http = require("http");
var fs = require("fs");
var cheerio = require("cheerio");

var targetDir = process.argv[2];
var link = process.argv[3];

console.log( link )

if( !fs.existsSync(targetDir) ){
	fs.mkdirSync(targetDir);
	console.log( "Create directory " + targetDir )
}

http.get(link, (res) => {
	if( res.statusCode !== 200 ){
		console.log("Request Fail.");
		res.resume();
		return ;
	}

	res.setEncoding("utf8");
	let raw = "";
	res.on('data', (chunk) => raw += chunk);
	res.on('end', () => parse(raw) )

}).on('error', (e) => {
	console.log(`Got error: ${e.message}`);
});


function parse(rawResp){
	var $ = cheerio.load(rawResp)
	// console.log(rawResp)
	$('.paper').each(function(){
		var authors = $(this).find(".authors").text().replace(/\s{2,}|\n/g, "").split(",").slice(0,2).join(",")
		var title = $(this).find('.title').text().replace(/\W/g, " ").replace(/\s{2,}/, "").slice(0,60);
		var url = $(this).find(".links a:nth-child(2)").attr('href')
		if( $(this).find(".links a:nth-child(2)").attr('href').indexOf("http://") == -1 )
			url = link + "/" + url
		download(url, authors, title);
	})
}

function download(url, authors, title){
	var fn = targetDir + "/(" + authors + ") " + title + ".pdf"
	if( fs.existsSync(fn) )
		return
	var file = fs.createWriteStream( fn )
	// console.log( url )
	http.get(url, (resp) => {
		resp.pipe(file)
		file.on('finish', () => {
			file.close()
			console.log( fn )
		}).on('error', (err) => {
			fs.unlink(fn)
			console.log( err )
		})
	} ).on("error", (e) => {
		console.log(`Got error: ${e.message}`);
	})
}