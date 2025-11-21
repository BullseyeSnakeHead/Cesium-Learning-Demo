import './style.css'
import * as Cesium from "cesium"
// 导入cesium包中的js文件和css文件引入项目 在node_modules-cesium-Build-Cesium目录下，将cesium文件拷贝到public目录下
// 引入其中的css文件widgets，可以再将这个css文件单独拿出来,放在src目录下
import './widgets.css'
// 静态导入
window.CESIUM_BASE_URL = '/Cesium'
// 挂载cesium盒子 // 这样挂载的cesium使用的是cesium官网的默认token，下边栏会提示要求创建个人token。在官网access token栏目中create token,右边栏拿到个人token
// 调用Cesium.Ion.defaultAccessToken替换个人的token
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(114.29,30.56,114.31,30.58)
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmM2RhY2M5NS02N2RiLTQ3ZGItOGRmYS0wOTJiMjRiNzAwNGQiLCJpZCI6MzM4NTk0LCJpYXQiOjE3NTcwNTA2ODR9.aqGrWNNBmWPRyakG0FYKX84rfg8AUYXkdqx8Chh2nrk'

const viewer = new Cesium.Viewer('cesiumContainer',{
  //（纯净流）
  // 放大镜（搜索）显示/隐藏
  geocoder:false,
  // 归噶按钮显示/隐藏（这个归噶时归美国开发部的地址）
  homeButton:false,
  // 默认信息框
  infoBox:false,
  // 场景信息框(切换3d/2d平面)
  sceneModePicker:false,
  // 图层切换显示/隐藏
  baseLayerPicker:false,
  // 导航说明？按钮
  navigationHelpButton:false,
  // 动画按钮
  animation:true,
  // 时间线
  timeline:true,
  // 全屏按钮
  fullscreenButton:false,
   imageryProvider:false
  // cesium的logo隐藏不是在这儿配置的
})

viewer.scene.globe.enableLighting = false;
viewer.scene.light = new Cesium.DirectionalLight({
  direction: new Cesium.Cartesian3(1.0, 1.0, -0.5)
});
viewer.scene.highDynamicRange = true;

// 轻提示 ai封装
  function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// 以下是ai提供的纠偏算法，需要在所有加载的json文件之前调用
// ===== 坐标系转换：WGS84 -> GCJ02 =====
function outOfChina(lon, lat) {
  return !(lon > 73.66 && lon < 135.05 && lat > 3.86 && lat < 53.55);
}

