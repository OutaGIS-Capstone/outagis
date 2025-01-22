import { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Home from './pages/Home';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Info from './pages/Info';
import Tabs from "./components/Tabs";
import Navbar from "./components/Navbar";

import "./App.css";

// URL routing reference: https://hygraph.com/blog/routing-in-react

function App() {
   return (
      <main>
	    <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/info" element={<Info />} />
         </Routes>
      </main>
   );
};

/*
const client = generateClient<Schema>();

function App() {
	const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

	useEffect(() => {
		client.models.Todo.observeQuery().subscribe({
		next: (data) => setTodos([...data.items]),
		});
	}, []);

	function createTodo() {
		client.models.Todo.create({ content: window.prompt("Todo content") });
	}

	function deleteTodo(id: string) {
		client.models.Todo.delete({ id })
	}

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
		<main>
		    <Navbar/>
			<div>
			  <Tabs>
				<div label="View Outage Map">
					<div className="map-container">
					<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-123.29681396484376%2C49.194717870320666%2C-123.03726196289064%2C49.320422679265924&amp;layer=mapnik" title="Open Street Maps Placeholder"></iframe>
					</div>
				</div>
				<div label="Report an Outage">
					<button onClick={createTodo}>+ new</button>
					<ul>
						{todos.map((todo) => (
							<li 
							onClick={() => deleteTodo(todo.id)}
							key={todo.id}>{todo.content}
							</li>
						))}
					</ul>
				</div>
			  </Tabs>
			</div>
		</main>
	);
}
*/

export default App;
