// logs.js
const util = require('../../utils/util.js');

Page({
  data: {
    logs: [],
  },
  onLoad: function() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log) => util.formatTime(new Date(log))),
    });
  },
});
