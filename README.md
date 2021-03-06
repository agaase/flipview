flipview 
========

![alt text](https://lh4.googleusercontent.com/-WVO0MaxF3SM/U51mzlvMFRI/AAAAAAAAJfw/CZcNtTPSwBg/s279/flipview_sample.gif "This is what it looks like but more smoother.")

A flip view in Javascript to display current, prev and next slide. The html for the slides can be set in the callback functions executed once flip right or flip left happens. It also has the panning feature which means user can drag left or right instead of doing a simple flip. 


## How it works?
It uses css3 animation to carry out 3d rotation of slides. At any point of time there are only 3 slides which have the previous, current and next rendered HTML to display. The visible side represents the current slide and the next and previous slides are hidden. The next/previous HTML is dynamically appended when rotation is finished.


##Demos
1. [A simple flipview] (http://agaase.github.io/webpages/flipview/) which acts as an image carousel with change of image happening on flip/pan.

2. [Responsive full screen demo] (http://agaase.github.io/webpages/flipview/demo_responsive.html) Displays the next number in sequence on flip/pan.

##How the DOM structure works?
The above implementation works with a particular dom layout. There are mainly 3 DOM elements required and they have the following classes assigned.

  1. flipArea(user provided) - This is the root container where the rotation takes place. This is where 
    * Touch event is receieved; so if user tries to drag from outside the flipview the event will be received as long as its inside the flipArea
    * The perspective of rotation is defined. Learn more about pespective [here](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective).
  
  2. flipView (user provided)-  This is the actual flipView which is rotated. This is the container for the slides which contain the HTML for previous, next and current set.
  3. flipSlide(automatically generated) - These are the data holders for the previous, current and next HTML. They are further assigned following classes to identify their position
    * front - identifies the current displaying slide.
    * next - the next slide in sequence.
  * prev - the previous slide.

##How to use it?
Define the fliparea and flipview in your DOM. Fliparea should be bigger than your flipview. An example of the arrangement can be like this.

```html
<div class="flipArea" style='width:800px;height:600px;'>
<div class="flipView" style='width:700px;height:500px;margin:auto;'>
</div>
</div>
```
Once the DOM is defined call flipview lib.
```javascript
var flip = new flipview(container);
```
After initialising flipview you also need to define the functions which will render the next and previous set on flip.
```javascript
var count = 1;
flip.onFlipNext = function(){
  // assign dom to the next slide (slide with class 'next')
};
flip.onFlipPrev = function(){
  // assign dom to the prev slide (slide with class 'prev')
};
```

##Options
You can pass options while initialising flipview like below.
```javascript
var flip = new flipview(container,{
  "speed" : "slow"
});
```

1. speed - pass "fast"/"slow" or the actual time in milliseconds which is the time it takes to complete one flip. Default value is 1300ms.

2. maxScale - floating point number (<=1) which decides the size slide will be reduced to while rotating. for e.g passing 0.5 will reduce it to maximum half size at the middle point of rotation. Default value is 0.3

****More options coming soon

