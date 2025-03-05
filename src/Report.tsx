import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";

const Report: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative", mt: 3, marginTop: "5em"}}>
        <iframe
          src="https://staging.d3hjjykamqdvpx.amplifyapp.com/?page=Page"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="Outage Map"
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", p: 3, alignItems: "center", backgroundColor: "#fff" }}>
        <Typography onClick={() => navigate("/tutorial")} sx={{ cursor: "pointer", textDecoration: "underline" }}>
          Click here to watch a tutorial video
        </Typography>
        <Button variant="contained" onClick={() => navigate("/report-form")}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Report;
