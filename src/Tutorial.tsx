import { useNavigate } from "react-router-dom";
import { Container, Button } from '@mui/material';

function Tutorial() {
    const navigate = useNavigate();
	return (
	  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
	    <Container maxWidth="xs">
		  <div>
		    <p>PLACEHOLDER: this page will contain a tutorial video about how to use outage reporting tool</p>
		  </div>
		  <div>
		    <Button variant="contained" onClick={() => navigate("/report-outage")}>
			  Back to the outage reporting page
			</Button>
		  </div>
		</Container>
	  </div>
	);
};

export default Tutorial;
