import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, CircularProgress, Button, Modal, TextField, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useAdmin } from "./AdminContext.tsx";

const MyOutages: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAdmin } = useAdmin(); // Check if the user is an admin
  const [outages, setOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10); // Initial number of outages to show
  const [openModal, setOpenModal] = useState(false);
  const [currentOutage, setCurrentOutage] = useState<any | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [area, setArea] = useState("");
  const [affected, setAffected] = useState(0);
  const [cause, setCause] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      // Static data
      const staticOutages = Array.from({ length: 50 }, (_, i) => ({
        outage_id: i + 1,
        region: "Region " + (i + 1),
        municipality: "Municipality " + (i + 1),
        offSince: "2025-03-10 08:00",
        status: i % 2 === 0 ? "Outage" : "Restored",
        area: "Area " + (i + 1),
        affected: (i + 1) * 10,
        cause: "Storm damage",
        reportedAt: "2025-03-10 09:00",
      }));

      setOutages(staticOutages);
      setLoading(false);

      /*
      // Uncomment when API is ready
      fetch("https://brrj1peht3.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outage_by_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.username })
      })
      .then(response => response.json())
      .then(data => {
        setOutages(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching outages:", error);
        setLoading(false);
      });
      */
    }
  }, [user]);

  const handleOpenModal = (outage: any) => {
    setCurrentOutage(outage);
    setDescription(outage.description);
    setStatus(outage.status);
    setRegion(outage.region);
    setMunicipality(outage.municipality);
    setArea(outage.area);
    setAffected(outage.affected);
    setCause(outage.cause);
    setReportedAt(outage.reportedAt);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSubmit = () => {
    if (currentOutage) {
      // Handle API call to modify outage
      const updatedOutage = {
        outage_id: currentOutage.outage_id,
        user_id: user.username, // Use actual user ID
        description,
        status,
        region,
        municipality,
        area,
        affected,
        cause,
        reportedAt,
      };

      // Perform the API call to modify outage
      fetch("https://mr7z4ab9da.execute-api.ca-central-1.amazonaws.com/default/outagis-modify_outage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOutage),
      })
        .then((response) => response.json())
        .then((data) => {
          setOutages((prevOutages) =>
            prevOutages.map((outage) =>
              outage.outage_id === currentOutage.outage_id ? { ...outage, ...updatedOutage } : outage
            )
          );
          setOpenModal(false);
        })
        .catch((error) => {
          console.error("Error modifying outage:", error);
          setErrorMessage("An error occurred while modifying the outage.");
        });
    }
  };

  if (!user) {
    return <Typography variant="h6">You must be logged in to view this page.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3, marginTop: "5em" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: "center", color: "#333" }}>
        My Reported Outages
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : outages.length === 0 ? (
        <Typography sx={{ textAlign: "center", color: "#666" }}>No reported outages found.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ my: 3, borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f7" }}>
                  {"Region, Municipality, Off Since, Status, Area, Affected, Cause, Reported".split(", ").map((header) => (
                    <TableCell key={header} align="center" sx={{ fontWeight: 600, color: "#333" }}>{header}</TableCell>
                  ))}
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {outages.slice(0, visibleCount).map((outage, index) => (
                  <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
                    <TableCell align="center">{outage.region}</TableCell>
                    <TableCell align="center">{outage.municipality}</TableCell>
                    <TableCell align="center">{outage.offSince}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 500, color: outage.status === "Outage" ? "#d9534f" : "#5cb85c" }}>
                      {outage.status}
                    </TableCell>
                    <TableCell align="center">
                    {outage.area} <br />
                    <Link
                      href={`/outage/${outage.outage_id}`} // Link to the Outage page with the outage ID
                      sx={{ color: "#007aff", textDecoration: "none", fontWeight: 500 }}
                    >
                      View on map
                    </Link>
                  </TableCell>

                    <TableCell align="center">{outage.affected}</TableCell>
                    <TableCell align="center">{outage.cause}</TableCell>
                    <TableCell align="center">{outage.reportedAt}</TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        <Button variant="outlined" onClick={() => handleOpenModal(outage)}>Edit</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {visibleCount < outages.length && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" onClick={() => setVisibleCount(visibleCount + 10)} sx={{ backgroundColor: "#007aff", color: "white", borderRadius: "20px", textTransform: "none", fontWeight: 500 }}>
                Load More
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Modal for Editing Outage */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 800,
            margin: "auto",
            backgroundColor: "white",
            padding: 3,
            borderRadius: 2,
            overflowY: "auto", // Allow scrolling if content overflows
            maxHeight: "90vh", // Make modal larger and allow scrolling
            boxShadow: 24,
          }}
        >
          <Typography variant="h5" gutterBottom>Edit Outage</Typography>

          <TextField
            label="Description"
            fullWidth
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              {["Crew on the way", "Crew assigned", "Resolved", "Pending"].map((statusOption) => (
                <MenuItem key={statusOption} value={statusOption}>{statusOption}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Region"
            fullWidth
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Municipality"
            fullWidth
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Area"
            fullWidth
            value={area}
            onChange={(e) => setArea(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Affected"
            fullWidth
            type="number"
            value={affected}
            onChange={(e) => setAffected(Number(e.target.value))}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Cause"
            fullWidth
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Reported At"
            fullWidth
            value={reportedAt}
            onChange={(e) => setReportedAt(e.target.value)}
            sx={{ marginBottom: 2 }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>Save</Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for error message */}
      <Snackbar open={errorMessage !== ""} autoHideDuration={6000} onClose={() => setErrorMessage("")}>
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyOutages;
