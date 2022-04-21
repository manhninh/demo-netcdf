import logo from "./logo.svg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import $ from "jquery";
import "leaflet-velocity";
import "./App.css";

let map = null;

function App() {
  useEffect(() => {
    if (map) return;

    const baseLayer = L.tileLayer(
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
    );
    map = L.map("map", { layers: baseLayer });
    map.setView([21.04549, 105.76257], 6);

    var baseLayers = {
      "Base map": baseLayer,
    };
    var layerControl = L.control.layers(baseLayers);
    layerControl.addTo(map);

    // const tLayer = L.tileLayer
    //   .wms("http://103.27.239.181:8080/geoserver/SMAP/wms", {
    //     format: "image/png",
    //     VERSION: "1.1.1",
    //     tiled: true,
    //     STYLES: "",
    //     LAYERS: "SMAP:t",
    //     exceptions: "application/vnd.ogc.se_inimage",
    //     tilesOrigin: 97.7499973629945 + "," + 4.054536091177027,
    //     transparent: true,
    //   })
    //   .addTo(map);

    // layerControl.addOverlay(tLayer, "Nhiệt độ");

    for (let index = 0; index < 13; index++) {
      $.getJSON(`${process.env.PUBLIC_URL}/wind${index}.json`, function (data) {
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
        layerControl.addOverlay(velocityLayer, `Gió ${index}`);
      });
    }

    map.addEventListener("click", onMapClick);
  }, []);

  const onMapClick = (e) => {
    const popup = new L.Popup({ maxWidth: 400 });
    var BBOX =
      map.getBounds()._southWest.lng +
      "," +
      map.getBounds()._southWest.lat +
      "," +
      map.getBounds()._northEast.lng +
      "," +
      map.getBounds()._northEast.lat;
    var WIDTH = map.getSize().x;
    var HEIGHT = map.getSize().y;
    var X = map.layerPointToContainerPoint(e.layerPoint).x;
    var Y = map.layerPointToContainerPoint(e.layerPoint).y;
    var URL =
      `http://103.27.239.181:8080/geoserver/SMAP/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image/jpeg&TRANSPARENT=true&QUERY_LAYERS=SMAP:t&STYLES&LAYERS=SMAP:t&exceptions=application/vnd.ogc.se_inimage&INFO_FORMAT=text/html&FEATURE_COUNT=50&X=${X}&Y=${Y}&SRS=EPSG:4326&WIDTH=${WIDTH}&HEIGHT=${HEIGHT}&BBOX=${BBOX}`;
    popup.setLatLng(e.latlng);
    popup.setContent(
      "<iframe src='" +
        URL +
        "' width='400' height='100' frameborder='0'></iframe>"
    );
    map.openPopup(popup);
  };

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
