import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import "@arcgis/core/assets/esri/themes/light/main.css";
import WebMap from "@arcgis/core/WebMap";
import { Point, Polygon } from "@arcgis/core/geometry";
import { SimpleFillSymbol, SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";


esriConfig.apiKey = "";


const Outage: React.FC = () => {
  const { outageId } = useParams<{ outageId: string }>();

  useEffect(() => {
    const fetchOutageData = async () => {
      try {
        // Fetch outage data based on outageId
        const response = await fetch(https://brrj1peht3.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outage_by_id/${outageId});
        const outage = await response.json();

        const { location, type } = outage;

        // Initialize the map view and container
        const mapView = new MapView({
          container: "mapViewDiv",
          map: new WebMap({
            portalItem: { id: "5e4b2da8a9a04c098eceb07181b09c82" },
          }),
        });

        // Create graphic based on geometry type
        let graphic;
        if (type === "Point") {
          // If the outage location is a point
          const point = new Point({
            longitude: location.coordinates[0][0],
            latitude: location.coordinates[0][1],
          });

          const markerSymbol = new SimpleMarkerSymbol({
            color: [255, 0, 0], // Red color
            size: 10,
            outline: {
              color: [255, 255, 255], // White outline
              width: 1,
            },
          });

          graphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
          });
        } else if (type === "Polygon") {
          // If the outage location is a polygon
          const polygon = new Polygon({
            rings: location.coordinates,
            spatialReference: { wkid: 4326 },
          });

          const fillSymbol = new SimpleFillSymbol({
            color: [255, 0, 0, 0.3], // Red fill with transparency
            outline: {
              color: [255, 0, 0],
              width: 2,
            },
          });

          graphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
          });
        }

        // Add the graphic to the map
        mapView.graphics.add(graphic);

        // Set the map view extent to the graphic
        mapView.goTo(graphic);
      } catch (error) {
        console.error("Error fetching outage data:", error);
      }
    };

    fetchOutageData();
  }, [outageId]);

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <div id="mapViewDiv" style={{ width: "100%", height: "100%" }}></div>
    </Box>
  );
};

export default Outage;