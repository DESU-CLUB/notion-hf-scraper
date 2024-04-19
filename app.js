require("dotenv").config();
const { Client } = require("@notionhq/client");
const axios = require("axios");
const scrapePapers = require("./scraper");

const notion = new Client({
  auth: process.env.NOTION_KEY,
});
const database = process.env.NOTION_PAGE_ID;
const block = process.env.NOTION_BLOCK_ID;

async function fetchAllPagesNames() {
  const names = [];
  const response = await notion.databases.query({
    database_id: database,
  });
  for (const page of response.results) {
    names.push(page.properties.Name.title[0].text.content);
  }
  return names;
}

async function addtoDatabase(data) {
  const response = await notion.pages.create({
    parent: { database_id: database },
    icon: {
      type: "external",
      external: { url: "https://www.notion.so/icons/document_gray.svg" },
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: data.title,
            },
          },
        ],
      },
      Status: {
        status: {
          name: "Not started",
        },
      },

      Author: {
        rich_text: [
          {
            text: {
              content: data.authors,
            },
          },
        ],
      },
      Link: {
        url: data.link,
      },
      Score: {
        select: {
          name: "TBD",
        },
      },
    },
  });
  console.log(response);
}

async function globalAdder() {
  const names = await fetchAllPagesNames();
  const papers = await scrapePapers();
  for (const paper of papers) {
    if (names.includes(paper.title)) {
      console.log("Already in database", paper.title);
      continue;
    } 
    console.log("Adding paper to database", paper.title);
    await addtoDatabase(paper);
  }
}

globalAdder();

//fetchUser();
