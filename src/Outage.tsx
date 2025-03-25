import React, { useEffect, useState } from "react";
import { 
  Box, Button, Snackbar, Alert, Typography, TextField, FormControl, 
  InputLabel, MenuItem, Select, CircularProgress, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, useMediaQuery, useTheme 
} from "@mui/material";
import { CheckCircleOutline, Delete } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext.tsx";
import "@arcgis/core/assets/esri/themes/light/main.css";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Point, Polygon } from "@arcgis/core/geometry";
import { SimpleFillSymbol, SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import esriConfig from "@arcgis/core/config";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurDEIiAqgC6zGwmjRMGhSO75XQSaD5YVw_tZ9FZuP1tp0wYsJZ6FsQiRPg0jC84RuHYrU-vBZl9ZQIoKh-k6wPuKAUpBsmSYakTfeD2WE3sc6MLl0evhoM7_ZHUVQHuOMQWZYe6Z2s0TfglsWDpxJAtcwdt1krJJKXhK9HaQoL9aC8Y3230L4lmFJ8zH1Ye2g5z1cxw_OcVefB7_8SAbup3A.AT1_ujBXG8pX";

const Outage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { outageId } = useParams<{ outageId: string }>();
  const storedOutageId = localStorage.getItem("selectedOutageId") || outageId;
  const [outageData, setOutageData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [graphics, setGraphics] = useState<Graphic[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [sketchViewModel, setSketchViewModel] = useState<SketchViewModel | null>(null);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const OUTAGE_STATUS = {
    NO_CREW_ASSIGNED: 'no crew assigned',
    CREW_ON_THEIR_WAY: 'crew on their way',
    CREW_ON_SITE: 'crew on site',
    RESTORED: 'restored'
  } as const;
  
  const STATUS_OPTIONS = [
    { label: 'No Crew Assigned', value: OUTAGE_STATUS.NO_CREW_ASSIGNED },
    { label: 'Crew On Their Way', value: OUTAGE_STATUS.CREW_ON_THEIR_WAY },
    { label: 'Crew On Site', value: OUTAGE_STATUS.CREW_ON_SITE },
    { label: 'Restored', value: OUTAGE_STATUS.RESTORED }
  ];

  useEffect(() => {
    if (!storedOutageId) return;

    const fetchOutage = async () => {
      try {
        const response = await fetch(
          `https://7cu52zycsc.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outage_by_id?outage_id=${storedOutageId}`
        );
        if (!response.ok) throw new Error("Failed to fetch outage data");
        const data = await response.json();
        setOutageData(data);
        setFormData(data);
      } catch (error) {
        console.error("Error fetching outage:", error);
      }
    };

    fetchOutage();
  }, [storedOutageId]);

  useEffect(() => {
    if (!outageData || !outageData.geojson) return;

    const webMap = new WebMap({ portalItem: { id: "65b663af59944a2dac3834f34d48b9c9" } });
    const mapView = new MapView({ 
      container: "mapViewDiv", 
      map: webMap,
      padding: isMobile ? { top: 50 } : undefined
    });
    
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
  }, [outageData?.geojson, isMobile]);

  const enableEditing = () => {
    if (isAdmin && view && graphicsLayer && graphics.length > 0) {
      const sketchVM = new SketchViewModel({
        view: view,
        layer: graphicsLayer,
        updateOnGraphicClick: false,
        defaultUpdateOptions: {
          toggleToolOnClick: true
        }
      });

      setSketchViewModel(sketchVM);

      sketchVM.on("update", (event) => {
        if (event.state === "complete") {
          const updatedGraphic = event.graphics[0];
          setGraphics([updatedGraphic]);
        }
      });

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
    setEditingEnabled(!editingEnabled);
  };

  const saveOutage = async () => {
    if (!graphics.length || !formData || !view) {
      console.error("Missing required data");
      return;
    }
  
    setIsSaving(true);
    setError(null);
  
    try {
      const geometry = graphics[0].geometry.clone();
      let coordinates;
  
      if (view.spatialReference.isWebMercator) {
        if (geometry.type === "point") {
          const point = webMercatorUtils.webMercatorToGeographic(geometry) as Point;
          coordinates = [point.longitude, point.latitude];
        } else if (geometry.type === "polygon") {
          const polygon = webMercatorUtils.webMercatorToGeographic(geometry) as Polygon;
          coordinates = polygon.rings;
        }
      } else {
        if (geometry.type === "point") {
          coordinates = [geometry.longitude, geometry.latitude];
        } else if (geometry.type === "polygon") {
          coordinates = geometry.rings;
        }
      }
  
      const outageUpdate = {
        description: formData.description,
        type: "Feature",
        location: {
          type: geometry.type,
          coordinates: coordinates
        },
        population_affected: formData.population_affected,
        cause: formData.cause,
        eta: formData.eta,
        status: formData.status.toLowerCase(),
        outage_id: outageId
      };
  
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
      setOutageData(formData);
      setShowSnackbar(true);
      setEditingEnabled(false);
      
      if (sketchViewModel) {
        sketchViewModel.cancel();
      }
    } catch (error) {
      console.error("Error updating outage:", error);
      setError("Failed to save outage. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOutage = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        "https://wehat7vjif.execute-api.ca-central-1.amazonaws.com/default/outagis-delete_outage",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outage_id: outageId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete outage");
      }

      localStorage.removeItem("selectedOutageId");
      navigate("/");
    } catch (error) {
      console.error("Error deleting outage:", error);
      setError("Failed to delete outage. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <Box sx={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      height: isMobile ? "auto" : "calc(100vh - 90px)",
      marginTop: isMobile ? "16px" : "90px",
      backgroundColor: "#f5f5f7"
    }}>

      <Box sx={{
        width: isMobile ? "calc(100% - 32px)" : "40%",
        padding: isMobile ? "16px" : "32px",
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        margin: isMobile ? "16px" : "16px 16px 16px 16px",
        overflowY: "auto",
        order: isMobile ? 2 : 1
      }}>
        <Typography variant="h4" sx={{
          marginBottom: "24px",
          fontWeight: 500,
          color: "#1d1d1f",
          fontSize: isMobile ? "24px" : "28px",
          letterSpacing: "-0.5px"
        }}>
          Outage Details
        </Typography>
  
        {formData && (
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <TextField
              multiline
              minRows={3}
              maxRows={8}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isAdmin}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: "8px",
                  '& fieldset': {
                    borderColor: "#d2d2d7",
                  },
                  '&:hover fieldset': {
                    borderColor: "#86868b",
                  },
                },
                '& .MuiInputLabel-root': {
                  color: "#86868b",
                }
              }}
            />
  
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#86868b" }}>Status</InputLabel>
              <Select
                value={formData.status.toLowerCase()}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
                disabled={!isAdmin}
                sx={{
                  borderRadius: "8px",
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: "#d2d2d7",
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: "#86868b",
                  },
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: "#f5f5f7",
                      },
                      '&:hover': {
                        backgroundColor: "#f5f5f7",
                      }
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <TextField
              label="Cause"
              value={formData.cause}
              onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
              disabled={!isAdmin}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: "8px",
                  '& fieldset': {
                    borderColor: "#d2d2d7",
                  },
                  '&:hover fieldset': {
                    borderColor: "#86868b",
                  },
                }
              }}
            />
  
            <TextField
              label="Population Affected"
              value={formData.population_affected}
              onChange={(e) => setFormData({ ...formData, population_affected: e.target.value })}
              disabled={!isAdmin}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: "8px",
                  '& fieldset': {
                    borderColor: "#d2d2d7",
                  },
                  '&:hover fieldset': {
                    borderColor: "#86868b",
                  },
                }
              }}
            />
  
            <TextField
              label="Estimated Restoration Time"
              value={formData.eta}
              onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
              disabled={!isAdmin}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: "8px",
                  '& fieldset': {
                    borderColor: "#d2d2d7",
                  },
                  '&:hover fieldset': {
                    borderColor: "#86868b",
                  },
                }
              }}
            />
          </Box>
        )}
  
        {isAdmin && (
          <Box sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "16px",
            marginTop: "24px"
          }}>
            <Button 
              variant="contained" 
              onClick={enableEditing} 
              sx={{
                flex: 1,
                borderRadius: "8px",
                padding: "10px 16px",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                backgroundColor: editingEnabled ? "#ff453a" : "#0071e3",
                '&:hover': {
                  backgroundColor: editingEnabled ? "#d70015" : "#0062ba",
                }
              }}
            >
              {editingEnabled ? "Stop Editing" : "Edit Boundaries"}
            </Button>
            <Button 
              onClick={saveOutage} 
              variant="contained" 
              sx={{
                flex: 1,
                borderRadius: "8px",
                padding: "10px 16px",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                backgroundColor: "#34c759",
                '&:hover': {
                  backgroundColor: "#248a3d",
                },
                '&:disabled': {
                  backgroundColor: "#e5e5ea",
                  color: "#aeaeb2"
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white", marginRight: "8px" }} />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
            <Button 
              onClick={() => setDeleteConfirmOpen(true)} 
              variant="contained" 
              startIcon={<Delete />}
              sx={{
                flex: 1,
                borderRadius: "8px",
                padding: "10px 16px",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                backgroundColor: "#ff3b30",
                '&:hover': {
                  backgroundColor: "#d70015",
                },
                '&:disabled': {
                  backgroundColor: "#e5e5ea",
                  color: "#aeaeb2"
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={20} sx={{ color: "white", marginRight: "8px" }} />
                  Deleting...
                </>
              ) : "Delete Outage"}
            </Button>
          </Box>
        )}
      </Box>
  

      <Box sx={{ 
        width: isMobile ? "100%" : "60%",
        height: isMobile ? "400px" : "100%",
        position: "relative",
        order: isMobile ? 1 : 2,
        '&::before': {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(to right, transparent, #d2d2d7, transparent)"
        }
      }}>
        <div id="mapViewDiv" style={{ 
          width: "100%", 
          height: "100%",
          borderRadius: isMobile ? "12px 12px 0 0" : "0 0 0 12px"
        }}></div>
      </Box>
  
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success"
          sx={{
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#f5f5f7",
            color: "#1d1d1f"
          }}
          iconMapping={{
            success: <CheckCircleOutline sx={{ color: "#34c759" }} />
          }}
        >
          Outage updated successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this outage? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteOutage} 
            color="error" 
            autoFocus
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Outage;

