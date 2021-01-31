const { override, addLessLoader } = require('customize-cra');

module.exports = override(
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      // 定义全局变量地方
      modifyVars: {},
    },
  }),
);