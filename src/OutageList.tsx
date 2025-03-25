import React, { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, Alert, TablePagination } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OutageList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [outagesData, setOutagesData] = useState<any[]>([]); 
  const [, setLoading] = useState(false); 
  const [, setError] = useState<string | null>(null); 
  const [recentOutage, setRecentOutage] = useState<any>(null); 

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setLoading(true);
    fetch("https://10yztw42id.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outage_most_recent_n?n=1")
      .then((response) => response.json())
      .then((data) => {
        const recentOutage = data[0];
        setRecentOutage(recentOutage);
        setLoading(false);
      })
      .catch((error) => {
		console.error(error);
        setError("Failed to load recent outage data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("https://ceu2tpg6ok.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_all_outages")
      .then((response) => response.json())
      .then((data) => {
        const regionOutages = data.reduce((acc: any, outage: any) => {
          const region = outage.region || "Unknown Region"; 
          if (!acc[region]) acc[region] = { outages: 0, customers: 0 }; 
          acc[region].outages += 1;
          acc[region].customers += 1;
          return acc;
        }, {});

        const groupedOutages = Object.entries(regionOutages).map(([region, { outages, customers }]) => ({
          region,
          outages,
          customers,
        }));

        setOutagesData(groupedOutages);
        setLoading(false);
      })
      .catch((error) => {
		console.error(error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ maxWidth: 900, margin: "auto", padding: 3, marginTop: "5em" }}>
        <Typography variant="h4" gutterBottom>
          Report an Outage
        </Typography>

        <Typography variant="body1" gutterBottom>
          Lost power? Check the outage map to see if we’re aware of the outage. If your outage isn’t shown, call{" "}
          <strong>1 800 XXX XXXX</strong> on your mobile or
          <Button
            variant="text"
            sx={{
              textDecorationLine: "underline",
              textTransform: "none",
            }}
            onClick={() => navigate("/report-outage")}
          >
            report it online.
          </Button>
        </Typography>

        {recentOutage && (
          <Alert severity="error" sx={{ my: 2 }}>
            <Typography variant="h6">⚠️ Regional alert</Typography>
            <Typography>
              We have posted updates for: <strong>{recentOutage.region}</strong>
              <br />
              <small>Last updated: {new Date(recentOutage.timestamp).toLocaleString()}</small>
            </Typography>
          </Alert>
        )}

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
              {outagesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => navigate(`/region/${encodeURIComponent(row.region)}`)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <TableCell align="center">
                    <Link component="button" underline="hover">
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={outagesData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Typography variant="caption" display="block" gutterBottom>
          Last updated: Feb 5, 3:34 p.m.
        </Typography>
      </Box>
    </Box>
  );
};

export default OutageList;
