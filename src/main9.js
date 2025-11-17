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

// 假数据ai提供，成都各区县简介，附图片
const chengduDistricts = [
  {
    name: "锦江区",
    text: "锦江区位于成都市中心东南部，是成都传统的核心城区之一，商贸繁荣、生活便利。区内有合江亭、兰桂坊等地标，城市绿化率高，是集文化、休闲、商务为一体的现代都市区域。",
    image: '/成都区县图片/锦江区.jpeg',
    position: '104.118170,30.595440,30000'
  },
  {
    name: "青羊区",
    text: "青羊区是成都的历史文化中心，拥有武侯祠、杜甫草堂等著名景点。区内文化底蕴深厚，老城区风貌保存较好，同时也是政府机关和教育资源集中的重要区域。",
    image: "/成都区县图片/青羊区.jpg"
  },
  {
    name: "金牛区",
    text: "金牛区位于成都市西北部，是老工业基地与现代商圈并存的区域。区内交通便利，成都火车站、西南交大等坐落于此，是城市交通与物流的重要枢纽。",
    image: "/成都区县图片/金牛区.jpeg"
  },
  {
    name: "武侯区",
    text: "武侯区以历史名人诸葛亮命名，是成都重要的科教文化区。区内有四川大学望江校区和武侯祠，现代商业与文化景观交融，是成都最具人气的城区之一。",
    image: ""
  },
  {
    name: "成华区",
    text: "成华区地处成都市东北部，近年来发展迅速，文化氛围浓厚。区内有成都动物园、建设中的东郊记忆文创园，是老工业区转型升级的典型代表。",
    image: ""
  },
  {
    name: "龙泉驿区",
    text: "龙泉驿区位于成都市东部，是成都汽车制造产业的重要基地。区内风景秀丽，有龙泉山城市森林公园和桃花沟，每年春季的桃花节吸引大量游客。",
    image: ""
  },
  {
    name: "青白江区",
    text: "青白江区位于成都东北部，是国家级铁路港和国际陆港所在地。该区以现代物流业和对外开放为特色，正在建设成都国际铁路港经济功能区。",
    image: ""
  },
  {
    name: "新都区",
    text: "新都区位于成都市北部，拥有丰富的教育资源和工业基础。新都老城区文化底蕴深厚，是唐代诗人杨升庵的故乡，也是成都的北部交通枢纽。",
    image: ""
  },
  {
    name: "温江区",
    text: "温江区位于成都西部，是生态宜居的现代化城区。区内绿化率高，城市环境优美，以“公园城市”建设为特色，吸引了大量高新技术企业与教育机构入驻。",
    image: ""
  },
  {
    name: "双流区",
    text: "双流区是成都的航空门户所在地，成都天府国际机场和双流国际机场均位于此。区内交通便利，产业发展迅速，是成都南部的重要经济增长极。",
    image: ""
  },
  {
    name: "郫都区",
    text: "郫都区位于成都市西北部，是川菜文化的重要发源地，郫县豆瓣享誉全国。区内高校众多，科教资源丰富，是成都重要的创新科技产业聚集区。",
    image: ""
  },
  {
    name: "新津区",
    text: "新津区地处成都南部，是城乡融合发展的典范区域。境内山水资源丰富，滨江生态带和花舞人间等景点吸引众多游客，生活节奏舒缓宜人。",
    image: ""
  },
  {
    name: "都江堰市",
    text: "都江堰市位于成都西北部，拥有世界文化遗产都江堰水利工程。这里自然环境优美，是成都重要的生态屏障和旅游胜地，常被誉为“天府之源”。",
    image: ""
  },
  {
    name: "彭州市",
    text: "彭州市地处成都西北部，山水环绕、生态优良。以大熊猫国家公园和九尺古镇闻名，是集生态旅游与农产品加工于一体的绿色城市。",
    image: ""
  },
  {
    name: "邛崃市",
    text: "邛崃市位于成都西南部，历史悠久、文化底蕴深厚。盛产白酒，是中国白酒金三角的重要组成部分，同时拥有天台山等自然景区。",
    image: ""
  },
  {
    name: "崇州市",
    text: "崇州市位于成都西部，以生态农业和文化旅游闻名。区内有街子古镇、青城后山等景点，是成都居民休闲度假的热门去处。",
    image: ""
  },
  {
    name: "金堂县",
    text: "金堂县位于成都东北部，岷江穿境而过。这里生态环境优美，交通便利，依托天府绿道和龙泉山脉，正在建设绿色宜居的生态城市。",
    image: ""
  },
  {
    name: "大邑县",
    text: "大邑县位于成都西南部，文化与自然景观丰富。境内有刘氏庄园、安仁古镇等名胜古迹，是巴蜀文化的重要发源地之一。",
    image: ""
  },
  {
    name: "蒲江县",
    text: "蒲江县位于成都南部，生态环境优越，以猕猴桃、茶叶等特色农业闻名。区内山清水秀，是成都市重要的生态农业示范区。",
    image: ""
  },
  {
    name: "简阳市",
    text: "简阳市位于成都东部，是天府国际机场所在地之一。区内交通便捷，正加速融入成都主城区经济圈，成为东部发展的重要支点。",
    image: ""
  },
  {
    name: "高新区",
    text: "成都高新区是国家级高新技术产业开发区，聚集了大量科技企业与创新人才。区内环境优美、生活便利，是成都现代化建设的代表区域。",
    image: ""
  },
  {
    name: "天府新区",
    text: "天府新区是国家级新区，也是成都未来发展的核心引擎。规划现代化城市格局，拥有金融城、科学城等重点功能区，代表成都的未来形象。",
    image: ""
  },
  {
    name: "东部新区",
    text: "东部新区是成都新设立的战略功能区，位于天府国际机场周边。以航空、智能制造、临空经济为核心，正在成为成都新的增长极。",
    image: ""
  }
];

