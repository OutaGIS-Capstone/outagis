import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Tabs from "../components/Tabs";

import './Home.css';

function Home() {
	const navigateTo = useNavigate();

	function openTab(evt, tabName) {
		var i, tabcontent, tablinks;
		console.log(tabName); // DEBUG
		tabcontent = document.getElementsByClassName("tabcontent");
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = "none";
		}
		tablinks = document.getElementsByClassName("tablinks");
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
		console.log(document.getElementById(tabName))
		console.log(document.getElementById(tabName).style)
		console.log(document.getElementById(tabName).style.display)
		document.getElementById(tabName).style.display = "block";
		evt.currentTarget.className += " active";
	}

	return (
		<div>
			<Tabs>
				<div label="View Outage Map">
					<div className="map-container">
						<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-123.29681396484376%2C49.194717870320666%2C-123.03726196289064%2C49.320422679265924&amp;layer=mapnik" title="Open Street Maps Placeholder"></iframe>
					</div>
				</div>
				<div label="Report an Outage">
					<div className="map-placeholder">
						<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-123.29681396484376%2C49.194717870320666%2C-123.03726196289064%2C49.320422679265924&amp;layer=mapnik" title="Outage Reporting Map Placeholder"></iframe>
					</div>
					<div className="next-nav">
						<div className="help-link">
							<a href="/help">
								<p>Click here to watch a tutorial video</p>
							</a>
						</div>
						<div className="next-button">
							<button onClick={() => navigateTo('/info')}>Next</button>
						</div>
					</div>
				</div>
			</Tabs>
		</div>
	);
}

export default Home;
