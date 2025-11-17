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
  // 页面控件的控制,全部false则没有任何控件了,只有地球（纯净流）
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
})

// // osm默认建筑物模型，这个是cesium自带的，很粗略，涉及的建筑物也很少
 const osmBuildings= await Cesium.createOsmBuildingsAsync();
viewer.scene.primitives.add(osmBuildings);

// 文本
const label = viewer.entities.add({
  position:Cesium.Cartesian3.fromDegrees(114.3,30.57,100),
  label:{
    text:'测试文本',
    font:'14px Helvetica',
    fillColor:Cesium.Color.YELLOW,
    outlineColor:Cesium.Color.WHITE,
    outlineWidth:2,
    pixelOffset: new Cesium.Cartesian2(0, -30),
    showBackground:true,
    backgroundColor:new Cesium.Color(1,0,0,0.8)
  }
})
// 视口跳转至文字位置
// viewer.zoomTo(label)

// 线创建
const polyline = viewer.entities.add({
  polyline:{
    positions:Cesium.Cartesian3.fromDegreesArrayHeights([112,20,112,21,113,21]),
    material:Cesium.Color.BLUEVIOLET,
    width:10
  }
})
// viewer.zoomTo(polyline)

// 圆，圆锥创建
const elipse = viewer.entities.add({
  position:Cesium.Cartesian3.fromDegrees(114.3,30.57,0),
  ellipse:{
    semiMinorAxis:200,
    semiMajorAxis:200,
    material:new Cesium.Color(0,1,0)
}
})
viewer.zoomTo(elipse)

const cylinder = viewer.entities.add({
  position:Cesium.Cartesian3.fromDegrees(114.3,30.57,0),
  cylinder:{
    length:300,
    topRadius:0,
    bottomRadius:100,
    material:Cesium.Color.ORANGE}
  })