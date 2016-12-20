var cheerio = require("cheerio");
var Downloader = require("./paper_downloader_frame.js")

console.log(process.argv[3])

Downloader.Downloader({
	targetDir: process.argv[2],
	listURL: process.argv[3],
	parser: function parse(saver, rawResp){
		var $ = cheerio.load(rawResp)
		// console.log(rawResp)
		$('.table tr').each(function(){
			var s = $(this).find('small').text().replace("Author(s): ", "").replace("*", "").split(";")
			var authors = []
			for( var i=0; i<3 && i<s.length; i++){
				authors.push( s[i].split(",")[0] )
			}
			authors = authors.join(",")

			var title = $(this).find('a span').text();
			var link = $(this).find('a').attr("href")
			if( title == "" )
				return true;
			Downloader.getPage(link, function(resp){
				var $ = cheerio.load(resp);
				console.log(title, "123")
				var pdf = $('#' + link.split("/").slice(-1)[0] ).attr('href');
				console.log(pdf)
				saver(pdf, authors, link.split("/").slice(-1)[0])
			})
		})
	}
})

