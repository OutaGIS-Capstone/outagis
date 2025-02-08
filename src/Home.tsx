import { Container, Typography } from "@mui/material";

const Home = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3 }}>
        Outages Map
      </Typography>
      <iframe
        src="https://staging.d3hjjykamqdvpx.amplifyapp.com/?page=Page"
        width="100%"
        height="600px"
        style={{ border: "none" }}
        title="ArcGIS Outages Map"
      />
    </Container>
  );
};

export default Home;
