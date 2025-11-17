import './style.css'
import * as Cesium from "cesium"
// 导入cesium包中的js文件和css文件引入项目 在node_modules-cesium-Build-Cesium目录下，将cesium文件拷贝到public目录下
// 引入其中的css文件widgets，可以再将这个css文件单独拿出来,放在src目录下
import './widgets.css'
// 静态导入
window.CESIUM_BASE_URL = '/Cesium'
// 挂载cesium盒子 // 这样挂载的cesium使用的是cesium官网的默认token，下边栏会提示要求创建个人token。在官网access token栏目中create token,右边栏拿到个人token
// 调用Cesium.Ion.defaultAccessToken替换个人的token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmM2RhY2M5NS02N2RiLTQ3ZGItOGRmYS0wOTJiMjRiNzAwNGQiLCJpZCI6MzM4NTk0LCJpYXQiOjE3NTcwNTA2ODR9.aqGrWNNBmWPRyakG0FYKX84rfg8AUYXkdqx8Chh2nrk'
// 默认进入时候的显示位置（默认在北美），经纬度确定视口左上，右下的位置
// Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(114.29,30.56,114.31,30.58)
// 加载自己的底图数据（高德）（默认底图时一个栅格地球数据，国外的数据，反应慢）,去除用imageryProvider配置相
// 在创建viewer实例时可以传参，控制视图展示效果,悬停在viewer上可以查看配置项
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
  // cesium的logo隐藏不是在这儿配置的

  // 用原底图，加载地形效果
  terrainProvider:await Cesium.createWorldTerrainAsync({
    // 地形
    requestVertexNormals:true,
    // 水文
    requestWaterMask:true
    // 至此，不再是平面底图，按住crtl可以水平观测地形，具有水文效果
  })
})
// logo cesiumWidget的显示隐藏
viewer.cesiumWidget.creditContainer.style.display = 'none'

// cesium使用的是笛卡尔坐标系，cartesian2/3/4，二维，三维用的比较多一些（x,y,z)，经纬度cartograpuic
// 相机视角,这个setView区分于viewer的flyto方法，这个是没有动态飞行效果的,flyto还有duration配置，单位为秒，具体写法见上一章main.js。还有个flyHome回北美
viewer.camera.setView({
  // 三维笛卡尔坐标 经度，纬度，高度（米）
  destination:Cesium.Cartesian3.fromDegrees(114.29,30.56,100000),
  // 对于视口而言还存在三个角度，方位角，俯仰角，翻滚角 以派单位弧度  修改默认状态
  // orientation:({
  //   // 方位角：平铺在桌子上一张纸，平面旋转
  //   heading:Cesium.Math.toRadians(-90),
  //   // 俯仰角 默认-90俯视地表，0时平面观察地表
  //   pitch:Cesium.Math.toRadians(0),
  //   // 旋转(翻滚）角 地平面产生翻滚
  //   roll:Cesium.Math.toRadians(45)
  // })
})

