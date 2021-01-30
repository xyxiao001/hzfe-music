import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.scss';
import App from './App';
import localforage from 'localforage';
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

localforage.config({
  name: 'HZFE-MUSIC',
});



ReactDOM.render(
  <ConfigProvider locale={zh_CN}>
    <App />
  </ConfigProvider>,
  // <React.StrictMode>
  // </React.StrictMode>,
  document.getElementById('root')
);