function transformLat(x, y) {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y +
    0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) +
      20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(y * Math.PI) +
      40.0 * Math.sin((y / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * Math.PI) +
      320.0 * Math.sin((y * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  return ret;
}

function transformLon(x, y) {
  let ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) +
      20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(x * Math.PI) +
      40.0 * Math.sin((x / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * Math.PI) +
      300.0 * Math.sin((x / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return ret;
}

function wgs84ToGcj02(lon, lat) {
  if (outOfChina(lon, lat)) return [lon, lat];
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat =
    (dLat * 180.0) /
    (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLon =
    (dLon * 180.0) /
    ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  const mgLat = lat + dLat;
  const mgLon = lon + dLon;
  return [mgLon, mgLat];
}


// 假数据ai提供，成都各区县简介，附图片
const chengduDistricts = [
  {
    name: "锦江区",
    text: "锦江区位于成都市中心东南部，是成都传统的核心城区之一，商贸繁荣、生活便利。区内有合江亭、兰桂坊等地标，城市绿化率高，是集文化、休闲、商务为一体的现代都市区域。",
    image: '/成都区县图片/锦江区.jpeg',
    position: '104.111106,30.614983,30000'
  },
  {
    name: "青羊区",
    text: "青羊区是成都的历史文化中心，拥有武侯祠、杜甫草堂等著名景点。区内文化底蕴深厚，老城区风貌保存较好，同时也是政府机关和教育资源集中的重要区域。",
    image: "/成都区县图片/青羊区.jpg",
    position: '103.982226,30.681072,30000'
  },
  {
    name: "金牛区",
    text: "金牛区位于成都市西北部，是老工业基地与现代商圈并存的区域。区内交通便利，成都火车站、西南交大等坐落于此，是城市交通与物流的重要枢纽。",
    image: "/成都区县图片/金牛区.jpeg",
    position: '104.050754,30.730396,40000'
  },
  {
    name: "武侯区",
    text: "武侯区以历史名人诸葛亮命名，是成都重要的科教文化区。区内有四川大学望江校区和武侯祠，现代商业与文化景观交融，是成都最具人气的城区之一。",
    image: "/成都区县图片/武侯区.jpg",
    position: '103.999104,30.626814,50000'
  },
  {
    name: "成华区",
    text: "成华区地处成都市东北部，近年来发展迅速，文化氛围浓厚。区内有成都动物园、建设中的东郊记忆文创园，是老工业区转型升级的典型代表。",
    image: "/成都区县图片/成华区.jpg",
    position: '104.147357,30.696101,60000'
  },
  {
    name: "龙泉驿区",
    text: "龙泉驿区位于成都市东部，是成都汽车制造产业的重要基地。区内风景秀丽，有龙泉山城市森林公园和桃花沟，每年春季的桃花节吸引大量游客。",
    image: "/成都区县图片/龙泉驿区.jpg",
    position: '104.307646,30.606944,120000'
  },
  {
    name: "青白江区",
    text: "青白江区位于成都东北部，是国家级铁路港和国际陆港所在地。该区以现代物流业和对外开放为特色，正在建设成都国际铁路港经济功能区。",
    image: "/成都区县图片/青白江区.jpg",
    position: '104.335039,30.793682,80000'
  },
  {
    name: "新都区",
    text: "新都区位于成都市北部，拥有丰富的教育资源和工业基础。新都老城区文化底蕴深厚，是唐代诗人杨升庵的故乡，也是成都的北部交通枢纽。",
    image: "/成都区县图片/新都区.jpeg",
    position: '104.150000,30.830000,75000'
  },
  {
    name: "温江区",
    text: "温江区位于成都西部，是生态宜居的现代化城区。区内绿化率高，城市环境优美，以“公园城市”建设为特色，吸引了大量高新技术企业与教育机构入驻。",
    image: "/成都区县图片/温江区.jpg",
    position: '103.803676,30.730061,100000'
  },
  {
    name: "双流县",
    text: "双流区是成都的航空门户所在地，成都天府国际机场和双流国际机场均位于此。区内交通便利，产业发展迅速，是成都南部的重要经济增长极。",
    image: "/成都区县图片/双流区.jpg",
    position: '103.962130,30.491716,100000'
  },
  {
    name: "郫都区",
    text: "郫都区位于成都市西北部，是川菜文化的重要发源地，郫县豆瓣享誉全国。区内高校众多，科教资源丰富，是成都重要的创新科技产业聚集区。",
    image: "/成都区县图片/郫都区.jpg",
    position: '103.860066,30.861549,100000'
  },
  {
    name: "新津县",
    text: "新津区地处成都南部，是城乡融合发展的典范区域。境内山水资源丰富，滨江生态带和花舞人间等景点吸引众多游客，生活节奏舒缓宜人。",
    image: "/成都区县图片/新津区.jpg",
    position: '103.832229,30.429770,80000'
  },
  {
    name: "都江堰市",
    text: "都江堰市位于成都西北部，拥有世界文化遗产都江堰水利工程。这里自然环境优美，是成都重要的生态屏障和旅游胜地，常被誉为“天府之源”。",
    image: "/成都区县图片/都江堰区.jpg",
    position: '103.617000,31.040000,140000'
  },
  {
    name: "彭州市",
    text: "彭州市地处成都西北部，山水环绕、生态优良。以大熊猫国家公园和九尺古镇闻名，是集生态旅游与农产品加工于一体的绿色城市。",
    image: "/成都区县图片/彭州市.jpeg",
    position: '103.870623,31.174394,140000'
  },
  {
    name: "邛崃市",
    text: "邛崃市位于成都西南部，历史悠久、文化底蕴深厚。盛产白酒，是中国白酒金三角的重要组成部分，同时拥有天台山等自然景区。",
    image: "/成都区县图片/邛崃市.jpg",
    position: '103.470000,30.418000,100000'
  },
  {
    name: "崇州市",
    text: "崇州市位于成都西部，以生态农业和文化旅游闻名。区内有街子古镇、青城后山等景点，是成都居民休闲度假的热门去处。",
    image: "/成都区县图片/崇州市.jpg",
    position: '103.488884,30.735809,120000'
  },
  {
    name: "金堂县",
    text: "金堂县位于成都东北部，岷江穿境而过。这里生态环境优美，交通便利，依托天府绿道和龙泉山脉，正在建设绿色宜居的生态城市。",
    image: "/成都区县图片/金堂县.jpg",
    position: '104.634447,30.725583,100000'
  },
  {
    name: "大邑县",
    text: "大邑县位于成都西南部，文化与自然景观丰富。境内有刘氏庄园、安仁古镇等名胜古迹，是巴蜀文化的重要发源地之一。",
    image: "/成都区县图片/大邑县.jpg",
    position: '103.341495,30.63277,120000'
  },
  {
    name: "蒲江县",
    text: "蒲江县位于成都南部，生态环境优越，以猕猴桃、茶叶等特色农业闻名。区内山清水秀，是成都市重要的生态农业示范区。",
    image: "/成都区县图片/浦江县.jpg",
    position: '103.500000,30.250000,30000'
  },
  {
    name: "简阳市",
    text: "简阳市位于成都东部，是天府国际机场所在地之一。区内交通便捷，正加速融入成都主城区经济圈，成为东部发展的重要支点。",
    image: "/成都区县图片/简阳市.jpg",
    position: '104.624988,30.427320,150000'
  },
  {
    name: "高新东区",
    text: "成都高新区是国家级高新技术产业开发区，聚集了大量科技企业与创新人才。区内环境优美、生活便利，是成都现代化建设的代表区域。",
    image: "/成都区县图片/高新区.jpg",
    position: '104.380411,30.307584,100000'
  },
  {
    name: "高新南区",
    text: "成都高新区是国家级高新技术产业开发区，聚集了大量科技企业与创新人才。区内环境优美、生活便利，是成都现代化建设的代表区域。",
    image: "/成都区县图片/高新区.jpg",
    position: '104.056247,30.574429,60000'
  },
  {
    name: "天府新区",
    text: "天府新区是国家级新区，也是成都未来发展的核心引擎。规划现代化城市格局，拥有金融城、科学城等重点功能区，代表成都的未来形象。",
    image: "/成都区县图片/天府新区.jpg",
    position: '104.111580,30.393290,100000'
  },
  {
    name: "东部新区",
    text: "东部新区是成都新设立的战略功能区，位于天府国际机场周边。以航空、智能制造、临空经济为核心，正在成为成都新的增长极。",
    image: "/成都区县图片/东部新区.jpg",
    position: '104.100000,30.500000,30000'
  }
];




const gaodeImageryProvider = new Cesium.UrlTemplateImageryProvider({
  // url必传，其他name啥的可选,注意这儿高德的url和openlayers的url有区别，ol中是平面的数据源，这里是地球覆被的数据源
  url:'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  name:'高德矢量'
})
// 将高德底图（矢量）添加到viewer中
const shiLiangMap = viewer.imageryLayers.addImageryProvider(gaodeImageryProvider)

// 加载高德栅格底图
const gaodeImageryProvider6 = new Cesium.UrlTemplateImageryProvider({
  url:'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  name:'高德栅格'
})
// 将高德底图（栅格）添加到viewer中
const layer2 = viewer.imageryLayers.addImageryProvider(gaodeImageryProvider6)
// 后添加的底图会覆盖之前添加的底图
// 所以可以给后添加的图添加半透明.alpha方法，使其把底下的图层也显示出来
// 注意此处，如果仅仅添加栅格地图，就不能设置透明度，否则呈现蓝紫色
layer2.alpha = 0.5

viewer.camera.flyTo({
  destination:Cesium.Cartesian3.fromDegrees(104.0667,30.667,300000),
  duration:1.5
})


// viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
// // osm默认建筑物模型，这个是cesium自带的，很粗略，涉及的建筑物也很少
//  const osmBuildings= await Cesium.createOsmBuildingsAsync();
// viewer.scene.primitives.add(osmBuildings);

// 30m高程切片
const terrainProvider = await Cesium.createWorldTerrainAsync({
  url:'../public/成都切片'
});
viewer.terrainProvider = terrainProvider
viewer.scene.globe.depthTestAgainstTerrain = false

// 天气效果
// 获取天气，来源-和风天气，url中带api host以及key需要配置，fetch()拿到
const fetchWeather = async () => {
  const location = '101270101'; // 成都的官方城市标准代码
  const key = '5ce4044da3f948e5990340f538565d03';
  const url = `https://pc4y3jummu.re.qweatherapi.com/v7/weather/now?location=${location}&key=${key}`;
  const response = await fetch(url);
  const data = await response.json();
  // console.log(data);
  const text = data.now.text
  // console.log(text);
  let condition = data.now.text
  let feelsLike = data.now.feelsLike
  // console.log(condition);
  const now = document.querySelector('.now')
  const tem = document.querySelector('.tem')
  now.innerHTML = condition
  tem.innerHTML = feelsLike

  // 天气效果——雨
function startRain () {
  const canvas = document.getElementById('weatherCanvas')
  // canvans的2d绘图
  const ctx = canvas.getContext("2d")
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight
  // 空数组存放“雨滴” count表示雨滴的数量
  const drops = []
  const count = 400

  // 遍历count添加雨滴,追加给雨滴数组
  for(let i = 0; i < count ;i++) {
    drops.push ({
      x: Math.random() * width,  //随机x位置
      y: Math.random() * height, //随机y位置
      speed: 4 + Math.random() * 4, //初始速度，初速度不能为0，4+随机数
      length: 40 + Math.random() * 10 //随机长度（大小）  
    })
  }

  // 动画函数
  function animate () {
    // 清除画布上一帧渲染的内容（必要，除非需要虚影效果）
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = "rgba(200,200,255,0.3)"; //雨滴颜色
    ctx.lineWidth = 2.4;
    drops.forEach(drop => {
      ctx.beginPath()  //开启路径
      ctx.moveTo(drop.x,drop.y) //路径轨迹
      ctx.lineTo(drop.x,drop.y + drop.length) //雨滴
      ctx.stroke();
      drop.y += drop.speed;
      if (drop.y > height) {
        drop.y = -20;
        drop.x = Math.random() * width;
      }
    })
    requestAnimationFrame(animate); //请求动画函数
  }
  animate(); //与上述请求形成闭循环
}
// 调用记得换位置到和风api下面的if里面
// startRain()

// 天气效果——阴（多云） 原生css+keyframe动画贴图实现的
function startFog() {
  const canvas = document.getElementById("weatherCanvas");
  canvas.classList.add("fog");
}
// 调用记得换位置到和风api下面的if里面
// startFog()

// 天气效果——雾/霾 改了一下阴（多云）的css样式的opacity
function startSmog() {
  const canvas = document.getElementById("weatherCanvas");
  canvas.classList.add("smog");
}
// startSmog()

// 天气效果——雪/雨夹雪 AI
function startSnow() {
  const canvas = document.getElementById("weatherCanvas");
  const ctx = canvas.getContext("2d");

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight - 60;

  const flakes = [];
  const count = 200;   // 雪花数量

  for (let i = 0; i < count; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 2 + Math.random() * 4,           // 雪花大小
      speed: 1.5 + Math.random() * 1.5,    // 下落速度
      drift: (Math.random() - 0.5) * 1.2   // 左右飘动幅度
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; // 白色雪花
    flakes.forEach(f => {
      // 绘制雪花
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      // 下落
      f.y += f.speed;
      f.x += f.drift;       // 左右飘动
      // 到底部后重新生成
      if (f.y > height) {
        f.y = -10;
        f.x = Math.random() * width;
      }

      // 避免雪花一直飘到外面
      if (f.x > width) f.x = 0;
      if (f.x < 0) f.x = width;
    });

    requestAnimationFrame(animate);
  }
  animate();
}
// startSnow()

// 晴天效果
function startSunny() {
  const canvas = document.getElementById("weatherCanvas");
  canvas.classList.add("sunny");
}
// startSunny()

// 注意这里获取condition是异步的，如果将condition写作全局变量，即便在外部也是拿不到这个全局变量的，除非asyc await
// 所以这里全部写在这个异步操作里面了
if (text.includes("雨") || text.includes("阵雨")) {
startRain()
} else if (text.includes("雪") || text.includes("雨夹雪")) {
startSnow()
} else if (text.includes("雾") || text.includes("霾")) {
startFog()
} else if (text.includes("阴") || text.includes("多云") ) {
startSmog()
} else if (text.includes("晴")) {
startSunny()
} else {
startSunny()
}
}
fetchWeather()


// 控制天气效果的显隐按钮（右上角）
// 这一部分有几个点：
// 1.开关实现显隐用classList.toggle非常方便，自动判断是否添加了相应类，如果无则添加，有就移除
// 2.id名和类名在css里面可以连写，#XXX.YYY都是可以的。
// 3.可以用isXXX对添加/移除的状态返回的布尔值进行判断，默认状态时false，点击一次的状态是true
const weather = document.querySelector('.weather')
weather.addEventListener('click', function () {
const weatherCanvas = document.getElementById('weatherCanvas')
const isHidden = weatherCanvas.classList.toggle('hidden')
const isActive = this.classList.toggle('active')
if(isHidden && isActive) {
  showToast('关闭天气效果')
}else {
  showToast('开启天气效果')
}
})


let districtDataSource
let entitiesA 
// ai写的，非常巧妙
// ==========================
// 成都区县交互逻辑优化版

Cesium.GeoJsonDataSource.load('/筛选/筛选.geojson', {
  fill: Cesium.Color.SKYBLUE.withAlpha(0.6),
  stroke: Cesium.Color.YELLOW.withAlpha(0.8),
}).then((dataSource) => {
  viewer.dataSources.add(dataSource);
  districtDataSource = dataSource;
  dataSource.show = false;

  const entities = dataSource.entities.values;
  entitiesA = entities;

  const right = document.querySelector('.right');

  // ---------- 状态缓存 ----------
  let lastPickedEntity = null;         // 上一次选中的区县
  let currentDistrictLabel = null;     // 当前区县名称标签
  let currentDistrictData = null;      // 当前区县数据（用于视域控制）

  // ---------- 注册全局相机监听（仅一次） ----------
  viewer.camera.changed.addEventListener(() => {
    if (!currentDistrictLabel || !currentDistrictData) return;
    const cameraPosition = viewer.camera.positionCartographic;
    const lonNow = Cesium.Math.toDegrees(cameraPosition.longitude);
    const latNow = Cesium.Math.toDegrees(cameraPosition.latitude);
    const heightNow = cameraPosition.height;

    const [lon, lat, baseHeight] = currentDistrictData.position;

    // 判断是否在当前区县视野范围
    const isInArea =
      lonNow > lon - 0.2 && lonNow < lon + 0.2 &&
      latNow > lat - 0.2 && latNow < lat + 0.2;

    // 当高度较低且仍在区县范围时显示标签
    // 这里是异步的，所以可以写在文字标签数据源currentDistrictLabel之前，否则会出现uncatch
    currentDistrictLabel.label.show = isInArea && heightNow < baseHeight + 5000;
  });

  // ---------- 点击事件 ----------
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    // 点击事件需要确认拾取到的是区县实体,仅当区县矢量开启的时候才准进行pick操作
    if(dataSource.show === false) return   // 这一行就解决了区县矢量隐藏时,点击地铁矢量会报错找不到polygen的问题
    const pickedObject = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedObject) || !pickedObject.id) return;

    const currentEntity = pickedObject.id;

    // 恢复上一个区县的颜色
    if (lastPickedEntity && lastPickedEntity !== currentEntity) {
      lastPickedEntity.polygon.material = Cesium.Color.SKYBLUE.withAlpha(0.6);
    }

    // 高亮当前区县
    currentEntity.polygon.material = Cesium.Color.GREEN.withAlpha(0.8);
    lastPickedEntity = currentEntity;

    // 右侧面板显示
    right.classList.add('active');
    right.innerHTML = `<h2>${currentEntity.name || '未命名区县'}</h2>`;

    // 找到对应的区县配置
    const district = chengduDistricts.find(d => d.name === currentEntity.name);
    if (!district) return;

    // 经纬度与高度
    const [lon, lat, height] = district.position
      ? district.position.split(',').map(Number)
      : [104.0667, 30.667, 30000];

    // 保存当前区县数据供相机监听使用
    currentDistrictData = {
      name: district.name,
      position: [lon, lat, height],
    };

    // 飞行到目标区县
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 1.5,
    });

    // 移除旧标签，添加新区县标签currentDistrictLabel
    if (currentDistrictLabel) viewer.entities.remove(currentDistrictLabel);
    currentDistrictLabel = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 100),
      label: {
        text: district.name,
        font: "18px sans-serif",
        fillColor: Cesium.Color.YELLOW,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        outlineColor: Cesium.Color.BLACK,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        showBackground: true,
        backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        show: true,
      },
    });

    // 更新右侧面板内容
    right.innerHTML += `
      <img class="img" src="${district.image}" alt="${district.name}">
      <p class="text">${district.text}</p>
    `;
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});



