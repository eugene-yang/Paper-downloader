var cheerio = require("cheerio");
var Downloader = require("./paper_downloader_frame.js")

console.log(process.argv[3])
// NIPS

Downloader.Downloader({
	targetDir: process.argv[2],
	listURL: process.argv[3],
	pause: 100,
	parser: function parse(saver, rawResp){
		var listURL = process.argv[3];
		var $ = cheerio.load(rawResp)
		// console.log(rawResp)
		$('.main.wrapper ul li').each(function(){
			var title = $(this).find("a:nth-child(1)").text();
			var link = Downloader.Tools.getDomain(listURL) + $(this).find("a:nth-child(1)").attr("href");
			if( title == "" )
				return true;
			Downloader.getPage(link, function(resp){
				var $ = cheerio.load(resp);
				console.log(title)
				var pdf = "";
				$(".main.wrapper > a").each(function(){
					if( $(this).text() == "[PDF]" ){
						pdf = $(this).attr("href");
						return false;
					}
				})
				if( pdf == "" )
					return;
				var authors = []
				$(".author").each(function(){ authors.push($(this).text()) })
				console.log(pdf)
				saver(pdf, authors.slice(0,2).join(", "), link.split("/").slice(-1)[0])
			})
		})
	}
})

