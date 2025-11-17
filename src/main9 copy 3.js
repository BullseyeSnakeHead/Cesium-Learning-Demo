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
  animation:false,
  // 时间线
  timeline:false,
  // 全屏按钮
  fullscreenButton:false,
   imageryProvider:false
  // cesium的logo隐藏不是在这儿配置的
})

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
  let condition = data.now.text
  let temperature = data.now.dew
  // console.log(condition);
  const now = document.querySelector('.now')
  const tem = document.querySelector('.tem')
  now.innerHTML = condition
  tem.innerHTML = temperature

  // 注意这里获取condition是异步的，如果将condition写作全局变量，即便在外部也是拿不到这个全局变量的，除非asyc await
  // 所以这里全部写在这个异步操作里面了
  // 阴天下雨效果
}
fetchWeather()



let entitiesA = null
// ai写的，非常巧妙
Cesium.GeoJsonDataSource.load('/筛选/筛选.geojson', {
  fill: Cesium.Color.SKYBLUE.withAlpha(0.6),
  stroke: Cesium.Color.YELLOW.withAlpha(0.8),
}).then((dataSource) => {
  viewer.dataSources.add(dataSource);
  dataSource.show = false
  console.log(dataSource.show);
  
  const entities = dataSource.entities.values;
  entitiesA = entities
  // console.log(entities);
  const right = document.querySelector('.right');
  // 保存上一个被点击的区县
  let lastPickedEntity = null;
  // 注册点击事件
  viewer.screenSpaceEventHandler.setInputAction(function (movement) {
  const pickedObject = viewer.scene.pick(movement.position);
  // 如果没有选中任何实体，则返回
  if (!Cesium.defined(pickedObject) || !pickedObject.id) return;
  // 这里没有用数组push，而是选用的赋值，赋的值是每个实体的id，作为判断依据
  const currentEntity = pickedObject.id
  // 如果有上一个选中项，则恢复颜色
  if (lastPickedEntity && lastPickedEntity !== currentEntity) {
  lastPickedEntity.polygon.material = Cesium.Color.SKYBLUE.withAlpha(0.6);
  }
  right.classList.add('active');
  // 高亮当前选中项
  currentEntity.polygon.material = Cesium.Color.GREEN.withAlpha(0.8);
  // 记录当前为上一次选中
  lastPickedEntity = currentEntity;

  // 更新右侧信息
  right.innerHTML = `${currentEntity.name || '未命名区县'}`
  // 更新右侧信息
  right.innerHTML = `${currentEntity.name || '未命名区县'}`

// 统一处理所有区县逻辑
chengduDistricts.forEach((district) => {
  if (currentEntity.name === district.name) {
    // 解析经纬度字符串 "104.118170,30.595440,30000"
    const [lon, lat, height] = district.position
      ? district.position.split(',').map(Number)
      : [104.0667, 30.667, 30000] // 默认成都中心

    // 飞行到对应区县
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration: 1
    });

    // 添加区县名称标签
    const labelEntity = viewer.entities.add({
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
      },
    });

    // 视域控制文字显示隐藏
    viewer.camera.changed.addEventListener(() => {
      const cameraPosition = viewer.camera.positionCartographic;
      const lonNow = Cesium.Math.toDegrees(cameraPosition.longitude);
      const latNow = Cesium.Math.toDegrees(cameraPosition.latitude);
      const heightNow = cameraPosition.height;
      const isInArea =
        lonNow > lon - 0.2 && lonNow < lon + 0.2 &&
        latNow > lat - 0.2 && latNow < lat + 0.2;
      labelEntity.label.show = isInArea && heightNow < height+5000;
    });

    // 在右侧面板显示区县信息和图片
    if(pickedObject.id) {
    right.innerHTML += `
      <img class="img" src="${district.image}" alt="${district.name}">
      <p class="text">${district.text}</p>
    `;
  }}
});
  }
  , Cesium.ScreenSpaceEventType.LEFT_CLICK);
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

