---
layout: photopost
title: css3 3D
date: 2018-03-16 12:00:04
tags:
---
css3 3D 转换
<!-- more -->

#css3 3D坐标系

css3 的2D、3D转换可以对元素进行移动、缩放、转动、拉伸等效果。相比于2D转换，3D转换可以让元素在三维的空间里进行变换，就好比数学中的平面几何和立体几何。理解css3 3D转换的第一步就是理解3D坐标系。

面对屏幕的视角上，对于坐标轴的位置可以这样理解：
x轴: 水平方向  （ → 正 ）
y轴: 垂直方向    （ ↓ 正 ）
z轴: 垂直于屏幕的方向 （ 正 ）

对于方向，可以用这种形象的方法来理解，每个坐标轴上都有一个弓箭🏹，箭头为正，箭尾为负。
x轴上的弓箭是箭头朝右的；
Y轴上的弓箭箭头朝下；
而z轴上的弓箭箭头是对着我们的脸的。

坐标轴的正负方向影响着元素移动（translate）的方向, 而元素旋转（rotate）的方向是围绕着这三个坐标轴的。

rotateX/Y/Z 方向 左手定理
例,z-index 让元素在z轴上移动
插入笔记:
p:nth-child 选择：一个p标签 && 它是父标签的第二个子元素
p:nth-of-type 选择：父标签的子元素中的第二个p标签
###transform	
    向元素应用 2D 或 3D 转换
    translate(x,y): 定义 2D 转换。
#旋转时坐标系会跟着一起旋转
    ```less
        // 先旋转再位移 和 先位移再旋转是 不一样的, 因为旋转和使坐标轴跟着旋转
        transform: rotatex(60deg) translatez(100px);
        transform: translatez(100px) rotatex(60deg);
    ```
    
######transform
    
###transform-origin	
    允许你改变被转换元素的位置
    transform-origin: x-axis y-axis z-axis;
    x-axis:(left,center,right,length,%)，默认50%
    y-axis:(top,center,bottom,length,%)，默认50%
    z-axis:length, 默认0
###transform-style	
    规定被嵌套元素如何在 3D 空间中显示
    transform-style: preserve-3d | flat(默认，平面)
    preserve-3d表示3D透视
###perspective	
    规定 3D 元素的透视效果
    perspective 透视。perspective的存在决定了2D还是3D。
    perspective定义在父元素和当前动画元素的区别。
   

###perspective-origin	
    规定 3D 元素的底部位置
    perspective-origin: x-axis y-axis;
    x-axis: (left,center,right,length,%)，默认50%，从左到右0%~100%   
    y-axis: (top,center,bottom,length,%)，默认50%，从上到下0%~100%   
    透视点看去的位置
    默认就是所看舞台或元素的中心
###backface-visibility	
    定义元素的背面是否可见。
    backface-visibility:visible(默认) | hidden;