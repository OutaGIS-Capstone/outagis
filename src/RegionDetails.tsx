import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, Button, Link } from "@mui/material";

const outageDetails = [
  { region: "Lower Mainland / Sunshine Coast", municipality: "Richmond", offSince: "Feb 5, 9:57 a.m.", status: "Crew on-site", area: "9000 block RYAN PL", affected: "< 5", cause: "Planned work", updated: "Feb 5, 2:54 p.m." },
  { region: "Lower Mainland / Sunshine Coast", municipality: "Sechelt", offSince: "Feb 5, 12:39 p.m.", status: "Crew assigned", area: "12700 block LAGOON RD", affected: "17", cause: "Under investigation", updated: "Feb 5, 3:03 p.m." },
  { region: "Lower Mainland / Sunshine Coast", municipality: "Sechelt", offSince: "Feb 5, 7:05 a.m.", status: "Crew assigned", area: "South of BRYAN RD", affected: "17", cause: "Snow storm", updated: "Feb 5, 3:03 p.m." },
  { region: "Lower Mainland / Sunshine Coast", municipality: "Sechelt", offSince: "Feb 4, 12:59 a.m.", status: "Crew on-site", area: "11400-11500 block SUN CST HWY", affected: "12", cause: "Tree down", updated: "Feb 5, 3:03 p.m." },
];

const RegionDetails: React.FC = () => {
  const { regionName } = useParams<{ regionName: string }>();
  const navigate = useNavigate();
  const [selectedMunicipality, setSelectedMunicipality] = useState("All");

  const filteredOutages = outageDetails.filter(
    (outage) => outage.region === regionName && (selectedMunicipality === "All" || outage.municipality === selectedMunicipality)
  );

  const municipalities = [...new Set(outageDetails.filter(o => o.region === regionName).map(o => o.municipality))];

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>⬅ Back</Button>
      <Typography variant="h5" gutterBottom>{regionName}</Typography>
      <Typography variant="body1">Total customers affected: {filteredOutages.reduce((sum, o) => sum + (isNaN(Number(o.affected)) ? 0 : Number(o.affected)), 0)}</Typography>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body2" display="inline" sx={{ mr: 1 }}>Municipality:</Typography>
        <Select value={selectedMunicipality} onChange={(e) => setSelectedMunicipality(e.target.value)}>
          <MenuItem value="All">All</MenuItem>
          {municipalities.map((m, i) => <MenuItem key={i} value={m}>{m}</MenuItem>)}
        </Select>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Municipality</strong></TableCell>
              <TableCell><strong>Off Since</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Area</strong></TableCell>
              <TableCell><strong>Affected</strong></TableCell>
              <TableCell><strong>Cause</strong></TableCell>
              <TableCell><strong>Updated</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOutages.map((outage, index) => (
              <TableRow key={index}>
                <TableCell>{outage.municipality}</TableCell>
                <TableCell>{outage.offSince}</TableCell>
                <TableCell>{outage.status}</TableCell>
                <TableCell>
                  {outage.area} <br />
                  <Link href="#">View on map</Link>
                </TableCell>
                <TableCell>{outage.affected}</TableCell>
                <TableCell>{outage.cause}</TableCell>
                <TableCell>{outage.updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RegionDetails;
