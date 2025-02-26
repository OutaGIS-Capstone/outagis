import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const outages = [
  { region: "Central Interior", outages: 0, customers: 0 },
  { region: "Lower Mainland / Sunshine Coast", outages: 13, customers: 104, map: true },
  { region: "Northern", outages: 0, customers: 0 },
  { region: "Okanagan / Kootenay", outages: 1, customers: 33, map: true },
  { region: "Thompson / Shuswap", outages: 1, customers: "< 5", map: true },
  { region: "Vancouver Island, North", outages: 1, customers: "< 5", map: true },
  { region: "Vancouver Island, South", outages: 0, customers: 0 },
];

const OutageList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3, marginTop: "5em"}}>
      <Typography variant="h4" gutterBottom>
        Report an Outage
      </Typography>

      <Typography variant="body1" gutterBottom>
        Lost power? Check the outage map to see if we’re aware of the outage. If your outage isn’t shown, call{" "}
        <strong>PHONE NUMBR</strong> (1 800 XXX XXXX) or *XXXXX (*XXXXX) on your mobile or log in to{" "}
        <a href="#">report it online</a>.
      </Typography>
      
      <Typography variant="body2">
        See our <a href="#">outage status definition</a> list to learn what the status of your outage means.
      </Typography>

      <Alert severity="error" sx={{ my: 2 }}>
        <Typography variant="h6">⚠️ Regional alert</Typography>
        <Typography>
          We have posted updates for: <strong>Lower Mainland / Sunshine Coast</strong>
          <br />
          <small>Last updated: Feb 5, 3:34 p.m.</small>
        </Typography>
      </Alert>

      <TableContainer component={Paper} sx={{ my: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Region</strong></TableCell>
              <TableCell align="center"><strong>Outages</strong></TableCell>
              <TableCell align="center"><strong>Customers Affected</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outages.map((row, index) => (
              <TableRow key={index} onClick={() => navigate(`/region/${encodeURIComponent(row.region)}`)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <TableCell>
                  <Link component="button" underline="hover" align="left">
                    {row.region}
                  </Link>
                </TableCell>
                <TableCell align="center">{row.outages}</TableCell>
                <TableCell align="center">{row.customers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" display="block" gutterBottom>
        Last updated: Feb 5, 3:34 p.m.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
        <Button variant="outlined">📍 Near me</Button>
        <Button variant="outlined">🏠 Address</Button>
        <Button variant="outlined">📋 List</Button>
      </Box>
    </Box>
  );
};

export default OutageList;
