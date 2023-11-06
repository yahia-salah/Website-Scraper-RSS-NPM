var colors = require("@colors/colors");
const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const mongoose = require("mongoose");

(async function example() {
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

  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get("https://www.google.com/ncr");
    await driver.findElement(By.name("q")).sendKeys("webdriver", Key.RETURN);
    await driver.wait(until.titleIs("webdriver - Google Search"), 1000);
    let links = await driver.findElements(By.xpath("//h3/parent::a"));
    let results = (
      await Promise.all(
        links.map(async (x) => {
          return {
            title: await x.getText(),
            link: await x.getAttribute("href"),
          };
        })
      )
    ).filter((x) => x.title);

    console.log(`results has ${results.length} item(s)\n`.green);

    results.forEach(async(item) => {
      console.log(
        colors.yellow(item.title) + ":" + colors.cyan(item.link) + "\n"
      );
      await myItem.create({
        title: item.title,
        link: item.link,
      });
    });
  } catch (err) {
    console.log(colors.red(err));
  } finally {
    await driver.quit();
  }
})();
