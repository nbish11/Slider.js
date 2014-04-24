Slider.js
=========

A simple slider for MooTools.

Requirements
------------
* MooTools 1.3+

Basic Usage
-----------
Include the ```Slider.css``` file in the ```head``` tag of your HTML document and include the
```Slider.js``` file and the MooTools library in the ```body``` tag down the bottom.

```js
// Instantiate - Horizontal
var sliderY = new Slider();

// Append to body tag.
document.body.grab($(sliderY));
```

```js
// Instantiate - Vertical Reversed
var sliderRY = new Slider({
  mode: 'horizontal', // valid: 'x', 'y', 'vertical', 'horizontal'
  reverse: true
});

// Append to body tag.
document.body.grab($(sliderRY));
```
