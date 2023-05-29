const express = require('express');
const request = require('request');
const xml2json =  require('@hendt/xml2json');
const xml = require('xml')

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  return res.status(200).json({ type: 'error', message: 'running' });
})

app.get('/data', (req, res) => {
  request(
    { url: 'http://meteo.aeroklubluhacovice.cz:8081/xml.xml' },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }

      
      res.set('Content-Type', 'text/xml');
      res.send(xml(body));
    }
  )
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
module.exports = app;

// const express = require('express');
  
// const app = express();
// const PORT = 3000;
  
// app.listen(PORT, (error) =>{
//     if(!error)
//         console.log("Server is Successfully Running, and App is listening on port "+ PORT)
//     else 
//         console.log("Error occurred, server can't start", error);
//     }
// );