// 纠偏函数
async function loadAndCorrectGeoJSON(url) {
  const response = await fetch(url);
  const geojson = await response.json();

  // 遍历所有坐标点（递归支持多层结构）
  function correctCoords(coords) {
    if (typeof coords[0] === 'number') {
      const [lon, lat] = coords;
      return wgs84ToGcj02(lon, lat);
    } else {
      return coords.map(correctCoords);
    }
  }

  geojson.features.forEach((f) => {
    if (f.geometry && f.geometry.coordinates) {
      f.geometry.coordinates = correctCoords(f.geometry.coordinates);
    }
  });

  return geojson
}

// 使用纠偏后的GeoJSON，地铁线
loadAndCorrectGeoJSON('/地铁线路图json/成都地铁线.geojson').then((correctedGeoJSON) => {
  // 集成新的数据源，用以存放地铁label，之后涉及显隐，以免和viewer.entities发生冲突
  const subwayLabels = new Cesium.CustomDataSource("SubwayLabels")
  Cesium.GeoJsonDataSource.load(correctedGeoJSON, {
    clampToGround: true,
    stroke: Cesium.Color.GREEN.withAlpha(0.8),
  })
  .then((dataSource) => {
  viewer.dataSources.add(dataSource)
  const xian = dataSource.entities.values   //数组包对象，21个entities，会出现一个线路对应多个entities的情况
  // console.log(xian);
  
  // 添加功能，点击地铁线，显示地铁线路名称，显示该地铁线路，其他线路隐藏
  // handler不要写在for循环里面,否则会多次创建监听器,各监听器冲突出现bug:永远只显示最后一条线
  // 先写逻辑,再遍历控制
  let currentVisibleLine = null; // 跟踪当前显示的线路
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.position);
  
  if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && 
    dataSource.entities.contains(pickedObject.id)) {
    
    const clickedEntity = pickedObject.id;
    
    // 如果点击的是已显示的线路，则恢复显示所有线路
    if (currentVisibleLine === clickedEntity) {
      xian.forEach(entity => { entity.show = true; });
      currentVisibleLine = null;
      showToast("已恢复显示所有地铁线路");
    } else {
      // 显示点击的线路，隐藏其他
      const lineName = clickedEntity.properties.Name.getValue();
      xian.forEach(entity => {
        entity.show = (entity === clickedEntity);
      });
      currentVisibleLine = clickedEntity;
      showToast(`当前地铁线路：${lineName}`);
    }
  } else {
    // 点击空白处恢复显示所有线路
    if (currentVisibleLine) {
      xian.forEach(entity => { entity.show = true; });
      currentVisibleLine = null;
      showToast("已恢复显示所有地铁线路");
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  
  // 数据清洗，拿到xian的name和style,成为新的数组
  const xianStyleArr = []  //循环外定义数组，21次push
  for(let i = 0; i < xian.length ; i ++) {
    let bag = xian[i].properties 
    // console.log(bag);
    let name = bag.Name.getValue();
    let style = bag.Style.getValue();
    // 因为这里只需要style的getvalue()的一部分，ai帮写正则表达式match匹配，规则裁剪字符串得到了color
    let match = style.match(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})/);
    let color = match ? match[0] : null;
    const xianStyle = {
      name:name,
      color:color
    }
    // console.log(xianStyle);  //当前共21个对象，仅有name和color线才两个属性
     // 建立数组包上述的对象
    xianStyleArr.push(xianStyle)
  } 
  
   for(let j = 0; j < xianStyleArr.length; j++) {
    const entity = xian[j]
    const color = xianStyleArr[j].color
    entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
    color: Cesium.Color.fromCssColorString(color).withAlpha(0.9), 
    glowPower: 0.4                                               
});
   entity.polyline.width = 13;
   }


