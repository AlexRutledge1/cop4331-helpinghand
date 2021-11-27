import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import HomePage from './components/homepageold/homepageold.js';
import axios from "axios"
import { Provider as ReduxProvider } from 'react-redux';
import store from './redux/store';
axios.defaults.baseURL = 'https://helpinghand-cop4331.herokuapp.com/';

if (process.env.NODE_ENV === "production"){
  App.use(express.static("build"));
  App.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname,  "build", "index.html"));
  });
}

ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
