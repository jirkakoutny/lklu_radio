import './App.css'
import { useState, useEffect } from "react"
import moment from 'moment'
import axios from "axios"
import xml2json from '@hendt/xml2json';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const getData = async () => {
      try {

        const test1 = await fetch("https://cors-proxy-navy-seven.vercel.app/", { headers: { 'my-url': "meteo.aeroklubluhacovice.cz:8081/xml.xml" }})
        const test = await axios.get(`https://cors-proxy-git-main-koutnyjiri.vercel.app/`, { headers: { "my-url": "meteo.aeroklubluhacovice.cz:8081/xml.xml" }})

        console.log('test1 output')
        console.log(test1)
        console.log('test output')
        console.log(test)

        const response = await axios.get(
          `meteo.aeroklubluhacovice.cz:8081/xml.xml`
        );




        const json = xml2json(response.data);
        const datetime = moment(json.wario.date + " " + json.wario.time, "YYYY-M-D h:m:s")

        const output = {
          datetime: datetime.format("DD-MM-YYYY hh:mm:ss"),
          rwy: 20,
          temperature: json.wario.input.sensor.filter(x => x.type === 'temperature')[0]?.value + '°' + json.wario.degree,
          dewPoint: json.wario.input.sensor.filter(x => x.type === 'dew_point')[0]?.value + '°' + json.wario.degree,
          pressure: json.wario.input.sensor.filter(x => x.type === 'pressure')[0]?.value + json.wario.pressure,
          windDirection: json.wario?.input?.sensor?.filter(x => x.type === 'wind_direction')[0]?.value + '°',
          windSpeed: Math.round(json.wario?.input?.sensor?.filter(x => x.type === 'wind_speed')[0]?.value * 1.9438452) + "kt",
          windGust: Math.round(json.wario?.input?.sensor?.filter(x => x.type === 'wind_gust')[0]?.value * 1.9438452) + "kt",
          windDirectionRaw: json.wario?.input?.sensor?.filter(x => x.type === 'wind_direction')[0]?.value,
          civilStart: json.wario?.variable?.civstart,
          civilEnd: json.wario?.variable?.civend,
        }

        setData(output)
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  return (
    <div>
      {loading && <div>A moment please...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}

      <div className="mockup-code">
        <pre data-prefix="$">LKLU radio <code>125,285</code></pre>
        <pre data-prefix=">" className="text-warning">Time: <code>{!loading && data.datetime}</code></pre>
        <pre data-prefix=">" className="text-warning">Rwy: <code>{!loading && pad(data.rwy / 10, 2) + "/" + pad((data.rwy + 180) / 10, 2)}</code></pre>
        <pre data-prefix=">" className="text-success">QNH: <code>{!loading && data.pressure}</code></pre>
        <pre data-prefix=">" className="text-warning">Temp/Dew point: <code>{!loading && data.temperature + "/" + data.dewPoint}</code></pre>
        <pre data-prefix=">" className="text-success">Wind: <code>{!loading && data.windDirection + "/" + data.windSpeed}</code></pre>
        {(!loading && data.windSpeed !== data.windGust) && <pre data-prefix=">" className="text-success">Wind Gust: <code>{!loading && data.windGust}</code></pre>}
        <pre data-prefix=">" className="text-success">Civil twilight: <code>{!loading && data.civilStart + "-" + data.civilEnd}</code></pre>
      </div>

    </div>
  );
}

export default App;