// 地铁站点
Cesium.GeoJsonDataSource.load('/地铁线路图json/成都地铁.geojson').then(async (ds) => {
const entities = ds.entities.values;
// 集成一个新的数据源，后续做entities.add的时候，全部添加到这个数据源里面，而不是添加到viewer里面
const subwayStations = new Cesium.CustomDataSource("SubwayStations")
const lineOne = []
const lineTwo = []
const lineThree = []
const lineFour = [] 
const lineFive = []
const lineSix = []
const lineSeven = []
const lineEight = []
const lineNine = []
const lineTen = []
const lineTherteen = []
const lineSeventeen = [] 
const lineEighteen = [] 
const lineNineteen = [] 

// 两个监听事件，注意这里是帧监听，已经移动位置了。千万不要写在for循环里面，不然及其消耗性能
// 第二次优化，文字和点监听写在一个监听器里面
// 注册相机移动事件，点监听 文字lable监听

// 11.12修改bug，注意这里viewer.scence.postrender会每帧触发，上面有个监听器监听是viewer.camera.change视角移动触发，
// 这三个监听器相互冲突，会导致上面区县名称的显示bug，这边集成了一个新的数据源substationslabel装载列车和列车名
const SHOW_HEIGHT = 40000;
const SHOW_LABEL_HEIGHT = 10000;
const labelShowHeight = 10000; // 地铁名字监听 相机高度小于 20 km 时才显示

// 监听地铁站点，地铁站点名
viewer.scene.postRender.addEventListener(() => {
  const h = viewer.camera.positionCartographic.height;
  const showPoints = h < SHOW_HEIGHT;
  const showLabels = h < SHOW_LABEL_HEIGHT;

  subwayStations.entities.values.forEach(e => {
    e.show = showPoints;
    if (e.label) e.label.show = showLabels;
  });
});

// 监听列车名，11.12修改bug——监听器冲突，这里必须集成数据源，添加到新的数据源，否则控制viewer.entities会影响前面的区县文字显隐
viewer.scene.postRender.addEventListener(() => {
  const cameraHeight = viewer.camera.positionCartographic.height;
  subwayLabels.entities.values.forEach(entity => {
    if (entity.label) {
      entity.label.show = cameraHeight < labelShowHeight;
    }
  });
});

// 高性能批处理坐标纠偏（一次性执行）
const julianNow = Cesium.JulianDate.now();
const correctedPositions = entities.map(entity => {
  if (!entity.position) return null;
  const pos = entity.position.getValue(julianNow);
  if (!pos) return null;

  const carto = Cesium.Cartographic.fromCartesian(pos);
  const lon = Cesium.Math.toDegrees(carto.longitude);
  const lat = Cesium.Math.toDegrees(carto.latitude);
  const [gcjLon, gcjLat] = wgs84ToGcj02(lon, lat);
  return Cesium.Cartesian3.fromDegrees(gcjLon, gcjLat);
});

//  ai提供的点贴地算法（sampleTerrain）
const terrainProvider = viewer.terrainProvider;
const positions = entities.map(ent => {
const pos = ent.position.getValue(Cesium.JulianDate.now());
  return Cesium.Cartographic.fromCartesian(pos);
});
const updated = await Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
updated.forEach((p, i) => {
  const entity = entities[i];
  entity.position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height);
});
// 一次性更新所有实体（批量赋值，减少 Cesium 触发器）
for (let i = 0; i < entities.length; i++) {
  if (correctedPositions[i]) {
    entities[i].position = correctedPositions[i];
  }
}

// 1号线：韦家碾-科学城/五根松 (0-33)
for( let q = 0; q <= 56; q++ ) {
    lineOne.push(entities[q])
}
for( let q = 416; q <= 420; q++ ) {
    lineOne.push(entities[q])
}

// 2号线：犀浦-龙泉驿 (57-88)
for( let q = 57; q <= 88; q++ ) {
    lineTwo.push(entities[q])
}

// 3号线：成都医学院-双流西站 (89-125)
for( let q = 89; q <= 125; q++ ) {
    lineThree.push(entities[q])
}

// 4号线：万盛-西河 (126-155)
for( let q = 126; q <= 155; q++ ) {
    lineFour.push(entities[q])
}

// 5号线：华桂路-回龙 (156-196)
for( let q = 156; q <= 196; q++ ) {
    lineFive.push(entities[q])
}


// 6号线：望丛祠-兰家沟 (197-252)
for( let q = 197; q <= 252; q++ ) {
    lineSix.push(entities[q])
}

// 7号线：环线 (253-284) - 修正范围
for( let q = 253; q <= 284; q++ ) {
    lineSeven.push(entities[q])
}

// 8号线：莲花-十里店 (286-311)
for( let q = 285; q <= 318; q++ ) {
    lineEight.push(entities[q])
}

// 9号线：金融城东-黄田坝 (319-331) 
for( let q = 319; q <= 331; q++ ) {
    lineNine.push(entities[q])
}
// 10号线：太平园-新平 (332-347)
for( let q = 332; q <= 347; q++ ) {
    lineTen.push(entities[q])
}

// 13号线
for( let q = 348; q <= 374; q++ ) {
    lineTherteen.push(entities[q])
}

// 17号线：金星-机投桥 (375-381, 328-331)
for( let q = 375; q <= 381; q++ ) {
    lineSeventeen.push(entities[q])
}
for( let q = 328; q <= 331; q++ ) {
    lineSeventeen.push(entities[q])
}
for( let q = 382; q <= 402; q++ ) {
    lineSeventeen.push(entities[q])
}
// 18号线：火车南站-天府机场北 (403-415)
for( let q = 403; q <= 421; q++ ) {
    lineEighteen.push(entities[q])
}

// 19号线：金星-天府机场2号航站楼 (375-381, 422-435)
for( let q = 375; q <= 381; q++ ) {
    lineNineteen.push(entities[q])
}
for( let q = 422; q <= 435; q++ ) {
    lineNineteen.push(entities[q])
}

// 作桥
const allLines = [
  { name: '一号线车站', data: lineOne, colorIndex: 0 },
  { name: '二号线车站', data: lineTwo, colorIndex: 2 },
  { name: '三号线车站', data: lineThree, colorIndex: 3 },
  { name: '四号线车站', data: lineFour, colorIndex: 4 },
  { name: '五号线车站', data: lineFive, colorIndex: 5 },
  { name: '六号线车站', data: lineSix, colorIndex: 6 },
  { name: '七号线车站', data: lineSeven, colorIndex: 7 },
  { name: '八号线车站', data: lineEight, colorIndex: 8 },
  { name: '九号线车站', data: lineNine, colorIndex: 11 },
  { name: '十号线车站', data: lineTen, colorIndex: 12 },
  { name: '十三号线车站', data: lineTherteen, colorIndex: null, customColor: '#00aaffff' },
  { name: '十七号线车站', data: lineSeventeen, colorIndex: 16 },
  { name: '十八号线车站', data: lineEighteen, colorIndex: 17 },
  { name: '十九号线车站', data: lineNineteen, colorIndex: 20 }
];

for (const line of allLines) {
  const color = line.customColor
    ? Cesium.Color.fromCssColorString(line.customColor).withAlpha(0.9)
    : Cesium.Color.fromCssColorString(xianStyleArr[line.colorIndex].color).withAlpha(0.9);
  const labelColor = line.customColor
    ? Cesium.Color.fromCssColorString(line.customColor).withAlpha(0.6)
    : Cesium.Color.fromCssColorString(xianStyleArr[line.colorIndex].color).withAlpha(0.6);

  //  循环当前线路的所有车站
  for (let i = 0; i < line.data.length; i++) {
    const entity = line.data[i];
    if (!entity.position) continue;
    const pos = entity.position.getValue();
    // 重置点要素的样式
    entity.billboard = undefined;
    entity.label = undefined;

    //  添加到 subwayStations
    subwayStations.entities.add({
      name: line.name,
      position: pos,
      point: new Cesium.PointGraphics({
        pixelSize: 8,
        color: color,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        show: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }),
      cylinder: {
        length: 200.0,
        topRadius: 0.0,
        bottomRadius: 80.0,
        material: color,
        outline: false,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: `${entity.name}`,
        font: '18px Microsoft YaHei',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: labelColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -50),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });
  }
}
//  添加到场景
viewer.dataSources.add(ds);
// 集成的新数据源添加给viewer
viewer.dataSources.add(subwayStations);


// 全局时间配置（外层）
const globalStart = Cesium.JulianDate.now();
const globalStop = Cesium.JulianDate.addSeconds(globalStart, 2000, new Cesium.JulianDate());
viewer.clock.startTime = globalStart.clone();
viewer.clock.stopTime = globalStop.clone();
viewer.clock.currentTime = globalStart.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;


for (let j = 0; j < xian.length; j++) {
  // 颜色提取 待会儿要赋值给label
  const styleStr = xian[j].properties.getValue().Style;
  // 正则表达式筛选提取
  const penMatch = styleStr.match(/PEN\(c:(#[0-9a-fA-F]{6,8})/);
  const lineColor = penMatch ? penMatch[1] : "#FFFFFF"; // 默认白色

  const lineEntity = xian[j];
  const now = Cesium.JulianDate.now();
  const xianPositions = lineEntity.polyline.positions.getValue(now); //线仍然具有position,表示的是拐点
  if (!xianPositions || !xianPositions.length) continue; 
  
  const property = new Cesium.SampledPositionProperty();
  let seconds = 0;
  
  // 对线段（列车的运行轨迹）进行插值
  for (let i = 0; i < xianPositions.length; i++) {
    const time = Cesium.JulianDate.addSeconds(globalStart, seconds, new Cesium.JulianDate());
    property.addSample(time, xianPositions[i]);
    seconds += 5; // 控制速度
  }
// 11.13bug——如果网页加载速度慢，可能多次调用suwayLabels，创建多个地铁实体。这里做判断，全部移除再添加，确保有且只有一个实体
  if (subwayLabels.entities.length) {
  subwayLabels.entities.removeAll();
 }
   subwayLabels.entities.add({
    id:`${j}`,  //方便后续定位查找getelementbyid()
    name: `${j}号线`,
    position: property,
    orientation: new Cesium.VelocityOrientationProperty(property),
    model: {
      uri: '/地铁模型/train.glb',
      scale: 1,
      minimumPixelSize: 1,
      maximumScale: 1,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND 
    },
    label: {
    text: `${xian[j].name}列车`,       // 显示文字
    font: 'bold 22px Microsoft YaHei', // 字体和大小
    fillColor: Cesium.Color.fromCssColorString(lineColor), // 填充颜色
    outlineColor: Cesium.Color.BLACK, // 描边颜色
    outlineWidth: 4,               // 描边宽度
    style: Cesium.LabelStyle.FILL, // 填充+描边
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 文字相对于点的位置
    pixelOffset: new Cesium.Cartesian2(0, -50), // 偏移，让文字在模型上方显示
    showBackground: true,          // 是否显示背景
    backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.2), // 背景颜色
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // 高度跟随地形
  }
});
}
// viewer.trackedEntity = trainEntity;
// 跟踪状态isFollowing

let isFollowing = false;
let followHandler = null;

function followTrain(entity) {
  if (!entity) return;

  // 停止上一次跟随
  if (followHandler) {
    viewer.scene.postRender.removeEventListener(followHandler);
    followHandler = null;
    isFollowing = false;
  }

  // 首先飞到初始视角
  viewer.flyTo(entity, {
    duration: 2,
    offset: 
      new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),    // 正前方
      Cesium.Math.toRadians(-45),  // 俯视45度
      3500                         // 距离3500米
    )
  }).then(() => {
    setTimeout(() => {
      isFollowing = true;
      followHandler = function () {
        if (!isFollowing) return;
        const time = viewer.clock.currentTime;
        const position = entity.position.getValue(time);
        if (!position) return;

        // 转为地理坐标
        const carto = Cesium.Cartographic.fromCartesian(position);
        const lon = Cesium.Math.toDegrees(carto.longitude);
        const lat = Cesium.Math.toDegrees(carto.latitude);
        const height = carto.height + 3500; // 高度固定 3500 米

        // 相机相对于列车的偏移
        const horizontalDistance = 2500;
        const heading = Cesium.Math.toRadians(-55); // 方位，可调整
        const offsetLon = lon + (horizontalDistance / 111000) * Math.cos(heading);
        const offsetLat = lat + (horizontalDistance / 111000) * Math.sin(heading);
        const cameraPos = Cesium.Cartesian3.fromDegrees(offsetLon, offsetLat, height);

        // 平滑插值
        const lerpFactor = 0.1;
        const smoothPos = Cesium.Cartesian3.lerp(
          viewer.camera.position,
          cameraPos,
          lerpFactor,
          new Cesium.Cartesian3()
        );
        
// 这里涉及相机角度的三种设定方式
// { heading, pitch, roll }（欧拉角）
// { direction, up }（方向向量方式） 此处选用该种，方向向量基准点是地铁
// { quaternion }（四元数方式）
// 计算朝向
const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
const up = Cesium.Matrix4.getColumn(transform, 2, new Cesium.Cartesian3());    
const direction = Cesium.Cartesian3.normalize(
  Cesium.Cartesian3.subtract(position, smoothPos, new Cesium.Cartesian3()),
  new Cesium.Cartesian3()
);

// 修正“up”方向：确保与地球表面一致，不随球面倾斜产生偏转
const correctedUp = Cesium.Cartesian3.normalize(
  Cesium.Cartesian3.cross(
    Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3()),
    direction,
    new Cesium.Cartesian3()
  ),
  new Cesium.Cartesian3()
);

//  应用新的相机姿态
viewer.camera.setView({
  destination: smoothPos,
  orientation: {
    direction: direction,
    up: correctedUp
  }
});
};
viewer.scene.postRender.addEventListener(followHandler);
}, 200); // 延迟确保飞行完成
});
}