for(let i =0;i < chengduDistricts.length; i++ ){

}



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
  duration:2.5
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

// ai写的，非常巧妙
Cesium.GeoJsonDataSource.load('/筛选/筛选.geojson', {
  fill: Cesium.Color.SKYBLUE.withAlpha(0.6),
  stroke: Cesium.Color.YELLOW.withAlpha(0.8),
}).then((dataSource) => {
  viewer.dataSources.add(dataSource);
  const entities = dataSource.entities.values;
  console.log(entities);
  const right = document.querySelector('.right');
  // 保存上一个被点击的区县
  let lastPickedEntity = null;
  // 注册点击事件
  viewer.screenSpaceEventHandler.setInputAction(function (movement) {
  right.classList.add('active');
  const pickedObject = viewer.scene.pick(movement.position);
  // 如果没有选中任何实体，则返回
  if (!Cesium.defined(pickedObject) || !pickedObject.id) return;
  // 这里没有用数组push，而是选用的赋值，赋的值是每个实体的id，作为判断依据
  const currentEntity = pickedObject.id
  // 如果有上一个选中项，则恢复颜色
  if (lastPickedEntity && lastPickedEntity !== currentEntity) {
  lastPickedEntity.polygon.material = Cesium.Color.SKYBLUE.withAlpha(0.6);
  }
  // 高亮当前选中项
  currentEntity.polygon.material = Cesium.Color.GREEN.withAlpha(0.8);
  // 记录当前为上一次选中
  lastPickedEntity = currentEntity;


  // 更新右侧信息
  right.innerHTML = `${currentEntity.name || '未命名区县'}`

  // 点击区县后定位
  if(currentEntity.name === '锦江区') {
  viewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(104.118170,30.595440,30000),
    duration:1
  })
  
  // 视域控制文字隐藏
  const jinJiangLableEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(104.118170,30.595440, 100),
  label: {
    text: "锦江区",
    font: "18px sans-serif",
    fillColor: Cesium.Color.YELLOW,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    outlineColor: Cesium.Color.BLACK,
    pixelOffset: new Cesium.Cartesian2(0, -20), // 向上偏移，避免遮挡点
    showBackground: true,
    backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 标签基准在底部
  },
});
 viewer.camera.changed.addEventListener(() => {
  const cameraPosition = viewer.camera.positionCartographic;
  const lon = Cesium.Math.toDegrees(cameraPosition.longitude);
  const lat = Cesium.Math.toDegrees(cameraPosition.latitude);
  const height = cameraPosition.height;
  const isInJinjiang =
    lon > 104.00 && lon < 104.30 &&
    lat > 30.30 && lat < 30.80;  
  if (isInJinjiang && height < 35000) {
    jinJiangLableEntity.label.show = true;
  } else {
    jinJiangLableEntity.label.show = false;
  }
});

// 在右侧面板显示区县信息和图片
    right.innerHTML += 
    `
    <img class="img" src="${chengduDistricts[0].image}">
    <p class = "text">${chengduDistricts[0].text}</p>
    `
  }else if (currentEntity.name === '青羊区') {
    viewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(103.982226,30.681072,30000),
    duration:1
  })
  
  // 视域控制文字隐藏
  const qinYangLabelEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(103.982226,30.681072, 100),
  label: {
    text: "青羊区",
    font: "18px sans-serif",
    fillColor: Cesium.Color.YELLOW,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    outlineColor: Cesium.Color.BLACK,
    pixelOffset: new Cesium.Cartesian2(0, -20), // 向上偏移，避免遮挡点
    showBackground: true,
    backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 标签基准在底部
  },
});
 viewer.camera.changed.addEventListener(() => {
  const cameraPosition = viewer.camera.positionCartographic;
  const lon = Cesium.Math.toDegrees(cameraPosition.longitude);
  const lat = Cesium.Math.toDegrees(cameraPosition.latitude);
  const height = cameraPosition.height;
  const isInQingYang =
    lon > 103.8 && lon < 104.0 &&
    lat > 30.65 && lat < 30.72;  
  if (isInQingYang && height < 35000) {
    qinYangLabelEntity.label.show = true;
  } else {
    qinYangLabelEntity.label.show = false;
  }
});

