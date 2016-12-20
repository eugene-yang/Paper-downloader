var cheerio = require("cheerio");
var Downloader = require("./paper_downloader_frame.js")

console.log(process.argv[3])

Downloader.Downloader({
	targetDir: process.argv[2],
	listURL: process.argv[3],
	parser: function parse(saver, rawResp){
		var $ = cheerio.load(rawResp)
		// console.log(rawResp)
		$('.paper').each(function(){
			var authors = $(this).find(".authors").text().replace(/\s{2,}|\n/g, "").split(",").slice(0,2).join(",")
			var title = $(this).find('.title').text().replace(/\W/g, " ").replace(/\s{2,}/, "").slice(0,60);
			var url = $(this).find(".links a:nth-child(2)").attr('href')
			saver(url, authors, title);
		})
	}
})

