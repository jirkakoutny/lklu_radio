import xml2json from "@hendt/xml2json";
import { Analytics } from "@vercel/analytics/react";
import axios from "axios";

import { useEffect, useState } from "react";
import "./App.css";
import { Stat } from "./components/Stat";
import { computeNavigation, parseMeteoJson } from "./utils";
import { navigationOptions } from "./config";
import { LKLU as homeAirfield } from "./config";

function App() {
  const [data, setMeteoData] = useState(null);
  const [geo, setGeoData] = useState(null);
  const [error, setError] = useState(null);

  const proxy_url = "https://lklu-meteo-proxy.vercel.app/data";

  const getMeteo = async () => {
    try {
      setMeteoData(parseMeteoJson(await getMeteoJson()));
      setError(null);
    } catch (err) {
      setError(err.message);
      setMeteoData(null);
    } finally {
    }

    async function getMeteoJson() {
      const response = await axios.get(proxy_url);

      const json = xml2json(response.data);
      return json;
    }
  };

  const getGeo = async () => {
    function navigationSuccess(pos) {
      var crd = pos.coords;

      try {
        const { heading, distance, speed } = computeNavigation(
          crd,
          homeAirfield
        );

        setGeoData({
          heading,
          distance,
          speed,
          value: heading + "°/" + distance + "NM",
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        setGeoData(null);
      } finally {
      }
    }
    function navigationError(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "granted") {
            //If granted then you can directly call your function here
            navigator.geolocation.getCurrentPosition(
              navigationSuccess,
              navigationError,
              navigationOptions
            );
          } else if (result.state === "prompt") {
            //If prompt then the user will be asked to give permission
            navigator.geolocation.getCurrentPosition(
              navigationSuccess,
              navigationError,
              navigationOptions
            );
          } else if (result.state === "denied") {
            //If denied then you have to show instructions to enable location
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    const intervalCall = setInterval(() => {
      getMeteo();
    }, 10000);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  useEffect(() => {
    const intervalCall = setInterval(() => {
      getGeo();
    }, 3000);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  useEffect(() => {
    getMeteo();
    getGeo();
  }, []);

  return (
    <div className="p-8 grid place-items-center">
      {error && <div>{`There is a problem fetching the data - ${error}`}</div>}
      {data && (
        <div className="border stats stats-vertical">
          <Stat
            label={homeAirfield.label}
            value={homeAirfield.frequency}
            desc={
              "RWY " + homeAirfield.rwy + " Circles " + homeAirfield.circles
            }
          />
          <Stat
            label="UTC"
            value={data.datetime}
            desc={"☉" + data.civilStart + " - ☽" + data.civilEnd}
          />
          <Stat
            label="QNH"
            value={data.pressure}
            desc={"↓" + data.pressureMin + " - ↑" + data.pressureMax}
          />
          <Stat
            label="Temperature/Dew point"
            value={data.temperature + "/" + data.dewPoint}
            desc={
              "↓" +
              data.temperatureMin +
              "/" +
              data.dewPointMin +
              " - ↑" +
              data.temperatureMax +
              "/" +
              data.dewPointMax
            }
          />
          <Stat
            label="Wind/Gust"
            value={
              data.windDirection +
              "/" +
              data.windSpeed +
              (data.windGust !== "" && " (" + data.windGust + ")")
            }
            desc={
              "↓" +
              data.windSpeedMin +
              "/" +
              data.windGustMin +
              " - ↑" +
              data.windSpeedMax +
              "/" +
              data.windGustMax
            }
          />
          {geo && (
            <Stat
              label="HDG/DST"
              value={geo && geo.value}
              desc={
                geo &&
                geo.speed !== null &&
                geo.speed !== 0 &&
                !isNaN(geo.speed) &&
                "GS " + geo.speed + "kts"
              }
            ></Stat>
          )}
        </div>
      )}

      <Analytics />
    </div>
  );
}

export default App;
