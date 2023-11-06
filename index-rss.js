var colors = require("@colors/colors");
let Parser = require("rss-parser");
let parser = new Parser();
const mongoose = require("mongoose");

(async () => {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/data")
    .then(() => console.log("Connected!".brightGreen));

  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const Item = new Schema({
    id: ObjectId,
    title: String,
    link: String,
    date: { type: Date, default: Date.now },
  });

  const myItem = mongoose.model("Item", Item);

  let feed = await parser.parseURL("https://www.reddit.com/.rss");
  console.log(`feed.title has ${feed.items.length} item(s)\n`.green);

  feed.items.forEach(async (item) => {
    console.log(item.title.yellow + ":" + item.link.cyan + "\n");
    await myItem.create({
      title: item.title,
      link: item.link,
    });
  });
})();
