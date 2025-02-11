// import React, { useEffect, useState } from "react";
// import { Container, Typography, MenuItem, FormControl, Select, Box, Grid, Card, CardContent } from "@mui/material";
// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "../amplify/data/resource";

// const client = generateClient<Schema>();

// const areas = ["Downtown", "Kitsilano", "Burnaby", "Richmond", "North Vancouver"];
// const statuses = ["Active", "Resolved", "Scheduled"];

// const OutageList: React.FC = () => {
//   const [outages, setOutages] = useState<Schema["Outage"][]>([]);
//   const [selectedArea, setSelectedArea] = useState<string>("");
//   const [selectedStatus, setSelectedStatus] = useState<string>("");

//   useEffect(() => {
//     const fetchOutages = async () => {
//       try {
//         const allOutages = await client.models.Outage.list();
//         setOutages(allOutages.data);
//       } catch (error) {
//         console.error("Error fetching outages:", error);
//       }
//     };

//     fetchOutages();
//   }, []);

//   const filteredOutages = outages.filter(outage => 
//     (selectedArea ? outage.area === selectedArea : true) &&
//     (selectedStatus ? outage.status === selectedStatus : true)
//   );

//   <iframe
//   src="https://experience.arcgis.com/experience/8bd8d16d1ebf4feca1e3e140544ebf52/"
//   width="100%"
//   height="600px"
//   style={{ border: "none" }}
// />
//     // <Container>
//     //   <Typography variant="h4" sx={{ my: 3 }}>
//     //     Outage List
//     //   </Typography>
//     //   <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
//     //     <FormControl sx={{ minWidth: 150 }}>
//     //       <Select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} displayEmpty>
//     //         <MenuItem value=""><em>All Areas</em></MenuItem>
//     //         {areas.map(area => <MenuItem key={area} value={area}>{area}</MenuItem>)}
//     //       </Select>
//     //     </FormControl>

//     //     <FormControl sx={{ minWidth: 150 }}>
//     //       <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} displayEmpty>
//     //         <MenuItem value=""><em>All Statuses</em></MenuItem>
//     //         {statuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
//     //       </Select>
//     //     </FormControl>
//     //   </Box>

//     //   <Grid container spacing={3}>
//     //     {filteredOutages.map(outage => (
//     //       <Grid item xs={12} md={6} key={outage.id}>
//     //         <Card>
//     //           <CardContent>
//     //             <Typography variant="h6">{outage.area}</Typography>
//     //             <Typography>Status: {outage.status}</Typography>
//     //             <Typography>Start Time: {outage.startTime}</Typography>
//     //             <Typography>Estimated End Time: {outage.estimatedEndTime || "TBD"}</Typography>
//     //           </CardContent>
//     //         </Card>
//     //       </Grid>
//     //     ))}
//     //   </Grid>
//     // </Container>
// //   );
// };

// export default OutageList;
