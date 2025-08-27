# 图标文件目录

请在此目录下放置以下尺寸的图标文件：

## 必需文件

- `icon16.png` - 16x16像素，用于扩展管理页面
- `icon48.png` - 48x48像素，用于扩展管理页面
- `icon128.png` - 128x128像素，用于Chrome网上应用店

## 图标设计建议

- 使用简洁的设计，在小尺寸下也要清晰可见
- 建议使用Temu相关的颜色方案（橙色、红色渐变）
- 可以使用字母"T"或购物相关的图标
- 保持透明背景或圆角矩形背景

## 快速生成图标

你可以使用以下方法生成图标：
1. 使用在线图标生成工具
2. 使用设计软件(如Photoshop、Figma)创建
3. 使用提供的JavaScript代码在浏览器控制台中生成简单图标

## 临时解决方案

如果暂时没有图标文件，可以先创建同名的空白PNG文件，插件仍然可以正常工作，只是不会显示图标。

## 快速生成图标代码

可以在浏览器控制台中运行以下代码生成简单图标：

```javascript
// 图标生成函数
const generateIcon = (size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ee5a24');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // 圆角效果
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();
    
    // 文字
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.35}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', size / 2, size / 2);
    
    return canvas.toDataURL();
};

// 生成并下载图标
['16', '48', '128'].forEach(size => {
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = generateIcon(parseInt(size));
    link.click();
});
```