import React, { useState, useEffect, startTransition, useMemo } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, Alert, TablePagination, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OutageList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [outagesData, setOutagesData] = useState<any[]>([]); 
  const [, setLoading] = useState(false); 
  const [, setError] = useState<string | null>(null); 
  const [recentOutage, setRecentOutage] = useState<any>(null); 

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };  

  const paginatedRows = useMemo(() => {
    return outagesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [outagesData, page, rowsPerPage]);

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

  const STATIC_REGIONS = [
    "Regional District of Bulkley-Nechako",
    "Cariboo Regional District",
    "Regional District of Fraser-Fort George",
    "Regional District of Kitimat-Stikine",
    "Peace River Regional District",
    "North Coast Regional District",
    "Regional District of Central Okanagan",
    "Fraser Valley Regional District",
    "Metro Vancouver Regional District",
    "Regional District of Okanagan-Similkameen",
    "Squamish-Lillooet Regional District",
    "Thompson-Nicola Regional District",
    "Regional District of Central Kootenay",
    "Columbia Shuswap Regional District",
    "Regional District of East Kootenay",
    "Regional District of Kootenay Boundary",
    "Regional District of North Okanagan",
    "Regional District of Alberni-Clayoquot",
    "Capital Regional District",
    "Central Coast Regional District",
    "Comox Valley Regional District",
    "Cowichan Valley Regional District",
    "Regional District of Mount Waddington",
    "Regional District of Nanaimo",
    "qathet Regional District",
    "Sunshine Coast Regional District",
    "Strathcona Regional District",
    "Stikine Region (Unincorporated)",
  ];
  
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // Abort after 5 seconds
  
    fetch("https://ceu2tpg6ok.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_all_outages", {
      signal: controller.signal
    })
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
  
        startTransition(() => {
          setOutagesData(groupedOutages);
        });        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Falling back to static region list due to error or timeout:", error);
        const staticData = STATIC_REGIONS.map((region) => ({
          region,
          outages: 0,
          customers: 0,
        }));
        setOutagesData(staticData);
        setError("Failed to load dynamic outage data. Showing static list.");
        setLoading(false);
      });
  
    return () => clearTimeout(timeout);
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
              <small>Last updated: {new Date(recentOutage.timestamp_created).toLocaleString()}</small>
            </Typography>
          </Alert>
        )}

      {outagesData.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography variant="body2" mt={2}>Loading outage data...</Typography>
        </Box>
      ) : (
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
              {paginatedRows.map((row, index) => (
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
          )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={outagesData.length}
          rowsPerPage={rowsPerPage}  
          page={page}
          onPageChange={handleChangePage} 
          onRowsPerPageChange={handleChangeRowsPerPage}
        />


      </Box>
    </Box>
  );
};

export default OutageList;
