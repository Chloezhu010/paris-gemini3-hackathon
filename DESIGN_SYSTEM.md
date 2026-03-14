# Design System — Competitor Research Agent for Designers

清晰简洁 + 实验性 + 清爽有辨识度

## 🎨 颜色系统

### 品牌色
- **Primary (天蓝)** - `#0ea5e9` - 主交互、重要按钮
  - 用途：CTA、关键交互、品牌标识
  - Hover: `#0284c7`
- **Accent (清新绿)** - `#22c55e` - 强调、成功状态
  - 用途：成功提示、二级CTA、强调信息
  - Hover: `#16a34a`

### 中立色（现代灰度）
- **Slate 50** - `#f8fafc` - 最浅背景
- **Slate 100** - `#f1f5f9` - 次背景
- **Slate 200** - `#e2e8f0` - 边框、分割线
- **Slate 500** - `#64748b` - 次级文字、Disabled
- **Slate 700** - `#334155` - 主文字（浅色背景）
- **Slate 900** - `#0f172a` - 深色主题背景

### 功能色
- **Success** - `#22c55e`（Accent）
- **Warning** - `#f59e0b`
- **Error** - `#ef4444`
- **Info** - `#0ea5e9`（Primary）

---

## 📐 间距系统

```
xs:   4px
sm:   8px
md:   12px
lg:   16px
xl:   24px
2xl:  32px
3xl:  48px
4xl:  64px
```

**使用原则：**
- 组件内部：sm/md
- 组件之间：lg/xl
- 分组：2xl
- 页面顶级：3xl/4xl

---

## 🔤 排版系统

### 字体栈
- 正文：系统无衬线字体（SF Pro / Segoe UI）
- 等宽：Monaco / Menlo

### 字号级别
```
xs:   12px / 16px height
sm:   14px / 20px height
base: 16px / 24px height
lg:   18px / 28px height
xl:   20px / 28px height
2xl:  24px / 32px height
3xl:  30px / 36px height
4xl:  36px / 44px height
```

### 标题
- **H1** - 36px, Bold, 标题页
- **H2** - 30px, Bold, 主分组
- **H3** - 24px, Bold, 子标题
- **H4** - 20px, Semibold, 卡片标题

### 正文
- **Body** - 16px, Normal, 主内容
- **Body Small** - 14px, Normal, 副文本
- **Caption** - 12px, Medium, 标签、提示

---

## 📦 组件库

### Button
```html
<!-- Primary CTA -->
<button class="btn-primary">Get Started</button>

<!-- Secondary -->
<button class="btn-secondary">Cancel</button>

<!-- Ghost (minimal) -->
<button class="btn-ghost">Learn More</button>
```

### Card
```html
<div class="card">
  <h3 class="text-heading-4 mb-lg">Competitor: Instagram</h3>
  <p class="text-body text-slate-600">Design insights...</p>
</div>
```

### Badge
```html
<span class="badge-primary">User Flow</span>
<span class="badge-accent">Pattern</span>
<span class="badge-secondary">Reference</span>
```

### Input
```html
<input
  type="text"
  class="input-base"
  placeholder="Describe your feature idea..."
/>
```

---

## 🎬 动画 & 过渡

### 预定义动画
- `animate-fade-in` - 淡入（300ms）
- `animate-slide-up` - 向上滑入（300ms）
- `animate-scale-in` - 缩放进入（200ms）

### 过渡时间
- `duration-fast` - 150ms（微交互）
- `duration-normal` - 200ms（标准）
- `duration-slow` - 300ms（强调）

### 缓动函数
- `ease-smooth` - `cubic-bezier(0.4, 0, 0.2, 1)`
- `ease-smooth-in` - `cubic-bezier(0.4, 0, 1, 1)`
- `ease-smooth-out` - `cubic-bezier(0, 0, 0.2, 1)`

**使用示例：**
```jsx
<div className="transition duration-normal ease-smooth hover:shadow-lg">
  Smooth interaction
</div>
```

---

## 🌈 阴影系统

### 实用阴影
```
shadow-xs    - 微妙（1px）
shadow-sm    - 小（3px）
shadow-md    - 中（6px）
shadow-lg    - 大（15px）
shadow-xl    - 超大（25px）
```

### 实验性彩色阴影
```
shadow-glow-primary  - 蓝色发光（20px, 20% opacity）
shadow-glow-accent   - 绿色发光（20px, 20% opacity）
```

**使用示例：**
```jsx
<div className="card shadow-md hover:shadow-lg hover:shadow-glow-primary">
  Interactive card
</div>
```

---

## 📍 圆角系统

```
rounded-xs  - 4px （细微）
rounded-sm  - 6px （按钮）
rounded-md  - 8px （输入框）
rounded-lg  - 12px （卡片）
rounded-xl  - 16px （大组件）
rounded-full - 圆形 （头像）
```

---

## 🎯 使用指南

### 色彩应用
```jsx
// CTA 按钮
<button className="bg-primary-500 text-white hover:bg-primary-600">
  Analyze
</button>

// 卡片边框
<div className="border border-slate-200 dark:border-slate-700">

// 成功提示
<div className="bg-accent-50 border border-accent-200 text-accent-900">
  Success!
</div>
```

### 间距应用
```jsx
// 容器内部
<div className="p-lg">

// 元素之间
<div className="space-y-xl">

// 网格间距
<div className="grid gap-lg">
```

### 排版应用
```jsx
// 页面标题
<h1 className="text-heading-1 mb-2xl">Design Research Tool</h1>

// 卡片标题
<h3 className="text-heading-4 mb-lg">Instagram Flow</h3>

// 正文
<p className="text-body text-slate-700">Design description...</p>

// 次文本
<p className="text-body-sm text-slate-500">Secondary info</p>
```

---

## 🔄 Dark Mode

所有组件都内置了深色模式支持：

```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  Automatically adapts to dark mode
</div>
```

---

## 📱 响应式设计

使用 Tailwind 的响应式前缀：

```jsx
<div className="text-base sm:text-lg md:text-xl lg:text-2xl">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
  Responsive grid
</div>
```

---

## ✨ 实验性特性

### 微妙渐变
```jsx
<div className="bg-gradient-to-br from-primary-50 to-accent-50">
  Subtle gradient background
</div>
```

### 彩色发光卡片
```jsx
<div className="card shadow-glow-primary hover:shadow-glow-primary">
  Glowing effect on hover
</div>
```

### 平滑过渡
```jsx
<button className="transition-all duration-normal ease-smooth hover:scale-105">
  Smooth scale on hover
</button>
```

---

## 🎨 工具

### Tailwind IntelliSense
在 VS Code 中使用 Tailwind CSS IntelliSense 扩展获得自动补全

### Color Picker
快速查看颜色对比：
- Primary-500 on White: WCAG AA ✓
- Accent-500 on White: WCAG AA ✓

---

## 📌 最佳实践

1. **使用语义 class** - 用 `.card` 而不是 `.border .rounded-lg .shadow`
2. **保持一致性** - 所有间距使用系统值
3. **深色模式友好** - 在编写样式时同时考虑深色
4. **性能优先** - 使用预定义的过渡而不是自定义值
5. **可读性** - 保持高对比度，优先考虑可访问性
