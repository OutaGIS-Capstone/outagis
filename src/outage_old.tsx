import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAdmin } from "./AdminContext.tsx";
import "@arcgis/core/assets/esri/themes/light/main.css";
import Map from "@arcgis/core/Map";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Point, Polygon } from "@arcgis/core/geometry";
import { SimpleFillSymbol, SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import Sketch from "@arcgis/core/widgets/Sketch";
import esriConfig from "@arcgis/core/config";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX"; // Replace with your API key

const Outage: React.FC = () => {
  const { isAdmin } = useAdmin(); // Check if user is an admin
  const { outageId } = useParams<{ outageId: string }>(); // Get outage ID from URL
  const [view, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [graphic, setGraphic] = useState<Graphic | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {

    // Fetch outage data dynamically
    /*
    const fetchOutageData = async () => {
      try {
        const response = await fetch(`https://your-api-url.com/outages/${outageId}`);
        if (response.ok) {
          const data = await response.json();
          setOutageData(data);
        } else {
          console.error("Failed to fetch outage data");
        }
      } catch (error) {
        console.error("Error fetching outage data:", error);
      }
    };
    
    fetchOutageData();
    */

    const staticOutage = {
      location: {
        type: "Polygon",
        coordinates: [
          [
            [-122.0327588924444, 49.25916086508886],
            [-122.16231653290964, 49.1402821531548],
            [-121.89217506981198, 49.08073562027582],
            [-121.69094724525937, 49.17453410365326],
            [-121.90595779752107, 49.28434083176134],
            [-122.0327588924444, 49.25916086508886],
          ],
        ],
      },
      type: "Polygon",
      
    };


    const secondOutage = {
        location: {
            type: "Point",
            coordinates: [
                -115.0327588924444, 47.25916086508886
            ]
        }
    }

     const webMap = new WebMap({
      portalItem: {
        id: "65b663af59944a2dac3834f34d48b9c9", // Replace with your actual ArcGIS Online Web Map Item ID
      },
    });

    const mapView = new MapView({
      container: "mapViewDiv",
      map: webMap,
    });

    const layer = new GraphicsLayer();
    webMap.add(layer);
    setGraphicsLayer(layer);
    setView(mapView);

    const { location, type } = staticOutage;

    let newGraphic;
    if (type === "Point") {
      const point = new Point({
        longitude: location.coordinates[0][0],
        latitude: location.coordinates[0][1],
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 0, 0],
        size: 10,
        outline: { color: [255, 255, 255], width: 1 },
      });

      newGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
    } else if (type === "Polygon") {
      const polygon = new Polygon({
        rings: location.coordinates,
        spatialReference: { wkid: 4326 },
      });

      const fillSymbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.3],
        outline: { color: [255, 0, 0], width: 2 },
      });

      newGraphic = new Graphic({ geometry: polygon, symbol: fillSymbol });
    }

    layer.add(newGraphic);
    setGraphic(newGraphic);
    mapView.goTo(newGraphic);

    return () => {
      mapView.destroy();
    };
  }, []);

  const enableEditing = () => {
    if (isAdmin && view && graphicsLayer) {
      const sketch = new Sketch({
        view,
        layer: graphicsLayer,
        availableCreateTools: [],
        updateOnGraphicClick: true,
      });

      view.ui.add(sketch, "top-right");
    }
  };

  const saveOutage = async () => {
    if (!graphic) return;

    const geometry = graphic.geometry;
    const outageUpdate = {
      outage_id: outageId,
      user_id: 2, // Replace with actual user ID from context/auth
      description: "Updated outage area",
      location: {
        type: geometry.type,
        coordinates: geometry.type === "point" ? [[geometry.longitude, geometry.latitude]] : geometry.rings,
      },
      active: true,
    };

    try {
      const response = await fetch("https://mr7z4ab9da.execute-api.ca-central-1.amazonaws.com/default/outagis-modify_outage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outageUpdate),
      });

      if (response.ok) {
        setShowSnackbar(true);
      } else {
        console.error("Failed to update outage.");
      }
    } catch (error) {
      console.error("Error updating outage:", error);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", marginTop:"90px" }}>
      <div id="mapViewDiv" style={{ width: "100%", height: "80%", marginTop: "50px" }}></div>
      {isAdmin && (
        <>
          <Button onClick={enableEditing} variant="contained" color="primary" sx={{ margin: "20px" }}>
            Edit Outage
          </Button>
          <Button onClick={saveOutage} variant="contained" color="secondary" sx={{ margin: "20px" }}>
            Save Changes
          </Button>
        </>
      )}
      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          Outage updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Outage;
