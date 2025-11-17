// backend/server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// 你的和风天气 API key
const QWEATHER_KEY = '5ce4044da3f948e5990340f538565d03';

app.get('/api/weather', async (req, res) => {
  
  const url = `https://pc4y3jummu.re.qweatherapi.com/v7/weather/now?location=101010100&key=5ce4044da3f948e5990340f538565d03`
;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '200') {
      console.error('和风天气错误：', data);
    }

    // 允许前端访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    console.error('后端请求出错：', err);
    res.status(500).json({ error: '无法获取天气数据' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务器已启动：http://localhost:${PORT}`);
});