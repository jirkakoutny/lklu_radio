import "./App.css";
import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import xml2json from "@hendt/xml2json";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proxy_url = "https://lklu-meteo-proxy.vercel.app/data";

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(proxy_url);

        const json = xml2json(response.data);
        const datetime = moment.utc(moment(
          json.wario.date + " " + json.wario.time,
          "YYYY-M-D h:m:s"
        ));


        const pressureMin = json.wario.minmax.s.filter(x => x.id === '1008')[0].min
        const pressureMax = json.wario.minmax.s.filter(x => x.id === '1008')[0].max

        const temperatureMin = json.wario.minmax.s.filter(x => x.id === '1006')[0].min
        const temperatureMax = json.wario.minmax.s.filter(x => x.id === '1006')[0].max

        const dewPointMin = json.wario.minmax.s.filter(x => x.id === '1010')[0].min
        const dewPointMax = json.wario.minmax.s.filter(x => x.id === '1010')[0].max

        const windSpeedMin = json.wario.minmax.s.filter(x => x.id === '1003')[0].min
        const windSpeedMax = json.wario.minmax.s.filter(x => x.id === '1003')[0].max

        const windGustMin = json.wario.minmax.s.filter(x => x.id === '1004')[0].min
        const windGustMax = json.wario.minmax.s.filter(x => x.id === '1004')[0].max

        const civilStart = moment.utc(moment(json.wario?.variable?.civstart, "h:m:s"));
        const civilEnd = moment.utc(moment(json.wario?.variable?.civend, "h:m:s"));
        const output = {
          datetime: datetime.format("HH:MM"),
          civilStart: civilStart.format("HH:MM"),
          civilEnd: civilEnd.format("HH:MM"),
          frequency: "125,285 MHz",
          rwy: "02/20",
          circles: "2200 ft",
          temperature: Math.round(
            json.wario.input.sensor.filter((x) => x.type === "temperature")[0]
              ?.value) +
            "°" +
            json.wario.degree,
          temperatureMin: Math.round(temperatureMin),
          temperatureMax: Math.round(temperatureMax),
          dewPoint:
            Math.round(
              json.wario.input.sensor.filter((x) => x.type === "dew_point")[0]
                ?.value) +
            "°" +
            json.wario.degree,
          dewPointMin: Math.round(dewPointMin),
          dewPointMax: Math.round(dewPointMax),
          pressure:
            Math.round(
              json.wario.input.sensor.filter((x) => x.type === "pressure")[0]
                ?.value
            ) + json.wario.pressure,
          pressureMin: Math.round(pressureMin),
          pressureMax: Math.round(pressureMax),
          windDirection:
            Math.round(json.wario?.input?.sensor?.filter(
              (x) => x.type === "wind_direction"
            )[0]?.value) + "°",
          windSpeed:
            Math.round(
              json.wario?.input?.sensor?.filter(
                (x) => x.type === "wind_speed"
              )[0]?.value * 1.9438452
            ) + "kt",
          windSpeedMin: Math.round(windGustMin),
          windSpeedMax: Math.round(windSpeedMax),
          windGust:
            Math.round(
              json.wario?.input?.sensor?.filter(
                (x) => x.type === "wind_gust"
              )[0]?.value * 1.9438452
            ) + "kt",
          windGustMin: Math.round(windGustMin),
          windGustMax: Math.round(windGustMax),
          windDirectionRaw: json.wario?.input?.sensor?.filter(
            (x) => x.type === "wind_direction"
          )[0]?.value,
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

  return (
    <div>
      {loading && <div>A moment please...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}
      <div className="flex flex-col w-full lg:flex-row">
        <div className="grid flex-grow card bg-base-300 rounded-box">
          <div className="mockup-code">
            <pre>
              LKLU radio{" "}
              <code className="text-success">{!loading && data.frequency}</code>{" "}
              <code className="text-warning">
                {!loading && "RWY " + data.rwy}
              </code>
            </pre>
            <pre data-prefix=">">
              UTC:{" "}
              <code className="text-success">{!loading && data.datetime}</code>
            </pre>
            <pre data-prefix=">">
              Civil twilight:{" "}
              <code className="text-warning">
                {!loading && data.civilStart + "-" + data.civilEnd}
              </code>
            </pre>
            <pre data-prefix=">">
              QNH:{" "}
              <code className="text-success">{!loading && data.pressure}</code>
            </pre>
            <pre data-prefix=">">
              Temp/Dew point:{" "}
              <code className="text-success">
                {!loading && data.temperature + "/" + data.dewPoint}
              </code>
            </pre>
            <pre data-prefix=">">
              Wind:{" "}
              <code className="text-success">
                {!loading && data.windDirection + "/" + data.windSpeed}
              </code>
              <code className="text-warning">
                {!loading &&
                  data.windGust !== "" &&
                  " (gusting " + data.windGust + ")"}
              </code>
            </pre>
          </div>
        </div>
        <div className="divider lg:divider-horizontal"></div>
        <div className="grid flex-grow card bg-base-300 rounded-box place-items-center">
          <div className="stats shadow">
            <div className="stats stats-vertical lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">LKLU</div>
                <div className="stat-value">{!loading && data.frequency}</div>
                <div className="stat-desc">{!loading && "RWY " + data.rwy}</div>
                <div className="stat-desc">{!loading && "Circles " + data.circles}</div>
              </div>

              <div className="stat">
                <div className="stat-title">UTC</div>
                <div className="stat-value">{!loading && data.datetime}</div>
                <div className="stat-desc">{!loading && '☉' + data.civilStart + " - ☽" + data.civilEnd}</div>
              </div>

              <div className="stat">
                <div className="stat-title">QNH</div>
                <div className="stat-value">{!loading && data.pressure}</div>
                <div className="stat-desc">{!loading && '↓' + data.pressureMin + ' - ↑' + data.pressureMax}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Temperature</div>
                <div className="stat-value">{!loading && data.temperature + "/" + data.dewPoint}</div>
                <div className="stat-desc">{!loading && '↓' + data.temperatureMin + "/" + data.dewPointMin + " - ↑" + data.temperatureMax + "/" + data.dewPointMax}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Wind</div>
                <div className="stat-value">{!loading && data.windDirection + "/" + data.windSpeed}{!loading &&
                  data.windGust !== "" &&
                  " (" + data.windGust + ")"}</div>
                <div className="stat-desc">{!loading && '↓' + data.windSpeedMin + "/" + data.windGustMin + " - ↑" + data.windSpeedMax + "/" + data.windGustMax}</div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
