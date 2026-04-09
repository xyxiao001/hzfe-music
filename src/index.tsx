import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import localforage from 'localforage';
import { Button, ConfigProvider, notification } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css'
import './common.less'
import './index.scss';
import { registerSW } from 'virtual:pwa-register';

localforage.config({
  name: 'HZFE-MUSIC',
});

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      notification.success({
        message: '已支持离线使用',
        duration: 2,
      });
    },
    onNeedRefresh() {
      const key = 'pwa-update';
      notification.info({
        key,
        message: '发现新版本',
        description: '点击“刷新”即可更新到最新版本',
        btn: (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              notification.destroy(key);
              void updateSW(true);
            }}
          >
            刷新
          </Button>
        ),
        duration: 0,
      });
    },
  });
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element not found')
}
createRoot(rootEl).render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
)
