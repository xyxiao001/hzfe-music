import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import localforage from 'localforage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css'
import './common.less'
import './index.scss';

localforage.config({
  name: 'HZFE-MUSIC',
});

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element not found')
}
createRoot(rootEl).render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
)
