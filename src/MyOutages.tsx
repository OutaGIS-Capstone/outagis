import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, CircularProgress, Alert } from "@mui/material";
import { useAuthenticator } from "@aws-amplify/ui-react";

const MyOutages: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [outages, setOutages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Static data
      const staticOutages = [
        {
          region: "Vancouver",
          municipality: "Vancouver",
          offSince: "2025-03-10 08:00",
          status: "Outage",
          area: "East Vancouver",
          affected: "1000 homes",
          cause: "Storm damage",
          reportedAt: "2025-03-10 09:00",
        },
        {
          region: "Burnaby",
          municipality: "Burnaby",
          offSince: "2025-03-10 10:00",
          status: "Restored",
          area: "North Burnaby",
          affected: "500 homes",
          cause: "Equipment failure",
          reportedAt: "2025-03-10 10:30",
        },
      ];

      setOutages(staticOutages);
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return <Typography variant="h6">You must be logged in to view this page.</Typography>;
  }

  const getStatusColor = (status: string) => {
    if (status === "Outage") {
      return { backgroundColor: "#f8d7da", color: "#721c24" }; // Red for ongoing outage
    }
    if (status === "Restored") {
      return { backgroundColor: "#d4edda", color: "#155724" }; // Green for restored outages
    }
    return {}; // Default style for other statuses
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3, marginTop: "5em" }}>
      <Typography variant="h4" gutterBottom>
        My Reported Outages
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : outages.length === 0 ? (
        <Typography>No reported outages found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ my: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"><strong>Region</strong></TableCell>
                <TableCell align="center"><strong>Municipality</strong></TableCell>
                <TableCell align="center"><strong>Off Since</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Area</strong></TableCell>
                <TableCell align="center"><strong>Affected</strong></TableCell>
                <TableCell align="center"><strong>Cause</strong></TableCell>
                <TableCell align="center"><strong>Reported</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outages.map((outage, index) => (
                <TableRow key={index} sx={getStatusColor(outage.status)}>
                  <TableCell align="center">{outage.region}</TableCell>
                  <TableCell align="center">{outage.municipality}</TableCell>
                  <TableCell align="center">{outage.offSince}</TableCell>
                  <TableCell align="center">{outage.status}</TableCell>
                  <TableCell align="center">
                    {outage.area} <br />
                    <Link href="#">View on map</Link>
                  </TableCell>
                  <TableCell align="center">{outage.affected}</TableCell>
                  <TableCell align="center">{outage.cause}</TableCell>
                  <TableCell align="center">{outage.reportedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MyOutages;