// 在右侧面板显示区县信息和图片
    right.innerHTML += 
    `
    <img class="img" src="${chengduDistricts[1].image}">
    <p class = "text">${chengduDistricts[1].text}</p>
    `
    
  }
  else if (currentEntity.name === '金牛区') {
    viewer.camera.flyTo({
    destination:Cesium.Cartesian3.fromDegrees(104.071220, 30.706952,30000),
    duration:1
  })
  
  // 视域控制文字隐藏
  const jinNiuLableEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(104.051220, 30.706952, 100),
  label: {
    text: "金牛区",
    font: "18px sans-serif",
    fillColor: Cesium.Color.YELLOW,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    outlineColor: Cesium.Color.BLACK,
    pixelOffset: new Cesium.Cartesian2(0, -20), // 向上偏移，避免遮挡点
    showBackground: true,
    backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 标签基准在底部
  },
});
 viewer.camera.changed.addEventListener(() => {
  const cameraPosition = viewer.camera.positionCartographic;
  const lon = Cesium.Math.toDegrees(cameraPosition.longitude);
  const lat = Cesium.Math.toDegrees(cameraPosition.latitude);
  const height = cameraPosition.height;
  const isInJinNiu =
    lon > 104.05 && lon < 104.18 &&
    lat > 30.63 && lat < 30.75;  
  if (isInJinNiu && height < 35000) {
    jinNiuLableEntity.label.show = true;
  } else {
    jinNiuLableEntity.label.show = false;
  }
});

// 在右侧面板显示区县信息和图片
    right.innerHTML += 
    `
    <img class="img" src="${chengduDistricts[2].image}">
    <p class = "text">${chengduDistricts[2].text}</p>
    `
    
  }}
  , Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
for(let i =0; i < quXianEntities.length; i++) {
  quXianEntities[i].show = this.checked
}
})

// 城市白模，entitys添加白模的方式,数据量不宜太大（>100m），官方推荐3dtiles方式加载大数据量模型,但是这里用cesiumlab转换不出来
// 所以还是考虑使用entities添加，尽可能缩小建筑量，达到基本的可视化要求就行

// 拿到鼠标所在位置的经纬度
const handler2 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler2.setInputAction(function (movement) {
  // 将鼠标的屏幕坐标（movement.endPosition）转换为笛卡尔坐标
  const cartesian = viewer.scene.globe.pick(
    viewer.camera.getPickRay(movement.endPosition),
    viewer.scene
  );

  if (cartesian) {
    // 转换为经纬度（弧度转角度）
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
    const height = cartographic.height.toFixed(2);

    console.log(`经度: ${lon}, 纬度: ${lat}, 高度: ${height}`);
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



