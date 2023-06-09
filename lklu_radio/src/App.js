import "./App.css";
import { useState, useEffect } from "react";
import moment from "moment-timezone";
import axios from "axios";
import xml2json from "@hendt/xml2json";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proxy_url = "https://lklu-meteo-proxy.vercel.app/data";

  const getData = async () => {
    try {
      setData(parseJsonData(await getJsonData()));
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }

    function parseJsonData(json) {
      const datetime = moment(
        json.wario.date + " " + json.wario.time,
        "YYYY-M-D h:m:s"
      )
        .tz("Europe/Prague")
        .tz("UTC");

      const minmaxData = json.wario?.minmax?.s;

      const pressureMin = minmaxData.filter((x) => x.id === "1008")[0].min;
      const pressureMax = minmaxData.filter((x) => x.id === "1008")[0].max;

      const temperatureMin = minmaxData.filter((x) => x.id === "1006")[0].min;
      const temperatureMax = minmaxData.filter((x) => x.id === "1006")[0].max;

      const dewPointMin = minmaxData.filter((x) => x.id === "1010")[0].min;
      const dewPointMax = minmaxData.filter((x) => x.id === "1010")[0].max;

      const windSpeedMin = minmaxData.filter((x) => x.id === "1003")[0].min;
      const windSpeedMax = minmaxData.filter((x) => x.id === "1003")[0].max;

      const windGustMin = minmaxData.filter((x) => x.id === "1004")[0].min;
      const windGustMax = minmaxData.filter((x) => x.id === "1004")[0].max;

      const civilStart = moment.utc(
        moment(json.wario?.variable?.civstart, "h:m:s")
      );
      const civilEnd = moment.utc(
        moment(json.wario?.variable?.civend, "h:m:s")
      );

      const output = {
        datetime: datetime.format("HH:mm"),
        civilStart: civilStart.format("HH:mm"),
        civilEnd: civilEnd.format("HH:mm"),
        frequency: "125,285 MHz",
        rwy: "02/20",
        circles: "2200ft",
        temperature:
          Math.round(
            json.wario.input.sensor.filter((x) => x.type === "temperature")[0]
              ?.value
          ) +
          "°" +
          json.wario.degree,
        temperatureMin: Math.round(temperatureMin),
        temperatureMax: Math.round(temperatureMax),
        dewPoint:
          Math.round(
            json.wario.input.sensor.filter((x) => x.type === "dew_point")[0]
              ?.value
          ) +
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
          Math.round(
            json.wario?.input?.sensor?.filter(
              (x) => x.type === "wind_direction"
            )[0]?.value
          ) + "°",
        windSpeed:
          Math.round(
            json.wario?.input?.sensor?.filter((x) => x.type === "wind_speed")[0]
              ?.value * 1.9438452
          ) + "kts",
        windSpeedMin: Math.round(windSpeedMin),
        windSpeedMax: Math.round(windSpeedMax),
        windGust:
          Math.round(
            json.wario?.input?.sensor?.filter((x) => x.type === "wind_gust")[0]
              ?.value * 1.9438452
          ) + "kts",
        windGustMin: Math.round(windGustMin),
        windGustMax: Math.round(windGustMax),
        windDirectionRaw: json.wario?.input?.sensor?.filter(
          (x) => x.type === "wind_direction"
        )[0]?.value,
      };
      return output;
    }

    async function getJsonData() {
      const response = await axios.get(proxy_url);

      const json = xml2json(response.data);
      return json;
    }
  };

  useEffect(() => {
    const intervalCall = setInterval(() => {
      getData();
    }, 10000);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="grid place-items-center">
      {loading && <div>A moment please...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}
      {!loading && (
        <div className="border stats stats-vertical lg:stats-horizontal">
          <div className="stat">
            <div className="stat-title">LKLU</div>
            <div className="stat-value">{data.frequency}</div>
            <div className="stat-desc">
              {!loading && "RWY " + data.rwy + " Circles " + data.circles}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">UTC</div>
            <div className="stat-value">{data.datetime}</div>
            <div className="stat-desc">
              {"☉" + data.civilStart + " - ☽" + data.civilEnd}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">QNH</div>
            <div className="stat-value">{data.pressure}</div>
            <div className="stat-desc">
              {"↓" + data.pressureMin + " - ↑" + data.pressureMax}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Temperature/Dew point</div>
            <div className="stat-value">
              {data.temperature + "/" + data.dewPoint}
            </div>
            <div className="stat-desc">
              {"↓" +
                data.temperatureMin +
                "/" +
                data.dewPointMin +
                " - ↑" +
                data.temperatureMax +
                "/" +
                data.dewPointMax}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Wind/Gust</div>
            <div className="stat-value">
              {data.windDirection + "/" + data.windSpeed}
              {data.windGust !== "" && " (" + data.windGust + ")"}
            </div>
            <div className="stat-desc">
              {"↓" +
                data.windSpeedMin +
                "/" +
                data.windGustMin +
                " - ↑" +
                data.windSpeedMax +
                "/" +
                data.windGustMax}
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
}

export default App;
