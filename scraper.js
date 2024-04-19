const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://huggingface.co/papers"; // Replace this with the actual URL you want to scrape

const scrapePapers = async () => {
  try {
    const papers = [];
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    $("article.flex.flex-col.overflow-hidden.rounded-xl.border").each(
      function () {
        const entry = {};
        const upnum = $(this).find("div.leading-none").text();
        if (+upnum < 10) {
          return;
        }
        const link = $(this)
          .find(
            "a.shadow-alternate-sm.peer.relative.block.h-56.w-full.cursor-pointer.overflow-hidden.rounded-xl.border.bg-white.dark\\:border-gray-700.sm\\:h-64.md\\:h-72.lg\\:h-80"
          )
          .attr("href");
        entry["link"] = link;
        const titleHeader = $(this).find('h3.mb-1.text-lg.font-semibold.leading-\\[1\\.2\\].hover\\:underline.peer-hover\\:underline.md\\:text-2xl');
        const title = $(titleHeader).find('a.cursor-pointer').text();
        entry["title"] = title;
        papers.push(entry);
      }
    );
    const arxiv = [];

    for (const paper of papers) {
      const arxivEntries = {...paper};
      const newElement = paper.link.slice(7);
      const newUrl = url + newElement;
      const response = await axios.get(newUrl);
      const html = response.data;
      const $ = cheerio.load(html);
      const firstButtonHref = $("a.btn.inline-flex.h-9.items-center")
        .first()
        .attr("href");
      let author = $("a.whitespace-nowrap.underline").first().text();

      author = author.trim().split(" ");
      const lastName = author[author.length - 1]

      
      arxivEntries["authors"] = lastName+" et.al.";
      arxivEntries["link"] = firstButtonHref;
      arxiv.push(arxivEntries);
    }
    return arxiv;
  } catch (error) {
    console.error(error);
  }
};



module.exports = scrapePapers;