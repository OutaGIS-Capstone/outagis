import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Snackbar, Alert, Typography } from "@mui/material";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import Search from "@arcgis/core/widgets/Search";
import esriConfig from "@arcgis/core/config";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import { SimpleFillSymbol } from "@arcgis/core/symbols";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX";

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<MapView | null>(null);
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

    const searchWidget = new Search({
          view: mapView,
          searchAllEnabled: false,
          includeDefaultSources: false,
          locationEnabled: false,
          sources: [
            {
              url: "https://geocoder.api.gov.bc.ca/addresses.json",
              apiKey: "9NmfuknKwcS64qUeONsLPQyAgU3u28ov",
              name: "BC Geocoder",
              placeholder: "Search BC addresses...",
              getResults: async (params) => {
                const url = `https://geocoder.api.gov.bc.ca/addresses.json?addressString=${params.suggestResult.text}&provinceCode=BC`;
                const response = await fetch(url);
                const data = await response.json();
              
                if (data.features && data.features.length > 0) {
                  const feature = data.features[0];
                  const coordinates = feature.geometry.coordinates; // [longitude, latitude]
              
                  console.log("Coordinates:", coordinates);
              
                  // Ensure correct coordinate order
                  const [longitude, latitude] = coordinates;
              
                  // Zoom and pan the map to the BC geocoder result
                  await mapView.goTo({
                    center: [longitude, latitude], // Corrected order
                    zoom: 20
                  });
              
                  return data.features.map((feature: any) => ({
                    name: feature.properties.fullAddress,
                    location: { latitude, longitude }
                  }));
                }
              
                return [];
              },
            },
            {
              // ArcGIS Search widget (fallback)
              url: "https://utility.arcgis.com/usrsvcs/appservices/Geocoder/GeocodeServer",
              name: "ArcGIS Geocoder",
              placeholder: "Search locations...",
            }
          ]
        });
        mapView.ui.add(searchWidget, "top-right");

    mapView.when(() => {
      const sketch = new Sketch({
        view: mapView,
        layer: layer,
        availableCreateTools: ["freehandPolygon", "point"], // hide polygon to avoid confusion
        creationMode: "update"
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapView.goTo({
            center: [longitude, latitude],
            zoom: 15 // or whatever zoom level works best
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        })
      
      sketch.visibleElements = {
        createTools: {
          circle: false,
          freehandPolygon: true, // hide standard polygon button
        },
        selectionTools: {
          "lasso-selection": false,
          "rectangle-selection": false,
        },
        settingsMenu: false,
      };
      
      mapView.ui.add(sketch, "top-right");
      
      // Start freehand polygon draw immediately
      // sketch.create("polygon", { mode: "freehand" });
      
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
          } else if (geographicGeometry.type === "polygon" , {mode: "freehand"}) {
            console.log("here");
            const hatchedSymbol = new SimpleFillSymbol({
              style: "diagonal-cross", // or "cross", "horizontal", etc.
              color: [255, 0, 0, 0.3],  // semi-transparent fill
              outline: {
                color: [255, 0, 0],
                width: 2
              }
            });
            graphic.symbol = hatchedSymbol;
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
  const handleTutorial = () => {
    navigate("/tutorial");
  };

  return (
    <Box sx={{ width: "100%", height: "100vh",  display: "flex", flexDirection: "column" }}>
      <div id="mapViewDiv" style={{ width: "100%", height: "90%", marginTop: "75px", borderRadius: "12px", overflow: "hidden" }}></div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
        <Typography 
          onClick={handleTutorial} 
          sx={{ textDecoration: "underline", color: "#007aff", fontWeight: "500", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >
          Click here to watch a tutorial video!
        </Typography>
        <Button onClick={handleNext} variant="contained" color="primary" sx={{ borderRadius: "8px", padding: "10px 20px" }}>
          Next
        </Button>
      </Box>
      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          Outage reported successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Report;