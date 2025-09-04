// pages/detail/detail.js
Page({
  data: {
    line: null
  },

  onLoad: function (options) {
    if (options.lineData) {
      try {
        const lineData = JSON.parse(options.lineData);
        this.setData({
          line: lineData
        });

        // Set the navigation bar title to the line name
        wx.setNavigationBarTitle({
          title: lineData.lineName
        });

      } catch (e) {
        console.error("Failed to parse line data", e);
        // Handle error, e.g., show an error message or navigate back
        wx.showToast({
          title: '数据解析失败',
          icon: 'none'
        });
      }
    }
  }
})