// 下拉选择列车
const lineSelect = document.getElementById('lineSelect');
lineSelect.addEventListener('change', function() {
  showToast('按esc退出跟随模式')
  const id = this.value;
  if (!id) {
    isFollowing = false;
    viewer.trackedEntity = undefined;
    return;
  }
  // 修改数据源为subwaylabels后，entities的添加更改了，这儿唯一还需要解耦的就是修改这儿subwayLabels.entities.getById(id);
  const entity = subwayLabels.entities.getById(id);
  if (entity) followTrain(entity);

// 静态假数据，装填subwayleft
const trainData = [
  { line: "1号线列车", productionDate: "2018-03-12", chassisNo: "CDG1001", operator: "成都地铁集团", trainType: "地铁A型车", carCount: 6, carLength: 18, serviceStart: "2018-06-01", maxCapacity: 1800, maxSpeed: 80, voltage: "1500V DC", traction: "交流牵引", livery: "蓝白涂装", status: "在运", image: "/成都地铁/1.jpg",operator:"张三" },
  { line: "1号线南段列车", productionDate: "2019-06-25", chassisNo: "CDG1002", operator: "成都地铁集团", trainType: "地铁A型车", carCount: 6, carLength: 18, serviceStart: "2019-09-01", maxCapacity: 1800, maxSpeed: 80, voltage: "1500V DC", traction: "交流牵引", livery: "蓝白涂装", status: "在运", image: "/成都地铁/1.jpg",operator:"李四" },
  { line: "2号线列车", productionDate: "2017-09-18", chassisNo: "CDG2001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2017-12-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/2.jpg",operator:"王五" },
  { line: "3号线列车", productionDate: "2020-01-05", chassisNo: "CDG3001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2020-04-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/3.jpg",operator:"丁六" },
  { line: "4号线列车", productionDate: "2019-11-22", chassisNo: "CDG4001", operator: "成都地铁集团", trainType: "地铁A型车", carCount: 6, carLength: 18, serviceStart: "2020-02-01", maxCapacity: 1800, maxSpeed: 80, voltage: "1500V DC", traction: "交流牵引", livery: "蓝白涂装", status: "在运", image: "/成都地铁/4.jpg",operator:"蒋七" },
  { line: "5号线列车", productionDate: "2021-05-15", chassisNo: "CDG5001", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2021-08-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "紫色涂装", status: "在运", image: "/成都地铁/5.jpg",operator:"邓八" },
  { line: "6号线列车", productionDate: "2020-07-30", chassisNo: "CDG6001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2020-10-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/6.jpg",operator:"肖九" },
  { line: "7号线列车(内环&外环)", productionDate: "2021-02-10", chassisNo: "CDG7001", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2021-05-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/7.jpg",operator:"罗十" },
  { line: "8号线列车", productionDate: "2022-03-08", chassisNo: "CDG8001", operator: "成都地铁集团", trainType: "地铁A型车", carCount: 6, carLength: 18, serviceStart: "2022-06-01", maxCapacity: 1800, maxSpeed: 80, voltage: "1500V DC", traction: "交流牵引", livery: "蓝白涂装", status: "在运", image: "/成都地铁/8.jpg",operator:"张三" },
  { line: "9号线列车", productionDate: "2019-12-01", chassisNo: "CDG9001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2020-03-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/9.jpg",operator:"李四" },
  { line: "10号线列车", productionDate: "2020-06-18", chassisNo: "CDG10001", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2020-09-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/10.jpg",operator:"王五" },
  { line: "10号线三期列车", productionDate: "2022-01-20", chassisNo: "CDG10002", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2022-04-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/10.jpg",operator:"丁六" },
  { line: "13号线一期列车", productionDate: "2021-08-12", chassisNo: "CDG13001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2021-11-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/13.jpg",operator:"蒋七" },
  { line: "17号线列车", productionDate: "2022-09-15", chassisNo: "CDG17001", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2022-12-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/17.jpg",operator:"邓八" },
  { line: "17号线二期列车", productionDate: "2023-04-03", chassisNo: "CDG17002", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2023-06-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/17.jpg",operator:"肖九" },
  { line: "18号线列车", productionDate: "2021-11-11", chassisNo: "CDG18001", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2022-02-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/18.jpg",operator:"罗十" },
  { line: "18号线北延段列车", productionDate: "2022-06-22", chassisNo: "CDG18002", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2022-09-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/18.jpg",operator:"张三" },
  { line: "18号线临江段列车", productionDate: "2023-03-14", chassisNo: "CDG18003", operator: "成都地铁集团", trainType: "地铁B型车", carCount: 7, carLength: 19, serviceStart: "2023-06-01", maxCapacity: 2000, maxSpeed: 90, voltage: "1500V DC", traction: "交流牵引", livery: "红白涂装", status: "在运", image: "/成都地铁/18.jpg",operator:"李四" },
  { line: "19号线二期列车", productionDate: "2023-07-19", chassisNo: "CDG19001", operator: "成都地铁集团", trainType: "地铁C型车", carCount: 6, carLength: 18, serviceStart: "2023-10-01", maxCapacity: 1500, maxSpeed: 80, voltage: "750V DC", traction: "直流牵引", livery: "绿色涂装", status: "在运", image: "/成都地铁/19.jpg",operator:"王五" },
];

 // 建立 value 到 trainData 的字典映射清洗
  const valueToTrainIndex = {
    1: 1,   // 1号线南段列车
    2: 2,   // 2号线列车
    3: 3,   // 3号线列车
    4: 4,   // 4号线列车
    5: 5,   // 5号线列车
    6: 6,   // 6号线列车
    7: 7,   // 7号线列车(内环&外环)
    9: 8,   // 8号线列车
    11: 9,  // 9号线列车
    12: 10, // 10号线列车
    13: 11, // 10号线三期列车
    14: 12, // 13号线一期列车
    15: 13, // 17号线列车
    16: 14, // 17号线二期列车
    17: 15, // 18号线列车
    18: 16, // 18号线北延段列车
    19: 17, // 18号线临江段列车
    20: 18, // 19号线二期列车
    0: 0,   // 1号线列车
  };

  // 清洗后的索引
const trainIndex = valueToTrainIndex[id];
// 这儿就已经做好对应数组中的某个对象了
const train = trainData[trainIndex];
const subwayLeft = document.querySelector('.subwayLeft')
const subwayRight = document.querySelector('.subwayright')
const opretor = document.getElementById('opretor')
subwayLeft.innerHTML = 
`
<div class="message">
<img class="img" src="${train.image}">
<div class="header">${train.line}</div>
<div class = "productionDate">生产日期：${train.productionDate}</div>
<div class = "classisNo">车架号：${train.chassisNo}</div>
<div class = "trainType">车型：${train.trainType}</div>
<div class = "serviceStart">启运时间：${train.serviceStart}</div>
<div class = "livery">涂装：${train.livery}</div>
<div class = "status">运行状况：${train.status}</div>
</div>
`
opretor.innerHTML = `
<div>${train.operator}</div>
<a class = "button">联络</a>
`

subwayLeft.classList.add('active')
subwayRight.classList.add('active')
renderRealTimePanel(train)

// ESC 键退出跟随
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFollowing) {
    viewer.scene.postRender.removeEventListener(followHandler);
    followHandler = null;
    isFollowing = false;
    viewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(104.0667,30.6667,30000),
    duration:1
  })
   showToast('退出跟随模式')
   subwayLeft.classList.remove('active')
   subwayRight.classList.remove('active')
  }
});
});
// 11.14修改bug，之前这个viewer.dataSources.add(subwayLabels);写在上面的小中括号里面的，
// 也就是写在了addeventlistener里面
// 这就导致了网页加载比较慢的时候，点击多次选项卡，同一条线路会出现多个地铁列车entity，越来越卡
// 已经修改到监听语法外面
// 而且这样修改似乎直接解决了error render对象已经被destory()的错误？？
viewer.dataSources.add(subwayLabels);


// AI
// ========== 🟩 实时监控渲染逻辑 ==========
let speedChart, passengerChart, realTimeTimer;

// 🚇 不同线路的基础参数（速度区间、客流区间）
function getMockParams(lineName) {
  const baseConfigs = [
    { key: "1号线", speed: [55, 70], passenger: [800, 1300] },
    { key: "2号线", speed: [60, 78], passenger: [900, 1500] },
    { key: "3号线", speed: [50, 68], passenger: [700, 1100] },
    { key: "4号线", speed: [55, 72], passenger: [800, 1300] },
    { key: "5号线", speed: [50, 65], passenger: [600, 1000] },
    { key: "6号线", speed: [60, 80], passenger: [900, 1400] },
    { key: "7号线", speed: [45, 60], passenger: [700, 1200] },
    { key: "8号线", speed: [55, 75], passenger: [800, 1300] },
    { key: "9号线", speed: [58, 78], passenger: [850, 1350] },
    { key: "10号线", speed: [65, 85], passenger: [700, 1200] },
    { key: "13号线", speed: [55, 75], passenger: [800, 1300] },
    { key: "17号线", speed: [65, 90], passenger: [700, 1000] },
    { key: "18号线", speed: [80, 110], passenger: [600, 900] },
    { key: "19号线", speed: [70, 95], passenger: [700, 1100] },
  ];
  return baseConfigs.find(cfg => lineName.includes(cfg.key)) || baseConfigs[0];
}

// 渲染右侧实时监控面板
function renderRealTimePanel(train) {
  const speedCanvas = document.getElementById("speedCanvas");
  const passengerCanvas = document.getElementById("passengerCanvas");
  const statusList = document.getElementById("statusList");

  // 清理旧数据与定时器
  if (realTimeTimer) {
    clearInterval(realTimeTimer);
    realTimeTimer = null;
  }
  if (speedChart) {
    speedChart.destroy();
    speedChart = null;
  }
  if (passengerChart) {
    passengerChart.destroy();
    passengerChart = null;
  }

  // 初始化 Canvas 上下文
  const ctxSpeed = speedCanvas.getContext("2d");
  const ctxPassenger = passengerCanvas.getContext("2d");

  // 初始化空图表
  // 速度图表（亮色主题）
speedChart = new Chart(ctxSpeed, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: `${train.line} 实时速度 (km/h)`,
      data: [],
      borderColor: "rgba(0, 191, 255, 1)", // 亮蓝线
      backgroundColor: "rgba(0, 191, 255, 0.15)", // 半透明填充
      borderWidth: 2.5,
      tension: 0.35,
      fill: true, // ✅ 增加填充区域
      pointRadius: 3,
      pointBackgroundColor: "rgba(255,255,255,0.8)"
    }]
  },
  options: {
    responsive: true,
    animation: false,
    plugins: {
      title: {
        display: true,
        text: `${train.line} 实时速度监控`,
        color: '#00BFFF',
        font: { size: 12, weight: 'bold' },
        padding: { top: 5, bottom: 10 }
      },
      legend: { display: false }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 120,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#FFFFFF" }
      }
    }
  }
});


