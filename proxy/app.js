const express = require("express");
const request = require("request");

const fetch_url = "http://meteo.aeroklubluhacovice.cz:8081/xml.xml";

const app = express();

let lastFetch
let lastData 

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  return res.status(200);
});

app.get("/data", (req, res) => {
  try {
    const now = moment()
    const duration = moment.duration(now.diff(lastFetch));
    const seconds = parseInt(duration.asSeconds());

    if(seconds<10 && lastFetch !== null && lastData !== null) {
      console.log("Cached " + seconds)
      res.set("Content-Type", "text/xml");
      res.send(lastData);
    }

    request({ url: fetch_url }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }
      console.log("Caching")
      lastFetch = moment()
      lastData = body
      res.set("Content-Type", "text/xml");
      res.send(body);
    });
  } catch (error) {
    console.log(error)
    return res.status(200).json(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
module.exports = app;
