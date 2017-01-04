var http = require("http");
var fs = require("fs");


// need to include targetDir(string), listURL(string), parser(function[saver, rawData]) 
module.exports = {
	Downloader: function Downloader(config){
		if( typeof(config) !== "object" )
			throw new TypeError("Wrong config type");

		var baseURL = config.listURL.split("/").slice(0,-1).join("/")

		var realSaver = _saver.bind( null, config.targetDir, baseURL )
		var realParse = config.parser.bind(null, realSaver);
		_initGet( config.listURL, realParse );
	},
	getPage: function(link, parse){ _initGet(link, parse) }
}

function _initGet(link, parse){
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
}

function _saver(targetDir, baseurl, url, authors, title){
	if( url.indexOf("http://") == -1 ){
		if( url[0] == "/" )
			url = _getDomain(baseurl) + url;
		else{
			url = baseurl + "/" + url
		}
	}

	var fn = targetDir + "/(" + authors + ") " + title + ".pdf"
	if( fs.existsSync(fn) )
		return
	var file = fs.createWriteStream( fn )
	http.get(url, (resp) => {
		resp.pipe(file)
		file.on('finish', () => {
			file.close()
			// console.log( fn )
		}).on('error', (err) => {
			fs.unlink(fn)
			console.log( err )
		})
	} ).on("error", (e) => {
		console.log(`Got error: ${e.message}`, link);
	})
}

function _getDomain(url){
	var protocal = "http://"
	if( url.match(/.*\/\//g) !== null )
		protocal = url.match(/.*\/\//g)[0]

	url = url.replace(protocal, "");
	return protocal + url.split("/")[0];

}
