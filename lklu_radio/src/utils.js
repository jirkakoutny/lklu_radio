import moment from "moment-timezone";
import { getPreciseDistance, getRhumbLineBearing } from "geolib";
import { metersToFeetRatio } from "./config";

const msToKnotsRatio = 1.9438452;

export function roundNumber(num, scale) {
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

export function parseMeteoJson(json) {
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
  const civilEnd = moment.utc(moment(json.wario?.variable?.civend, "h:m:s"));

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
        json.wario.input.sensor.filter((x) => x.type === "dew_point")[0]?.value
      ) +
      "°" +
      json.wario.degree,
    dewPointMin: Math.round(dewPointMin),
    dewPointMax: Math.round(dewPointMax),
    pressure:
      Math.round(
        json.wario.input.sensor.filter((x) => x.type === "pressure")[0]?.value
      ) + json.wario.pressure,
    pressureMin: Math.round(pressureMin),
    pressureMax: Math.round(pressureMax),
    windDirection:
      Math.round(
        json.wario?.input?.sensor?.filter((x) => x.type === "wind_direction")[0]
          ?.value
      ) + "°",
    windSpeed:
      Math.round(
        json.wario?.input?.sensor?.filter((x) => x.type === "wind_speed")[0]
          ?.value * msToKnotsRatio
      ) + "kts",
    windSpeedMin: Math.round(windSpeedMin),
    windSpeedMax: Math.round(windSpeedMax),
    windGust:
      Math.round(
        json.wario?.input?.sensor?.filter((x) => x.type === "wind_gust")[0]
          ?.value * msToKnotsRatio
      ) + "kts",
    windGustMin: Math.round(windGustMin),
    windGustMax: Math.round(windGustMax),
    windDirectionRaw: json.wario?.input?.sensor?.filter(
      (x) => x.type === "wind_direction"
    )[0]?.value,
  };
  return output;
}

export function computeNavigation(crd, homeAirfield) {
  const distance = roundNumber(
    getPreciseDistance(
      { latitude: crd.latitude, longitude: crd.longitude },
      { latitude: homeAirfield.latitude, longitude: homeAirfield.longitude }
    ) * metersToFeetRatio,
    1
  );
  const heading = Math.round(
    getRhumbLineBearing(
      { latitude: crd.latitude, longitude: crd.longitude },
      { latitude: homeAirfield.latitude, longitude: homeAirfield.longitude }
    )
  );
  const speed = Math.round(crd.speed * msToKnotsRatio);
  return { heading, distance, speed };
}
