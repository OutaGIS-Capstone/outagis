import { useNavigate } from "react-router-dom";
import { Container, Button } from "@mui/material";

function Tutorial() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px", padding: "20px" }}>
      <Container maxWidth="md">
        <div style={{ textAlign: "center" }}>
          <iframe
            width="900"
            height="500"
            src="https://www.youtube.com/embed/7tS5gF9MI1Y"
            title="Tutorial Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ maxWidth: "100%", borderRadius: "10px" }}
          ></iframe>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="contained" onClick={() => navigate("/report-outage")}>
            Back to the outage reporting page
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default Tutorial;
