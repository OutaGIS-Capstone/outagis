import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import "@arcgis/core/assets/esri/themes/light/main.css";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Point, Polygon } from "@arcgis/core/geometry";
import { SimpleFillSymbol, SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import esriConfig from "@arcgis/core/config";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX";

const HomePage: React.FC = () => {
  const [view, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);

  useEffect(() => {
    const webMap = new WebMap({
      portalItem: { id: "65b663af59944a2dac3834f34d48b9c9" },
    });

    const mapView = new MapView({ container: "mapViewDiv", map: webMap });

    const layer = new GraphicsLayer();
    webMap.add(layer);

    setGraphicsLayer(layer);
    setView(mapView);

    return () => {
      mapView.destroy();
    };
  }, []);

  useEffect(() => {
    if (!graphicsLayer || !view) return;
  
    const fetchOutages = async () => {
      try {
        const response = await fetch(
          "https://ceu2tpg6ok.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_all_outages"
        );
        const data = await response.json();
  
        graphicsLayer.removeAll();
        data.forEach((outage: any) => {
          let newGraphic;
  
          if (outage.geojson?.geometry?.type === "Point") {
            const [longitude, latitude] = outage.geojson.geometry.coordinates;
            console.log("Point coordinates:", { longitude, latitude });
  
            const point = new Point({ longitude, latitude });
            const markerSymbol = new SimpleMarkerSymbol({
              color: [255, 0, 0],
              size: 10,
              outline: { color: [255, 255, 255], width: 1 },
            });
  
            newGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
          } else if (outage.geojson?.geometry?.type === "Polygon") {
            let polygonCoords = outage.geojson.geometry.coordinates;
  
            if (Array.isArray(polygonCoords[0][0])) {
              polygonCoords = polygonCoords[0];
            }
  
            const polygon = new Polygon({
              rings: polygonCoords,
              spatialReference: { wkid: 4326 },
            });
  
            const fillSymbol = new SimpleFillSymbol({
              color: [255, 0, 0, 0.3],
              outline: { color: [255, 0, 0], width: 2 },
            });
  
            newGraphic = new Graphic({ geometry: polygon, symbol: fillSymbol });
          }
  
          if (newGraphic) {
            graphicsLayer.add(newGraphic);
          }
        });
  
        view.goTo({
          extent: {
            xmin: -140.05,
            ymin: 41.3,
            xmax: -114.03,
            ymax: 90.0,
            spatialReference: { wkid: 4326 },
          },
        });
      } catch (error) {
        console.error("Error fetching outages:", error);
      }
    };
  
    fetchOutages();
  }, [graphicsLayer, view]);
  

  return (
    <Box sx={{ width: "100%", height: "100vh", marginTop: "80px" }}>
      <div id="mapViewDiv" style={{ width: "100%", height: "90%" }}></div>
    </Box>
  );
};

export default HomePage;
