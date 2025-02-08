import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Box, Container, Typography } from "@mui/material";

const Report: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ mt: 10, position: "relative", mb: 2 }}>
        <iframe
          src="https://staging.d3hjjykamqdvpx.amplifyapp.com/?page=Page"
          width="100%"
          height="670em"
          style={{ border: "none" }}
          title="Outage Map"
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Typography sx={{ cursor: "pointer", textDecoration: "underline" }}>
          Click here to watch a tutorial video
        </Typography>
        <Button variant="contained" onClick={() => navigate("/report-form")}>
          Next
        </Button>
      </Box>
    </Container>
  );
};

export default Report;