// 👥 载客量图表（亮色主题）
passengerChart = new Chart(ctxPassenger, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: `${train.line} 载客量 (人)`,
      data: [],
      borderColor: "rgba(255, 215, 0, 1)", // 金黄色线
      backgroundColor: "rgba(255, 215, 0, 0.15)", // 半透明背景
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: "rgba(255,255,255,0.8)"
    }]
  },
  options: {
    responsive: true,
    animation: false,
    plugins: {
      title: {
        display: true,
        text: `${train.line} 实时载客量监控`,
        color: '#FFD700',
        font: { size: 12, weight: 'bold' },
        padding: { top: 5, bottom: 10 }
      },
      legend: { display: false }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#FFFFFF" }
      }
    }
  }
});


  // 清空运行状态
  statusList.innerHTML = "";

  // 线路对应参数
  const cfg = getMockParams(train.line);
  const maxPoints = 20;
  const possibleStatuses = ["出库准备", "正在发车", "区间运行中", "进站停车", "折返运行", "出入段调度"];

  // 定时更新数据
  realTimeTimer = setInterval(() => {
    const now = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    const newSpeed = Math.round(cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]));
    const newPassenger = Math.round(cfg.passenger[0] + Math.random() * (cfg.passenger[1] - cfg.passenger[0]));

    // 更新速度
    const sData = speedChart.data;
    sData.labels.push(now);
    sData.datasets[0].data.push(newSpeed);
    if (sData.labels.length > maxPoints) {
      sData.labels.shift();
      sData.datasets[0].data.shift();
    }
    speedChart.update("none");

    // 更新客流
    const pData = passengerChart.data;
    pData.labels.push(now);
    pData.datasets[0].data.push(newPassenger);
    if (pData.labels.length > maxPoints) {
      pData.labels.shift();
      pData.datasets[0].data.shift();
    }
    passengerChart.update("none");

    // 更新指标
    document.getElementById("avgSpeed").textContent = `${Math.round(newSpeed - 5)} km/h`;
    document.getElementById("avgLoad").textContent = `${Math.round((newPassenger / train.maxCapacity) * 100)} %`;
    document.getElementById("punctuality").textContent = `${(95 + Math.random() * 4).toFixed(1)} %`;
    document.getElementById("updateTime").textContent = `最后更新: ${now}`;

    // 30% 概率产生状态变化
    if (Math.random() < 0.3) {
      const randomStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
      const li = document.createElement("div");
      li.textContent = `${now} ${train.line}：${randomStatus}`;
      li.className = "status-item";
      statusList.prepend(li);
      if (statusList.children.length > 6) statusList.removeChild(statusList.lastChild);
    }
  }, 2000);
}
});
});
});


