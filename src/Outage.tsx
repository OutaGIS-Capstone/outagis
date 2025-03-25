import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar, Alert, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAdmin } from "./AdminContext.tsx";
import "@arcgis/core/assets/esri/themes/light/main.css";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Point, Polygon } from "@arcgis/core/geometry";
import { SimpleFillSymbol, SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import Sketch from "@arcgis/core/widgets/Sketch";
import esriConfig from "@arcgis/core/config";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX";

const Outage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const { outageId } = useParams<{ outageId: string }>();
  const storedOutageId = localStorage.getItem("selectedOutageId") || outageId;
  const [outageData, setOutageData] = useState<any>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [graphics, setGraphics] = useState<Graphic[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (!storedOutageId) return;

    // Fetch outage details from API
    const fetchOutage = async () => {
      try {
        const response = await fetch(
          `https://7cu52zycsc.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outage_by_id?outage_id=${storedOutageId}`
        );
        if (!response.ok) throw new Error("Failed to fetch outage data");
        const data = await response.json();
        setOutageData(data);
      } catch (error) {
        console.error("Error fetching outage:", error);
      }
    };

    fetchOutage();
  }, [storedOutageId]);

  useEffect(() => {
    if (!outageData || !outageData.geojson) return;

    // Create a WebMap and MapView
    const webMap = new WebMap({ portalItem: { id: "65b663af59944a2dac3834f34d48b9c9" } });
    const mapView = new MapView({ container: "mapViewDiv", map: webMap });
    const layer = new GraphicsLayer();
    webMap.add(layer);
    setGraphicsLayer(layer);
    setView(mapView);

    let newGraphic;
    const { type, coordinates } = outageData.geojson.geometry;

    if (type === "Point") {
      const point = new Point({ longitude: coordinates[0], latitude: coordinates[1] });
      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 0, 0],
        size: 10,
        outline: { color: [255, 255, 255], width: 1 },
      });
      newGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
    } else if (type === "Polygon") {
      const polygon = new Polygon({ rings: coordinates, spatialReference: { wkid: 4326 } });
      const fillSymbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.3],
        outline: { color: [255, 0, 0], width: 2 },
      });
      newGraphic = new Graphic({ geometry: polygon, symbol: fillSymbol });
    }

    if (newGraphic) {
      layer.add(newGraphic);
      setGraphics([newGraphic]);
      mapView.goTo(newGraphic);
    }

    return () => mapView.destroy();
  }, [outageData]);

  const enableEditing = () => {
    if (isAdmin && view && graphicsLayer) {
      const sketch = new Sketch({
        view,
        layer: graphicsLayer,
        availableCreateTools: ["polygon"], // Allow polygon edits
        updateOnGraphicClick: true, // Enable selection for editing
        creationMode: "update" // Allow editing of existing graphics
      });
      view.ui.add(sketch, "top-right");

      // Enable vertex editing (resizing) when a graphic is clicked
      sketch.on("update", (event) => {
        if (event.state === "complete") {
          const updatedGraphic = event.graphic;
          console.log("Updated graphic:", updatedGraphic);
          // Update the graphics array
          setGraphics((prevGraphics) =>
            prevGraphics.map((graphic) =>
              graphic.attributes.id === updatedGraphic.attributes.id ? updatedGraphic : graphic
            )
          );
        }
      });
    }
  };

  const saveOutage = async () => {
    if (!graphics.length || !outageData) return;

    const outageUpdates = graphics.map((graphic, index) => ({
      outage_id: `${outageId}-${index}`,
      user_id: 2, // Replace with actual user ID
      description: outageData.description,
      location: {
        type: graphic.geometry.type,
        coordinates: graphic.geometry.type === "point" ? [graphic.geometry.longitude, graphic.geometry.latitude] : graphic.geometry.rings,
      },
      active: true,
    }));

    try {
      const response = await fetch(
        "https://mr7z4ab9da.execute-api.ca-central-1.amazonaws.com/default/outagis-modify_outage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outageUpdates),
        }
      );

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
    <Box sx={{ width: "100%", height: "100vh", marginTop: "90px" }}>
      <Typography variant="h4" align="center" sx={{ marginBottom: "20px" }}>
        Outage Details
      </Typography>
      {outageData && (
        <Box sx={{ padding: "20px", textAlign: "center" }}>
          <Typography variant="h6"><strong>Description:</strong> {outageData.description}</Typography>
          <Typography variant="h6"><strong>Status:</strong> {outageData.status}</Typography>
          <Typography variant="h6"><strong>Cause:</strong> {outageData.cause}</Typography>
          <Typography variant="h6"><strong>Timestamp:</strong> {new Date(outageData.timestamp).toLocaleString()}</Typography>
        </Box>
      )}
      <div id="mapViewDiv" style={{ width: "100%", height: "60%", marginTop: "20px" }}></div>
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
