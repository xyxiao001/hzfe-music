import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import 'antd/dist/antd.css';
import localforage from 'localforage';

localforage.config({
  name: 'HZFE-MUSIC',
});



ReactDOM.render(
  <App />,
  // <React.StrictMode>
  // </React.StrictMode>,
  document.getElementById('root')
);
