const express = require("express");
const request = require("request");

const fetch_url = "http://meteo.aeroklubluhacovice.cz:8081/xml.xml";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  return res.status(200);
});

app.get("/data", (req, res) => {
  try {
    request({ url: fetch_url }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: "error", message: error.message });
      }
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
