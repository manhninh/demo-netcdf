import logo from "./logo.svg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import $ from "jquery";
import "leaflet-velocity";
import { WindLayer } from "leaflet-wind";

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
        // var velocityLayer = L.velocityLayer({
        //   displayValues: true,
        //   displayOptions: {
        //     velocityType: "GBR Wind",
        //     position: "bottomleft",
        //     emptyString: "No wind data",
        //     showCardinal: true,
        //   },
        //   data: data,
        //   maxVelocity: 10,
        // });
        // layerControl.addOverlay(velocityLayer, `Gió ${index}`);

        const velocityScale = [0.1, 0.2, 0.3, 0.4, 0.5];
        const windLayer = new WindLayer("wind", data, {
          // windOptions: {
          //   // colorScale: (m) => {
          //   //   // console.log(m);
          //   //   return '#fff';
          //   // },
          //   colorScale: [
          //     "rgb(36,104, 180)",
          //     "rgb(60,157, 194)",
          //     "rgb(128,205,193 )",
          //     "rgb(151,218,168 )",
          //     "rgb(198,231,181)",
          //     "rgb(238,247,217)",
          //     "rgb(255,238,159)",
          //     "rgb(252,217,125)",
          //     "rgb(255,182,100)",
          //     "rgb(252,150,75)",
          //     "rgb(250,112,52)",
          //     "rgb(245,64,32)",
          //     "rgb(237,45,28)",
          //     "rgb(220,24,32)",
          //     "rgb(180,0,35)",
          //   ],
          //   // velocityScale: 1 / 20,
          //   // paths: 5000,
          //   // frameRate: 16,
          //   // maxAge: 60,
          //   // globalAlpha: 0.9,
          //   // velocityScale: () => {
          //   //   return velocityScale[map.getZoom() - 5] * 0.1 || 0.1;
          //   // },
          //   // // paths: 10000,
          //   // paths: 1000,
          // },
          windOptions: {
            // colorScale: (m) => {
            //   // console.log(m);
            //   return '#fff';
            // },
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
            // velocityScale: 1 / 20,
            // paths: 5000,
            frameRate: 16,
            maxAge: 60,
            globalAlpha: 0.9,
            velocityScale: 1 / 500,
            // paths: 880092,
            generateParticleOption: true,
            paths: () => {
              // can be number or function
              const zoom = map.getZoom();
              return zoom * 1000;
            },
          },
        });
        layerControl.addOverlay(windLayer, `Gió ${index}`);
        // map.addLayer(windLayer);
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
    var URL = `http://103.27.239.181:8080/geoserver/SMAP/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image/jpeg&TRANSPARENT=true&QUERY_LAYERS=SMAP:t&STYLES&LAYERS=SMAP:t&exceptions=application/vnd.ogc.se_inimage&INFO_FORMAT=text/html&FEATURE_COUNT=50&X=${X}&Y=${Y}&SRS=EPSG:4326&WIDTH=${WIDTH}&HEIGHT=${HEIGHT}&BBOX=${BBOX}`;
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