// 全览功能
const buttonAll = document.querySelector('.all')
buttonAll.addEventListener('click',function() {
  viewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(104.0667,30.6667,300000),
    duration:1
  })
})

// 图层切换显示隐藏功能
// 栅格
const weiXingButton = document.getElementById('weiXingSwitch')
weiXingButton.checked = true
weiXingButton.addEventListener('change',function() {
  if(layer2) {
  layer2.show = this.checked}
})

// 矢量
const shiLiangButton = document.getElementById('shiLiangSwitch')
shiLiangButton.checked = true
shiLiangButton.addEventListener('change',function() {
shiLiangMap.show = this.checked
if(layer2.alpha === 0.5) {
  layer2.alpha = 1}
  else if (layer2.alpha ===1) {
    layer2.alpha = 0.5
  }
})

// 区县矢量显隐
const quXianButton = document.getElementById('quxianSwitch');
quXianButton.addEventListener('change', function () {
  // const subwayLeft = document.querySelector('.subwayLeft')
  // const subwayRight = document.querySelector('.subwayright')
  // // 断点判断，如果已经隐藏了，就不隐藏了
  // if (!subwayLeft.classList.contains('active') && !subwayRight.classList.contains('active')) {
  // return; // 已经隐藏，直接结束
  // }
  // subwayLeft.classList.remove('active')
  // subwayRight.classList.remove('active')
  
  const right = document.querySelector('.right');
  if (!districtDataSource) return; // 防止未加载完成
  if (quXianButton.checked) {
    // checkbox 打开 → 显示区县
    districtDataSource.show = true;
    right.classList.add('active');
    right.innerHTML = '请选择区县';
  } else {
    // checkbox 关闭 → 隐藏区县
    districtDataSource.show = false;
    right.classList.remove('active');
    right.innerHTML = '';
  }
});

