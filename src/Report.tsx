import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import esriConfig from "@arcgis/core/config";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX";


const Report: React.FC = () => {
  const navigate = useNavigate();
  const [, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [outageData, setOutageData] = useState<any[]>([]);

  useEffect(() => {
    const webMap = new WebMap({ portalItem: { id: "65b663af59944a2dac3834f34d48b9c9" } });
    const mapView = new MapView({ container: "mapViewDiv", map: webMap });
    const layer = new GraphicsLayer();
    webMap.add(layer);
    setGraphicsLayer(layer);
    setView(mapView);

    mapView.when(() => {
      const sketch = new Sketch({
        view: mapView,
        layer: layer,
        availableCreateTools: ["polygon", "point"], 
        creationMode: "update"
      });
      sketch.visibleElements = {
        createTools: {
          circle: false
        },
        selectionTools:{
          "lasso-selection": false,
          "rectangle-selection": false
        },
        settingsMenu: false
      }
      mapView.ui.add(sketch, "top-right");
      sketch.on("create", (event) => {
        if (event.state === "complete") {
          const graphic = event.graphic;
          let geoJson = {};
          console.log(graphic);
      
          const geoGeometry = graphic.geometry.clone();
          geoGeometry.spatialReference = mapView.spatialReference; 

          const geographicGeometry = webMercatorUtils.webMercatorToGeographic(geoGeometry);
      
          if (geographicGeometry.type === "point") {
            geoJson = {
              type: "Point",
              coordinates: [geographicGeometry.longitude, geographicGeometry.latitude],
            };
          } else if (geographicGeometry.type === "polygon") {
            console.log("here");
            geoJson = {
              type: "Polygon",
              coordinates: geographicGeometry.rings.map(ring => 
                ring.map(([x, y]) => [
                  x, // longitude
                  y  // latitude
                ])
              ),
            };
            console.log(geoJson.coordinates);
          }
      
          setOutageData((prev) => [...prev, geoJson]);
        }
      });
      
    });

    return () => { mapView.destroy(); };
  }, []);

  const submitOutage = async () => {
    if (!graphicsLayer) return;

    const outageGraphics = graphicsLayer.graphics.items.map((graphic, index) => ({
      outage_id: `outage-${index}`,
      description: "User reported outage",
      location: {
        type: graphic.geometry.type,
        coordinates:
          graphic.geometry.type === "point"
            ? [graphic.geometry.longitude, graphic.geometry.latitude]
            : graphic.geometry.rings,
      },
      active: true,
    }));

    try {
      const response = await fetch("https://mr7z4ab9da.execute-api.ca-central-1.amazonaws.com/default/outagis-submit_outage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outageGraphics),
      });

      if (response.ok) {
        setShowSnackbar(true);
      } else {
        console.error("Failed to submit outage.");
      }
    } catch (error) {
      console.error("Error submitting outage:", error);
    }
  };

  const handleNext = () => {
    console.log("Outage data:", outageData);
    navigate("/report-form", { state: { outageData } });
  };

  return (
    <Box sx={{ width: "100%", height: "100vh", marginTop: "90px" }}>
      <div id="mapViewDiv" style={{ width: "100%", height: "80%", marginTop: "50px" }}></div>
      <Button onClick={handleNext} variant="contained" color="primary" sx={{ margin: "20px" }}>
        Next
      </Button>
      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          Outage reported successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Report;