// 使用纠偏后的GeoJSON线路加载
loadAndCorrectGeoJSON('/地铁线路图json/成都地铁线.geojson').then((correctedGeoJSON) => {
  Cesium.GeoJsonDataSource.load(correctedGeoJSON, {
    clampToGround: true,
    stroke: Cesium.Color.GREEN.withAlpha(0.8),
  }).then((dataSource) => {
  viewer.dataSources.add(dataSource)
  const xian = dataSource.entities.values   //数组包对象，21个entities，会出现一个线路对应多个entities的情况
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
const SHOW_HEIGHT = 40000;
const SHOW_LABEL_HEIGHT = 10000;

viewer.scene.postRender.addEventListener(() => {
  const h = viewer.camera.positionCartographic.height;
  const showPoints = h < SHOW_HEIGHT;
  const showLabels = h < SHOW_LABEL_HEIGHT;

  subwayStations.entities.values.forEach(e => {
    e.show = showPoints;
    if (e.label) e.label.show = showLabels;
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


// 线路点，这里是因为点要素本身不包含线路信息，只能通过这种方式划分
// 当然，ai提供了另一种策略——最近邻点法，即判断各点所在位置的最近线要素，归纳于最近的那条线
// 但最近邻点法有问题，一号线被归纳了63个点，远超其本身所具有的站点数量（0-33）
//  去除默认样式 + 自定义点样式
  for (let i = 0; i < lineOne.length; i++) {
    const entity = lineOne[i];
    // console.log(entity.name);
    if (entity.position) {
    const onePos = lineOne[i].position.getValue()
    entity.billboard = undefined;
    entity.label = undefined;
    subwayStations.entities.add({
      name:'一号线车站',
      position:onePos,
      point: new Cesium.PointGraphics({
      pixelSize: 8,
      color: Cesium.Color.fromCssColorString(xianStyleArr[0].color).withAlpha(0.9),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      show: true,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }),
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[0].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[0].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    },)
  }
    }
    // 添加圆锥  靠的是heightReference: Cesium.HeightReference.CLAMP_TO_GROUND实现贴地
    // 注意这里——性能考虑。一开始用的是
    // viewer.entities.add({,但是这样做太卡了，ai提示该方法添加400多个实体过于消耗性能
    // 所以这里采用  CustomDataSource.entities.add()
    // 第 1 步：创建一个数据源  在加载 GeoJSON 后（const entities = ds.entities.values; 下面）添加：const subwayStations = new Cesium.CustomDataSource("SubwayStations");
    // 第 2 步：把所有 viewer.entities.add(...) 改成新数据源的 subwayStations.entities.add(...)
    // 第 3 步：最后再把整个数据源添加进场景   viewer.dataSources.add(subwayStations);
   
  
  for (let i = 0; i < lineTwo.length; i++) {
    const entity = lineTwo[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[2].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const twoPos = lineTwo[i].position.getValue()
    subwayStations.entities.add({
      name:'二号线车站',
      position:twoPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[2].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
  label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[2].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineThree.length; i++) {
    const entity = lineThree[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[3].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const threePos = lineThree[i].position.getValue()
    subwayStations.entities.add({
      name:'三号线车站',
      position:threePos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[3].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[3].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineFour.length; i++) {
    const entity = lineFour[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[4].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const forePos = lineFour[i].position.getValue()
    subwayStations.entities.add({
      name:'四号线车站',
      position:forePos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[4].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[4].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineFive.length; i++) {
    const entity = lineFive[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[5].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const fivePos = lineFive[i].position.getValue()
    subwayStations.entities.add({
      name:'五号线车站',
      position:fivePos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[5].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[5].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineSix.length; i++) {
    const entity = lineSix[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[6].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const sixPos = lineSix[i].position.getValue()
    subwayStations.entities.add({
      name:'六号线车站',
      position:sixPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[6].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[6].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineSeven.length; i++) {
    const entity = lineSeven[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[7].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const sevenPos = lineSeven[i].position.getValue()
    subwayStations.entities.add({
      name:'七号线车站',
      position:sevenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[7].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[7].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineEight.length; i++) {
    const entity = lineEight[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[8].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const eightPos = lineEight[i].position.getValue()
    subwayStations.entities.add({
      name:'八号线车站',
      position:eightPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[8].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[8].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineNine.length; i++) {
    const entity = lineNine[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[11].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const ninePos = lineNine[i].position.getValue()
    subwayStations.entities.add({
      name:'九号线车站',
      position:ninePos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[11].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[11].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineTen.length; i++) {
    const entity = lineTen[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[12].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const tenPos = lineTen[i].position.getValue()
    subwayStations.entities.add({
      name:'十号线车站',
      position:tenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[12].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[12].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineTherteen.length; i++) {
    const entity = lineTherteen[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#00aaffff').withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const thertenPos = lineTherteen[i].position.getValue()
    subwayStations.entities.add({
      name:'十三号线车站',
      position:thertenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString('#00aaffff').withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString('#00aaffff').withAlpha(0.9),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  
  for (let i = 0; i < lineSeventeen.length; i++) {
    const entity = lineSeventeen[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[16].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
     const seventeenPos = lineSeventeen[i].position.getValue()
    subwayStations.entities.add({
      name:'十七号线车站',
      position:seventeenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[16].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[16].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineEighteen.length; i++) {
    const entity = lineEighteen[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[17].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const eighteenPos = lineEighteen[i].position.getValue()
    subwayStations.entities.add({
      name:'十八号线车站',
      position:eighteenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[17].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[17].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
  for (let i = 0; i < lineNineteen.length; i++) {
    const entity = lineNineteen[i];
    if (entity.position) {
      entity.billboard = undefined;
      entity.label = undefined;
      entity.point = new Cesium.PointGraphics({
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(xianStyleArr[20].color).withAlpha(0.9),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      });
    }
    const nineteenPos = lineNineteen[i].position.getValue()
    subwayStations.entities.add({
      name:'十九号线车站',
      position:nineteenPos,
      cylinder: {
      length: 200.0,
      topRadius: 0.0,
      bottomRadius: 80.0,
      material: Cesium.Color.fromCssColorString(xianStyleArr[20].color).withAlpha(0.9),
      outline: false,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  },
    label: {
    text: `${entity.name}`,
    font: '18px Microsoft YaHei',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    fillColor: Cesium.Color.fromCssColorString(xianStyleArr[20].color).withAlpha(0.6),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 从底部对齐（文字在锥体上方）
    pixelOffset: new Cesium.Cartesian2(0, -50), // 可微调偏移
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
  }
    })
  }
 
//  添加到场景
viewer.dataSources.add(ds);
// 集成的新数据源添加给viewer
viewer.dataSources.add(subwayStations);
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
const quXianButton = document.getElementById('quXianSwitch')
quXianButton.checked = true
quXianButton.addEventListener('change',function() {
const right = document.querySelector('.right')
right.classList.remove('active')
for(let i =0; i < entitiesA.length; i++) {
  entitiesA[i].show = this.checked
}
})

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


// 未完成：
// 1.天气效果+按钮隐藏
// 2.城市白膜3dtiles
// 3.影像纠偏GeoJSON 用的是 WGS84，但高德底图是 GCJ-02——11.4已完成纠偏

// 应优化：
// 1.相机监视器函数应写在for之外，否则会生成大量监视器消耗性能。——11.6已修改结构。
// 2.cylinder太多，一个cylinder的entity可能涉及成千上万个三角面，如果需要添加的点太多，就应该用简单模型（billboard)轻渲染。


//distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 8000.0) // 拉远隐藏