// 城市白模，entitys添加白模的方式,数据量不宜太大（>100m），官方推荐3dtiles方式加载大数据量模型,但是这里用cesiumlab转换不出来
// 所以还是考虑使用entities添加，尽可能缩小建筑量，达到基本的可视化要求就行

// 拿到鼠标所在位置的经纬度
// const handler2 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// handler2.setInputAction(function (movement) {
//   // 将鼠标的屏幕坐标（movement.endPosition）转换为笛卡尔坐标
//   const cartesian = viewer.scene.globe.pick(
//     viewer.camera.getPickRay(movement.endPosition),
//     viewer.scene
//   );

//   if (cartesian) {
//     // 转换为经纬度（弧度转角度）
//     const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//     const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
//     const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
//     const height = cartographic.height.toFixed(2);

//     console.log(`经度: ${lon}, 纬度: ${lat}, 高度: ${height}`);
//   }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


// 查看当前角度
//const heading = viewer.camera.heading; // 偏航角（绕Z轴）
//const pitch = viewer.camera.pitch;     // 俯仰角（绕Y轴）
//const roll = viewer.camera.roll;       // 翻滚角（绕X轴）

// 转换为角度（方便直观查看）
//const headingDeg = Cesium.Math.toDegrees(heading);
//const pitchDeg = Cesium.Math.toDegrees(pitch);
//const rollDeg = Cesium.Math.toDegrees(roll);

//console.log(`相机角度：
//Heading（偏航）: ${headingDeg.toFixed(2)}°
//Pitch（俯仰）: ${pitchDeg.toFixed(2)}°
//Roll（翻滚）: ${rollDeg.toFixed(2)}°`);


// 未完成：
// 1.天气效果+按钮隐藏
// 2.城市白膜3dtiles
// 3.影像纠偏GeoJSON 用的是 WGS84，但高德底图是 GCJ-02——11.4已完成纠偏

// 应优化：
// 1.相机监视器函数应写在for之外，否则会生成大量监视器消耗性能。——11.6已修改结构。
// 2.cylinder太多，一个cylinder的entity可能涉及成千上万个三角面，如果需要添加的点太多，就应该用简单模型（billboard)轻渲染。不考虑这个了，能运行就行


//distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 8000.0) // 拉远隐藏
