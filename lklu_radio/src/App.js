import xml2json from "@hendt/xml2json";
import { Analytics } from "@vercel/analytics/react";
import axios from "axios";
import { getPreciseDistance, getRhumbLineBearing } from "geolib";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import "./App.css";
import { Stat } from "./Stat";

function App() {
  const [data, setMeteoData] = useState(null);
  const [geo, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proxy_url = "https://lklu-meteo-proxy.vercel.app/data";

  const metersToFeetRatio = 0.000539956803;
  const LKLU = {
    label: "LKLU",
    latitude: "49° 05' 32\" N",
    longitude: "17° 43' 29\" E",
    frequency: "125,285MHz",
    rwy: "02/20",
    circles: "2200ft",
  };

  const getMeteo = async () => {
    try {
      setMeteoData(parseMeteoJson(await getMeteoJson()));
      setError(null);
    } catch (err) {
      setError(err.message);
      setMeteoData(null);
    } finally {
      setLoading(false);
    }

    function parseMeteoJson(json) {
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

    async function getMeteoJson() {
      const response = await axios.get(proxy_url);

      const json = xml2json(response.data);
      return json;
    }
  };




  function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
      return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
      var arr = ("" + num).split("e");
      var sig = "";
      if (+arr[1] + scale > 0) {
        sig = "+";
      }
      return +(
        Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) +
        "e-" +
        scale
      );
    }
  }



  useEffect(() => {
    var navigationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };
    function navigationSuccess(pos) {
      var crd = pos.coords;
  
      try {
        const distance = roundNumber(
          getPreciseDistance(
            { latitude: crd.latitude, longitude: crd.longitude },
            { latitude: LKLU.latitude, longitude: LKLU.longitude }
          ) * metersToFeetRatio,
          1
        );
  
        const heading = Math.round(
          getRhumbLineBearing(
            { latitude: crd.latitude, longitude: crd.longitude },
            { latitude: LKLU.latitude, longitude: LKLU.longitude }
          )
        );
  
        setGeoData({ heading, distance, value: heading + "°/" + distance + "NM" });
        setError(null);
      } catch (err) {
        setError(err.message);
        setGeoData(null);
      } finally {
        setLoading(false);
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
            navigator.geolocation.getCurrentPosition(navigationSuccess, navigationError, navigationOptions);
          } else if (result.state === "prompt") {
            //If prompt then the user will be asked to give permission
            navigator.geolocation.getCurrentPosition(navigationSuccess, navigationError, navigationOptions);
          } else if (result.state === "denied") {
            //If denied then you have to show instructions to enable location
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, [LKLU]);

  useEffect(() => {
    const intervalCall = setInterval(() => {
      getMeteo();
    }, 10000);
    return () => {
      clearInterval(intervalCall);
    };
  }, []);

  useEffect(() => {
    getMeteo();
  }, []);

  return (
    <div className="p-8 grid place-items-center">
      {loading && (
        <div>
          <div>A moment please...</div>
        </div>
      )}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}
      {!loading && (
        <div className="border stats stats-vertical">
          <Stat
            label={LKLU.label}
            value={LKLU.frequency}
            desc={"RWY " + LKLU.rwy + " Circles " + LKLU.circles}
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
          {geo && <Stat label="HDG/DST" value={geo && geo.value}></Stat>}
        </div>
      )}

      <Analytics />
    </div>
  );
}

export default App;
