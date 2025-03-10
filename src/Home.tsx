import { Box } from "@mui/material";
import { useAdmin } from "./AdminContext";

const Home = () => {
  const { isAdmin } = useAdmin();

  const iframeSrc = isAdmin
    ? "https://staging.d5uniwdfp0ytm.amplifyapp.com/"
    : "https://staging.d3hjjykamqdvpx.amplifyapp.com/";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative", mt: 3, marginTop: "5em"}}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="ArcGIS Outages Map"
        />
      </Box>
    </Box>
  );
};

export default Home;
