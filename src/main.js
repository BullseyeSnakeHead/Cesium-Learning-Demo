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
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(114.29,30.56,114.31,30.58)
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
  // 默认底图隐藏
  // imageryProvider:ture
  // cesium的logo隐藏不是在这儿配置的
  // 添加地形
  terrainProvider:Cesium.createWorldTerrainAsync({
    requestVertexNormals:true,
    requestWaterMask:true
  })
})
// logo cesiumWidget的显示隐藏
viewer.cesiumWidget.creditContainer.style.display = 'none'

// 加载高德矢量底图（首先得去掉默认底图）
const gaodeImageryProvider = new Cesium.UrlTemplateImageryProvider({
  // url必传，其他name啥的可选,注意这儿高德的url和openlayers的url有区别，ol中是平面的数据源，这里是地球覆被的数据源
  url:'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  name:'高德矢量'
})
// 将高德底图（矢量）添加到viewer中
viewer.imageryLayers.addImageryProvider(gaodeImageryProvider)

// 加载高德栅格底图
const gaodeImageryProvider6 = new Cesium.UrlTemplateImageryProvider({
  url:'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  name:'高德栅格'
})
// 将高德底图（栅格）添加到viewer中
const layer2 = viewer.imageryLayers.addImageryProvider(gaodeImageryProvider6)
// 后添加的底图会覆盖之前添加的底图
// 所以可以给后添加的图添加半透明.alpha方法，使其把底下的图层也显示出来
layer2.alpha = 0.5

// 定义视口中心动画效果,在cesium中，所有的经纬度添加都需要调用cesium.cartesian3.fromdegresss这个方法
// 经 纬 缩放大小    这里10000大概是缩放到县/区级大小
viewer.camera.flyTo({
  destination:Cesium.Cartesian3.fromDegrees(114.29,30.56,2000),
  duration:5
})

// create entities 构建实体，即可视化对象，点/线/面/模型
const point = viewer.entities.add({
  id:'黄鹤楼',
  // 确定位置.    经，纬，高
  position:Cesium.Cartesian3.fromDegrees(114.29,30.56,10),
  // point点，label文本
  point:{
    // 点大小
    pixelSize:20,
    // 颜色,颜色相关的设置都是调用cesium内部语法Cesium.Color.YANSE
    color:Cesium.Color.RED,
    // 边缘线颜色
    outlineColor:Cesium.Color.WHITE,
    // 边缘线宽度
    outlineWidth:2
  }
})
// 文字
const label = viewer.entities.add({
  id:'label',
  position:Cesium.Cartesian3.fromDegrees(114.29,30.56,100),
  label:{
    text:'黄鹤楼',
    // 字号，字体
    font:'20px Helvetica',
    fillColor:Cesium.Color.BLUE,
    outlineColor:Cesium.Color.WHITE,
    outlineWidth:2,
    // 偏移量 二维偏移,(x,y)以二象限方向为正方向
    pixelOffset:new Cesium.Cartesian2(0,-30)
  }
})

// 图片
const logo = viewer.entities.add({
  id:'logo',
  position:Cesium.Cartesian3.fromDegrees(114.29,30.56,100),
  // 广告图标
  billboard:{
    image:'./黄鹤楼.png',
    width:30,
    height:30,
    pixelOffset:new Cesium.Cartesian2(0,-10)
  }
})
// 3d模型，模型网站：fab.com  是epic旗下的模型库，glb格式比较好
const plane = viewer.entities.add({
  id:'plane',
  position:Cesium.Cartesian3.fromDegrees(114.29,30.56,3000),
  model:{
    // 注意是uri不是url，意义是一样的,都是路径,这个必要
    uri:'ww_plane.glb',
    // 最小像素大小
    minimumPixelSize:128,
    // 轮廓
    silhouetteColor:Cesium.Color.WHITE,
    silhouetteSize:2,
    // 离地高度超过xm米就不显示该模型
    distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,10000)
  }
})
// 以上的要素都是基于点的基础添加的

// 线要素实体 position写在polyline里面,与上述点要素有区别,由于需要两个坐标决定起始,结尾,所以坐标获取也有区别,这里用的是数组
viewer.entities.add({
  name:'line',
  polyline:{
    // 武汉--北京
    positions:Cesium.Cartesian3.fromDegreesArray([114.29,30.56,116.46,39.92]),
    width:10,
    // 材质
    material:new Cesium.PolylineOutlineMaterialProperty({
      color:Cesium.Color.BLUE,
      outlineWidth:2,
      outlineColor:Cesium.Color.WHITE
    })
  }
})

// 创建网格材质 待会儿挂给实体的meterial,这个见meterialProperty的API
const grid = new Cesium.GridMaterialProperty({
  color:Cesium.Color.BLUE,
  // 网格线
  lineCount:new Cesium.Cartesian2(4,4),
  // 粗细 默认1，1，分别标识纵横
  lineThickness:new Cesium.Cartesian2(2,2)
})

// 创建图片作为材质
const image = new Cesium.ImageMaterialProperty({
  image:'/黄鹤楼.png',
  // 重复次数，纵横各 X 次
  repeat:new Cesium.Cartesian2(4,4),
})

// 创建条纹材质 见api
const stripe = new Cesium.StripeMaterialProperty({
    orientation:Cesium.StripeOrientation.VERTICAL,
    // 两个颜色，over偶数条，odd奇数条
    overColor:Cesium.Color.BLUE,
    oddColor:Cesium.Color.RED,
    // 重复次数
    repeat:10
})

// 面要素实体
viewer.entities.add({
  name:'rect',
  rectangle:{
    coordinates:Cesium.Rectangle.fromDegrees(
      114.2995,30.5503,114.3503,30.6283
    ),
    // 实体材质meterial是一个具有很多属性的api 参考文档meterialProperty
    // 材质包(网格)  注意这里的网格属性设置会与cesium.Color重复,只能取其一使用
    material: stripe,//image,//grid
    // Cesium.Color.RED.withAlpha(0.5),
    outline:true,
    outlineColor:Cesium.Color.WHITEj,
    outlineWidth:2,
    // // 三维化高度(米)
    // extrudedHeight:1000,
    // // 离地高度
    // height:100,
    // 三维化高度会被减去离地高度
  }
})






