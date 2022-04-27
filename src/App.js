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
        accessToken:
          "pk.eyJ1IjoibWFuaG5pbmg5MSIsImEiOiJjazl3ODMyZjMwNzU0M2txNmJnMXh1cDk2In0.XHVqDEN-v2YVftKn5IAwsg",
      }
    ).addTo(map);
    map.addEventListener("click", onMapClick);
  }, []);

  const onMapClick = (e) => {
    let huongGio = "";
    let tocdoGio = "";
    let nhietdo = "";
    if (layerWind) {
      const gridValue = layerWind.field.interpolatedValueAt(
        e.latlng.lng,
        e.latlng.lat
      );
      if (gridValue && !isNaN(gridValue.u) && !isNaN(gridValue.v)) {
        const direction = getDirection(gridValue.u, gridValue.v, "bearingCCW");
        huongGio = "Hướng gió: " + direction.toFixed(2) + "°";
        const speed = getSpeed(gridValue.u, gridValue.v, "m/s");
        tocdoGio = "Tốc độ gió: " + speed.toFixed(2) + " m/s";
      }
    }
    if (layerTems) {
      $.ajax({
        url: `http://103.27.239.181:8080/wms`,
        method: "GET",
        async: false,
        dataType: "html",
        data: {
          layers: "demo/t2m",
          QUERY_LAYERS: "demo/t2m",
          styles: "default-scalar/seq-Heat-inv",
          INFO_FORMAT: "text/html",
          FEATURE_COUNT: 5,
          REQUEST: "GetFeatureInfo",
          VERSION: "1.1.1",
          SRS: "EPSG:4326",
          BBOX: "97.617044,4.054536,126.355681,27.045445",
          HEIGHT: 600,
          WIDTH: 750,
          X: e.containerPoint.x,
          Y: e.containerPoint.y,
        },
        success: function (xml) {
          nhietdo = $(xml).find("tbody td:last");
        },
      });
    }
    if (huongGio || tocdoGio) {
      console.log(nhietdo, "nhietdo");
      const popup = new L.Popup({ maxWidth: 500 });
      popup.setLatLng(e.latlng);
      popup.setContent(`
    <p>${huongGio}</p>
    <p>${tocdoGio}</p>
    ${nhietdo ? `<p>Nhiệt độ: ${nhietdo?.html()} °K</p>` : ""}
    `);
      map.openPopup(popup);
    }
  };

  const loadData = (time) => () => {
    if (layerWind) map.removeLayer(layerWind);
    if (layerTems) map.removeLayer(layerTems);
    layerWind = null;
    layerTems = null;
    layerTems = L.tileLayer.wms(`http://103.27.239.181:8080/wms`, {
      layers: "demo/t2m",
      styles: "default-scalar/seq-Heat-inv",
      transparent: true,
      format: "image/png",
      crs: L.CRS.EPSG4326,
      TIME: moment(time, "DDMMYYYYHHmmss").format("YYYY-MM-DDTHH:mm:ss"),
      COLORSCALERANGE: "263.4,306.7",
      NUMCOLORBANDS: 250,
      BGCOLOR: "transparent",
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
          <input
            type="radio"
            name="wind"
            onClick={loadData("25012022120000")}
          />{" "}
          {moment("25012022120000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("25012022180000")}
          />{" "}
          {moment("25012022180000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("26012022000000")}
          />{" "}
          {moment("26012022000000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("26012022060000")}
          />{" "}
          {moment("26012022060000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("26012022120000")}
          />{" "}
          {moment("26012022120000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("26012022180000")}
          />{" "}
          {moment("26012022180000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("27012022000000")}
          />{" "}
          {moment("27012022000000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("27012022060000")}
          />{" "}
          {moment("27012022060000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("27012022120000")}
          />{" "}
          {moment("27012022120000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("27012022180000")}
          />{" "}
          {moment("27012022180000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("28012022000000")}
          />{" "}
          {moment("28012022000000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("28012022060000")}
          />{" "}
          {moment("28012022060000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
        <div>
          <input
            type="radio"
            name="wind"
            onClick={loadData("28012022120000")}
          />{" "}
          {moment("28012022120000", "DDMMYYYYHHmmss").format(
            "DD/MM/YYYY HH:mm:ss"
          )}
        </div>
      </div>
    </>
  );
}

export default App;
