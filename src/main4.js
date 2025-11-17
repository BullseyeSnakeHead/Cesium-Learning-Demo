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
  imageryProvider:false
  // cesium的logo隐藏不是在这儿配置的
})
// logo cesiumWidget的显示隐藏
viewer.cesiumWidget.creditContainer.style.display = 'none'

// 加载高德底图（首先得去掉默认底图）
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
  destination:Cesium.Cartesian3.fromDegrees(114.29,30.56,10000),
  duration:5
})

// 利用图元绘制矩形 图元是更深层于实体entity的概念,自定义配置更广泛

// 1.1创建矩形形状rectangle geometry实例，挂载经纬度位置
const rectGeometry = new Cesium.RectangleGeometry({
  rectangle:Cesium.Rectangle.fromDegrees(114.29,30.56,114.31,30.58)
})

// 1.2创建圆形形状circle geometry
const circleGeometry = new Cesium.CircleGeometry({
center:Cesium.Cartesian3.fromDegrees(114.29,30.56),
radius:1000
})

// 2.1创建实例instance
const recInstance = new Cesium.GeometryInstance({
  // 挂载
  geometry:rectGeometry,
  // id
  id:'rect',
  // 颜色配置 这里会与自定义的materi冲突？
  attributes:{
    color:Cesium.ColorGeometryInstanceAttribute.fromColor(
      Cesium.Color.RED.withAlpha(0.5)
    )
  }
})

// 2.2创建实例instance
const circleInstance = new Cesium.GeometryInstance({
  id:'circle',
  geometry:circleGeometry,
  attributes:{
    color:Cesium.ColorGeometryInstanceAttribute.fromColor(
      Cesium.Color.GREEN.withAlpha(0.5)
    )
  }
})


// 自定义材质，挂给primitive，primitive中的所有instance都会使用到这个material，覆盖原有instance的样式。这里也可以设置image材质，grid材质等等
const material = new Cesium.Material({
  fabric:{
    type:'Color',
    uniforms:{
      color:Cesium.Color.BLUE.withAlpha(0.5)
    }
  }
})
// 3.图元primitive,一个图元primitive可以挂载多个insatance,所以用数组作为挂载对象
const rectPrimitive = new Cesium.Primitive({
  geometryInstances:[recInstance,circleInstance],
  // apperence可以改变实例的材质  默认属性用PerInstanceColorAppearance配合instance里面的颜色配置使用。自定义材质用MateriApperance，会覆盖instance的颜色属性
  // appearance: new Cesium.PerInstanceColorAppearance({
  //   flat:true
  // })
   appearance:new Cesium.MaterialAppearance({
    material:material
   })
})

// 4.viewer挂载图元
viewer.scene.primitives.add(rectPrimitive)


