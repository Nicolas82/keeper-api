import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import "./index.css"
import browser from "webextension-polyfill";

console.log(browser.extension.getBackgroundPage());

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)