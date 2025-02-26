import Container from '@mui/material';

function Tutorial() {
	return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Container maxWidth="xs">
	    <div>
		  <p>PLACEHOLDER: this page will contain a tutorial video about how to use outage reporting tool</p>
		</div>
		<div>
		  <a href="/">
			<p>Navigate back to the main page</p>
		  </a>
		</div>
      </Container>
    </div>
	);
};

export default Tutorial;
