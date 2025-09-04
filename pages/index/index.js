// pages/index/index.js
const app = getApp()
const API_URL = 'http://localhost:3000/api/lines'; // Our backend API

Page({
  data: {
    lines: [],
    loading: true,
    error: null
  },

  onLoad: function () {
    this.fetchLines();
  },

  fetchLines: function() {
    this.setData({ loading: true, error: null });
    wx.request({
      url: API_URL,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            lines: res.data,
            loading: false
          });
        } else {
          this.setData({
            error: `服务器错误 (状态码: ${res.statusCode})`,
            loading: false
          });
        }
      },
      fail: (err) => {
        console.error('Request failed', err);
        this.setData({
          error: '无法连接到服务器，请检查网络或服务器状态。',
          loading: false
        });
      }
    })
  },

  // Navigate to detail page
  goToDetail: function(event) {
    const lineIndex = event.currentTarget.dataset.index;
    const lineData = this.data.lines[lineIndex];

    // Pass the whole line data as a JSON string
    wx.navigateTo({
      url: `/pages/detail/detail?lineData=${JSON.stringify(lineData)}`
    })
  }
})
