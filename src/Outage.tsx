import React, { useEffect, useState } from "react";
import { Box, Button, Snackbar, Alert, Typography, TextField, FormControl, InputLabel, MenuItem, Select,} from "@mui/material";
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
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import esriConfig from "@arcgis/core/config";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils"

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
  const [sketchViewModel, setSketchViewModel] = useState<SketchViewModel | null>(null);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const OUTAGE_STATUS = {
    NO_CREW_ASSIGNED: 'no crew assigned',
    CREW_ON_THEIR_WAY: 'crew on their way',
    CREW_ON_SITE: 'crew on site',
    RESTORED: 'restored'
  } as const;
  
  type OutageStatus = typeof OUTAGE_STATUS[keyof typeof OUTAGE_STATUS];
  
  const STATUS_OPTIONS = [
    { label: 'No Crew Assigned', value: OUTAGE_STATUS.NO_CREW_ASSIGNED },
    { label: 'Crew On Their Way', value: OUTAGE_STATUS.CREW_ON_THEIR_WAY },
    { label: 'Crew On Site', value: OUTAGE_STATUS.CREW_ON_SITE },
    { label: 'Restored', value: OUTAGE_STATUS.RESTORED }
  ];

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
        console.log(data);
        setOutageData(data);
      } catch (error) {
        console.error("Error fetching outage:", error);
      }
    };

    fetchOutage();
  }, [storedOutageId]);

  useEffect(() => {
    if (!outageData || !outageData.geojson) return;

    const webMap = new WebMap({ portalItem: { id: "65b663af59944a2dac3834f34d48b9c9" } });
    const mapView = new MapView({ container: "mapViewDiv", map: webMap });
    const layer = new GraphicsLayer();
    webMap.add(layer);
    setGraphicsLayer(layer);
    setView(mapView);

    const { type, coordinates } = outageData.geojson.geometry;
    let newGraphic: Graphic | null = null;

    if (type === "Point") {
      const point = new Point({ longitude: coordinates[0], latitude: coordinates[1] });
      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 0, 0],
        size: 10,
        outline: { color: [255, 255, 255], width: 1 },
      });
      newGraphic = new Graphic({ 
        geometry: point, 
        symbol: markerSymbol,
        attributes: {
          isOutage: true
        }
      });
    } else if (type === "Polygon") {
      const polygon = new Polygon({ rings: coordinates, spatialReference: { wkid: 4326 } });
      const fillSymbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.3],
        outline: { color: [255, 0, 0], width: 2 },
      });
      newGraphic = new Graphic({ 
        geometry: polygon, 
        symbol: fillSymbol,
        attributes: {
          isOutage: true
        }
      });
    }

    if (newGraphic) {
      layer.add(newGraphic);
      setGraphics([newGraphic]);
      mapView.goTo(newGraphic);
    }

    return () => mapView.destroy();
  }, [outageData]);

  const enableEditing = () => {
    if (isAdmin && view && graphicsLayer && graphics.length > 0) {
      const sketchVM = new SketchViewModel({
        view: view,
        layer: graphicsLayer,
        updateOnGraphicClick: false,
        defaultUpdateOptions: {
          toggleToolOnClick: true // only reshape operation will be enabled
        }
      });

      setSketchViewModel(sketchVM);

      // Listen to sketchViewModel's events
      sketchVM.on("update", (event) => {
        if (event.state === "complete") {
          const updatedGraphic = event.graphics[0];
          setGraphics([updatedGraphic]);
        }
      });

      // Enable clicking on the graphic to start editing
      view.on("click", (event) => {
        if (sketchVM.state === "active") return;

        view.hitTest(event).then((response) => {
          const results = response.results;
          results.forEach((result) => {
            if (result.graphic?.attributes?.isOutage) {
              sketchVM.update([result.graphic], { tool: "reshape" });
            }
          });
        });
      });
    }
    setEditingEnabled(true);
  };

  const saveOutage = async () => {
    if (!graphics.length || !outageData || !view) {
      console.error("Missing required data");
      return;
    }
  
    try {
      // Import the webMercatorUtils at the top of your file:
      // import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
      
      const geometry = graphics[0].geometry.clone();
      let coordinates;
  
      // Convert Web Mercator to Geographic (WGS84) if needed
      if (view.spatialReference.isWebMercator) {
        if (geometry.type === "point") {
          const point = webMercatorUtils.webMercatorToGeographic(geometry) as Point;
          coordinates = [point.longitude, point.latitude];
        } else if (geometry.type === "polygon") {
          const polygon = webMercatorUtils.webMercatorToGeographic(geometry) as Polygon;
          coordinates = polygon.rings;
        }
      } else {
        // If already in geographic coordinates
        if (geometry.type === "point") {
          coordinates = [geometry.longitude, geometry.latitude];
        } else if (geometry.type === "polygon") {
          coordinates = geometry.rings;
        }
      }
  
      // Prepare the outage update payload
      const outageUpdate = {
        description: outageData.description,
       
          type: "Feature",
          location: {
            type: geometry.type,
            coordinates: coordinates
          },
          
          population_affected: outageData.population_affected,
          cause: outageData.cause,
          eta: outageData.eta,
          status: outageData.status.toLowerCase(),
          
        
        outage_id: outageId
      };
  
      console.log("Submitting:", outageUpdate);
  
      const response = await fetch(
        "https://mr7z4ab9da.execute-api.ca-central-1.amazonaws.com/default/outagis-modify_outage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outageUpdate),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Success:", result);
      setShowSnackbar(true);
      setEditingEnabled(false);
      
      if (sketchViewModel) {
        sketchViewModel.cancel();
      }
  
    } catch (error) {
      console.error("Error updating outage:", error);
      setError("Failed to save outage. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", height: "100vh", marginTop: "90px" }}>
      <Box sx={{ width: "40%", padding: "20px" }}>
        <Typography variant="h4" align="center" sx={{ marginBottom: "20px" }}>
          Outage Details
        </Typography>
        {outageData && (
          <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
            <TextField
              fullWidth
              label="Description"
              value={outageData.description}
              onChange={(e) => setOutageData({ ...outageData, description: e.target.value })}
              disabled={!isAdmin}
              sx={{ marginBottom: "10px" }}
            />
            <FormControl fullWidth sx={{ marginBottom: '10px' }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={outageData.status.toLowerCase()} // Ensure comparison works with lowercase
                onChange={(e) => setOutageData({ ...outageData, status: e.target.value })}
                label="Status"
                disabled={!isAdmin}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Cause"
              value={outageData.cause}
              onChange={(e) => setOutageData({ ...outageData, cause: e.target.value })}
              disabled={!isAdmin}
              sx={{ marginBottom: "10px" }}
            />
            <TextField
              fullWidth
              label="Population Affected"
              value={outageData.population_affected}
              onChange={(e) => setOutageData({ ...outageData, population_affected: e.target.value })}
              disabled={!isAdmin}
              sx={{ marginBottom: "10px" }}
            />
            <TextField
              fullWidth
              label="ETA"
              value={outageData.eta}
              onChange={(e) => setOutageData({ ...outageData, eta: e.target.value })}
              disabled={!isAdmin}
              sx={{ marginBottom: "10px" }}
            />
          </Box>
        )}
        {isAdmin && (
          <>
            <Button 
              variant="contained" 
              color={editingEnabled ? "secondary" : "primary"} 
              onClick={enableEditing} 
              sx={{ marginBottom: "20px" }}
            >
              {editingEnabled ? "Editing Enabled" : "Enable Editing"}
            </Button>
            <Button 
              onClick={saveOutage} 
              variant="contained" 
              color="secondary" 
              sx={{ marginBottom: "20px" }}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        )}
      </Box>

      <div id="mapViewDiv" style={{ width: "60%", height: "100%" }}></div>

      <Snackbar open={showSnackbar} autoHideDuration={3000} onClose={() => setShowSnackbar(false)}>
        <Alert onClose={() => setShowSnackbar(false)} severity="success">
          Outage updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Outage;