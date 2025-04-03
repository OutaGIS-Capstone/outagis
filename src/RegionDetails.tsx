import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Link, TablePagination } from "@mui/material";

const RegionDetails: React.FC = () => {
  const { regionName } = useParams<{ regionName: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [outageData, setOutageData] = useState<unknown[]>([]); 
  const [, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    setLoading(true);
    fetch(`https://gqls5yelo8.execute-api.ca-central-1.amazonaws.com/default/outagis-retrieve_outages_by_region?region=${regionName}`)
      .then((response) => response.json())
      .then((data) => {
        setOutageData(data);  
        console.log(data);
        const outageIds = data.map((outage: any) => outage._id);
        localStorage.setItem("outageList", JSON.stringify(outageIds));
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, [regionName]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };  

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOnMap = (outageId: string) => {
    localStorage.setItem("selectedOutageId", outageId);
    console.log(outageId);
    navigate(`/outage/${outageId}`);
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>⬅ Back</Button>
      <Typography variant="h5" gutterBottom>{regionName}</Typography>
      
      <Typography variant="body1">
        Total customers affected: {outageData.reduce((sum: any, o: any) => sum + (isNaN(Number(o.population_affected)) ? 0 : Number(o.population_affected)), 0)}
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Location</strong></TableCell>
              <TableCell align="center"><strong>Description</strong></TableCell>
              <TableCell align="center"><strong>Cause</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Affected</strong></TableCell>
              <TableCell align="center"><strong>Estimated Time of Arrival</strong></TableCell>
              <TableCell align="center"><strong>Last Updated</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outageData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((outage: any) => (
              <TableRow key={outage._id}>
                <TableCell align="center" sx={{ wordWrap: 'break-word', maxWidth: '150px' }}>
                  {outage.geojson && outage.geojson.geometry && outage.geojson.type == "Point" ? `${outage.geojson.geometry.coordinates[0]}, ${outage.geojson.geometry.coordinates[1]}` : "Polygon"} 
                  <br />
                  <Link href="#" onClick={() => handleViewOnMap(outage._id)}>View on map</Link>
                </TableCell>
                <TableCell align="center" sx={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                  {outage.description}
                </TableCell>
                <TableCell align="center" sx={{ wordWrap: 'break-word', maxWidth: '150px' }}>
                  {outage.cause}
                </TableCell>
                <TableCell align="center">{outage.status}</TableCell>
                <TableCell align="center">{outage.population_affected}</TableCell>
                <TableCell align="center">{new Date(outage.eta).toLocaleString()}</TableCell>
                <TableCell align="center">{new Date(outage.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={outageData.length}
        rowsPerPage={-1}  
        page={page}
        onPageChange={handleChangePage} 
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

    </Box>
  );
};

export default RegionDetails;
