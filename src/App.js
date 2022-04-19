import logo from "./logo.svg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import $ from "jquery";
import "leaflet-velocity";
import "./App.css";

function App() {
  useEffect(() => {
    if (map) return;
    var map = L.map("map");
    map.setView([21.04549, 105.76257], 6);

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

    L.tileLayer
      .wms("http://103.27.239.181:8080/geoserver/SMAP/wms", {
        format: "image/png",
        VERSION: "1.1.1",
        tiled: true,
        STYLES: "",
        LAYERS: "SMAP:t",
        exceptions: "application/vnd.ogc.se_inimage",
        tilesOrigin: 97.7499973629945 + "," + 4.054536091177027,
        transparent: true,
      })
      .addTo(map);

    $.getJSON(`${process.env.PUBLIC_URL}/wind0.json`, function (data) {
      var velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "GBR Wind",
          position: "bottomleft",
          emptyString: "No wind data",
          showCardinal: true,
        },
        data: data,
        maxVelocity: 10,
      });
      map.addLayer(velocityLayer);
    });
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
      }}
    ></div>
  );
}

export default App;
