import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import $ from "jquery";
import { WindLayer } from "leaflet-wind";
import moment from "moment";
import "leaflet-webgl-heatmap";
import "leaflet-webgl-heatmap/src/webgl-heatmap/webgl-heatmap";
import { getDirection, getSpeed } from "./calculatorWind";

let map = null;
let layerWind = null;
let layerTems = null;

function App() {
  useEffect(() => {
    if (map) return;
    map = L.map("map");
    map.setView([21.04549, 105.76257], 5);
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFuaG5pbmg5MSIsImEiOiJjazl3ODMyZjMwNzU0M2txNmJnMXh1cDk2In0.XHVqDEN-v2YVftKn5IAwsg",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 12,
        id: "mapbox/dark-v10",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: "pk.eyJ1IjoibWFuaG5pbmg5MSIsImEiOiJjazl3ODMyZjMwNzU0M2txNmJnMXh1cDk2In0.XHVqDEN-v2YVftKn5IAwsg",
      }
    ).addTo(map);
    map.on("click", onMapClick);
  }, []);

  const onMapClick = async (e) => {
    let huongGio = "";
    let tocdoGio = "";
    let nhietdo = "";
    if (layerWind) {
      const gridValue = layerWind.field.interpolatedValueAt(e.latlng.lng, e.latlng.lat);
      if (gridValue && !isNaN(gridValue.u) && !isNaN(gridValue.v)) {
        const direction = getDirection(gridValue.u, gridValue.v, "bearingCCW");
        huongGio = "Hướng gió: " + direction.toFixed(2) + "°";
        const speed = getSpeed(gridValue.u, gridValue.v, "m/s");
        tocdoGio = "Tốc độ gió: " + speed.toFixed(2) + " m/s";
      }
    }
    if (layerTems) {
      console.log(layerTems, "layerTems");
      const body = {
        layers: layerTems.wmsParams.layers,
        QUERY_LAYERS: layerTems.wmsParams.layers,
        styles: "",
        INFO_FORMAT: "application/json",
        FEATURE_COUNT: 5,
        REQUEST: "GetFeatureInfo",
        VERSION: "1.1.1",
        SRS: "EPSG:4326",
        BBOX: "97.617044,4.054536,126.355681,27.045445",
        HEIGHT: map.getSize().y,
        WIDTH: map.getSize().x,
        X: e.containerPoint.x,
        Y: e.containerPoint.y,
      };
      let queryString = "";
      if (body)
        queryString = `?${Object.keys(body)
          .map((key) => `${key}=${body[key] || ""}`)
          .join("&")}`;
      const response = await fetch(`http://103.237.147.62:8080/geoserver/smap_netcdf/wms${queryString}`, {
        method: "GET",
      });
      const data = await response.json();
      console.log(data, "data");
      nhietdo = Number(data.features[0].properties.t2m).toFixed(0);
    }
      $("#bottom").html(`
      <p>${huongGio}</p>
      <p>${tocdoGio}</p>
      <p>Nhiệt độ: ${nhietdo} °K</p>
      `
      );
  };

  const loadData = (time, level) => () => {
    if (layerWind) map.removeLayer(layerWind);
    if (layerTems) map.removeLayer(layerTems);
    layerWind = null;
    layerTems = null;
    layerTems = L.tileLayer.wms(`http://103.237.147.62:8080/geoserver/smap_netcdf/wms`, {
      format: "image/png",
      version: "1.1.1",
      tiled: true,
      styles: "",
      layers: `smap_netcdf:time${level}`,
      exceptions: "application/vnd.ogc.se_inimage",
      transparent: true,
    });

    map.addLayer(layerTems);

    $.getJSON(`${process.env.PUBLIC_URL}/wind_${time}.json`, function (data) {
      layerWind = new WindLayer("wind", data, {
        windOptions: {
          colorScale: [
            "rgb(36,104, 180)",
            "rgb(60,157, 194)",
            "rgb(128,205,193 )",
            "rgb(151,218,168 )",
            "rgb(198,231,181)",
            "rgb(238,247,217)",
            "rgb(255,238,159)",
            "rgb(252,217,125)",
            "rgb(255,182,100)",
            "rgb(252,150,75)",
            "rgb(250,112,52)",
            "rgb(245,64,32)",
            "rgb(237,45,28)",
            "rgb(220,24,32)",
            "rgb(180,0,35)",
          ],
          frameRate: 16,
          maxAge: 60,
          globalAlpha: 0.9,
          velocityScale: 0.002,
          generateParticleOption: true,
          paths: () => {
            const zoom = map.getZoom();
            return zoom * 1000;
          },
        },
      });
      console.log(layerWind, "layerWind");
      map.addLayer(layerWind);
    });
  };

  return (
    <>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100vh",
        }}
      />
      <div
      id="bottom"
        style={{
          position: "fixed",
          bottom:0,
          left: 0,
          zIndex: 1000,
          background: "#FFF",
          display: "flex",
          flexDirection: "column",
          padding: 10,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 1000,
          background: "#FFF",
          display: "flex",
          flexDirection: "column",
          padding: 10,
        }}
      >
        <div>
          <input type="radio" name="wind" onClick={loadData("25012022120000", 0)} />{" "}
          {moment("25012022120000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("25012022180000", 1)} />{" "}
          {moment("25012022180000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("26012022000000", 2)} />{" "}
          {moment("26012022000000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("26012022060000", 3)} />{" "}
          {moment("26012022060000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("26012022120000", 4)} />{" "}
          {moment("26012022120000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("26012022180000", 5)} />{" "}
          {moment("26012022180000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("27012022000000", 6)} />{" "}
          {moment("27012022000000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("27012022060000", 7)} />{" "}
          {moment("27012022060000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("27012022120000", 8)} />{" "}
          {moment("27012022120000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("27012022180000", 9)} />{" "}
          {moment("27012022180000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("28012022000000", 10)} />{" "}
          {moment("28012022000000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("28012022060000", 11)} />{" "}
          {moment("28012022060000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
        <div>
          <input type="radio" name="wind" onClick={loadData("28012022120000", 12)} />{" "}
          {moment("28012022120000", "DDMMYYYYHHmmss").format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>
    </>
  );
}

export default App;
