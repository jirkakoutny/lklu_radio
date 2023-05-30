import "./App.css";
import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import xml2json from "@hendt/xml2json";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proxy_url = "https://lklu-meteo-proxy.vercel.app/data"

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(proxy_url);

        const json = xml2json(response.data);
        const datetime = moment(
          json.wario.date + " " + json.wario.time,
          "YYYY-M-D h:m:s"
        );

        const civilStart = moment(
          json.wario?.variable?.civstart,
          "h:m:s"
        );
        const civilEnd = moment(
          json.wario?.variable?.civend,
          "h:m:s"
        );
        const output = {
          datetime: datetime.format("DD-MM-YYYY hh:mm:ss"),
          frequency: '125,285 MHz',
          rwy: "02/20",
          temperature:
            json.wario.input.sensor.filter((x) => x.type === "temperature")[0]
              ?.value +
            "°" +
            json.wario.degree,
          dewPoint:
            json.wario.input.sensor.filter((x) => x.type === "dew_point")[0]
              ?.value +
            "°" +
            json.wario.degree,
          pressure:
            Math.round(json.wario.input.sensor.filter((x) => x.type === "pressure")[0]
              ?.value) + json.wario.pressure,
          windDirection:
            json.wario?.input?.sensor?.filter(
              (x) => x.type === "wind_direction"
            )[0]?.value + "°",
          windSpeed:
            Math.round(
              json.wario?.input?.sensor?.filter(
                (x) => x.type === "wind_speed"
              )[0]?.value * 1.9438452
            ) + "kt",
          windGust:
            Math.round(
              json.wario?.input?.sensor?.filter(
                (x) => x.type === "wind_gust"
              )[0]?.value * 1.9438452
            ) + "kt",
          windDirectionRaw: json.wario?.input?.sensor?.filter(
            (x) => x.type === "wind_direction"
          )[0]?.value,
          civilStart: civilStart.format("hh:mm:ss"),
          civilEnd: civilEnd.format("hh:mm:ss")
        };

        setData(output);
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
        <pre>
          LKLU radio <code className="text-success">{!loading && data.frequency}</code> <code className="text-warning">{!loading && "RWY " + data.rwy}</code>
        </pre>
        <pre data-prefix=">">
          Time: <code className="text-success">{!loading && data.datetime}</code>
        </pre>
        <pre data-prefix=">">
          Civil twilight:{" "}
          <code className="text-warning">{!loading && data.civilStart + "-" + data.civilEnd}</code>
        </pre>        
        <pre data-prefix=">">
          QNH: <code className="text-success">{!loading && data.pressure}</code>
        </pre>
        <pre data-prefix=">">
          Temp/Dew point:{" "}
          <code className="text-success">{!loading && data.temperature + "/" + data.dewPoint}</code>
        </pre>
        <pre data-prefix=">">
          Wind:{" "}
          <code className="text-success">{!loading && data.windDirection + "/" + data.windSpeed}</code><code className="text-warning">{!loading && data.windGust !== "" && " (gusting " + data.windGust + ")"}</code>
        </pre>
      </div>
    </div>
  );
}

export default App;
