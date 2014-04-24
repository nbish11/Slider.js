/*
---
description: A slider designed primarily for media use, that does not 
depend on MooTools More.

license: MIT-style

authors:
- Nathan Bishop

requires:
- core/1.4.5

provides:
- Slider

...
*/
var Slider = new Class({
    Implements: [Events, Options],
    
    options: {/*
        onStart: function (step) {},
        onDrag: function (step) {},
        onStop: function (step) {},
        onStep: function (position) {},*/
        disabled: false,
        reverse: false,
        mode: 'horizontal'
    },
    
    /**
     * @param {Object} Additional configuration options.
     */
    initialize: function (options) {
        this.setOptions(options);
        
        this.dragging = false;
        this.bound = {
            start: this.start.bind(this),
            drag: this.drag.bind(this),
            stop: this.stop.bind(this)
        };
        
        this.build();
        this.setup();
    },
    
    /**
     * @description Builds the slider manually. Elements can be accessd 
     * using the class property "elements".
     */
    build: function () {
        this.elements = {
            slider: new Element('div.slider'),
            track: new Element('div.track'),
            overlay: new Element('div.overlay'),
            bar: new Element('div.bar'),
            knob: new Element('div.knob')
        };
        
        this.elements.track.adopt(
            this.elements.overlay,
            this.elements.bar,
            this.elements.knob
        );
        
        this.elements.slider.grab(
            this.elements.track
        );
    },
    
    /**
     * @description Sets default positions, helper properties additional
     * classes or anything else that might be needed. Essentially
     * a post-build method.
     */
    setup: function () {
        // some helper properties
        this.hmode = this.options.mode === 'x' || this.options.mode === 'horizontal';
        this.vmode = this.options.mode === 'y' || this.options.mode === 'vertical';
        this.axis = this.vmode ? 'y' : this.hmode ? 'x' : false;
        
        // Sets the reference point to be used for each axis.
        this.modifier = {
            x: this.options.reverse ? 'right' : 'left',
            y: this.options.reverse ? 'bottom' : 'top'
        };
        
        // set the knob's default position
        if (isNaN(this.getPosition())) { this.setPosition(0); }
        if (isNaN(this.getPosition())) { this.setPosition(0); }
        
        // holds all mouse related coordinates
        this.mouse = { pos: 0, min: 0, max: 0 };
        
        // add slider class direction, it doesn't 
        // belong in the build() method.
        if (this.elements.slider) {
            var sliderClass = this.vmode ? 'vertical' : 'horizontal';
            this.elements.slider.addClass(sliderClass);
        }
        
        // reverse any negative margins if neccessary.
        if (this.options.reverse) {
            this.reverse();
        }
        
        if (!this.options.disabled) {
            this.attach();
        }
    },
    
    /**
     * @summary Attaches the needed event handlers, enabling the 
     * slider for use.
     */
    attach: function () {
        this.elements.knob.addEvent('mousedown', this.bound.start);
    },
    
    /**
     * @summary Detaches event handlers, preventing the slider from
     * being used.
     */
    detach: function () {
        this.elements.knob.removeEvent('mousedown', this.bound.start);
    },
    
    /**
     * @description Defines the mouse limits and starting
     * co-ordinates. Once this function is called,
     * we are dragging.
     * 
     * @param {Object} The mousedown event object.
     */
    start: function (e) {
        var track = this.elements.track,
            limit = track.getSize()[this.axis],
            step = this.getPosition(),    // knob position
            pos = e.client[this.axis];    // mouse position
        
        // Were "officially" dragging now.
        this.mouse.pos = pos;
        this.dragging = true;
        
        // Find the min and max mouse positions.
        if (this.options.reverse) {
            this.mouse.max = -0 + pos + step;
            this.mouse.min = -limit + pos + step;
        } else{
            this.mouse.min = pos - step + 0;
            this.mouse.max = this.mouse.min + limit - 0;
        }

        document.addEvent('mousemove', this.bound.drag);
        document.addEvent('mouseup', this.bound.stop);
        
        this.fireEvent('start', step);
        return false;
    },
    
    /**
     * @summary Applies the limits and moves the knob.
     * @param {Object} The mousemove event object.
     */
    drag: function (e) {
        var step = this.getPosition(),    // knob position
            pos = e.client[this.axis],    // mouse position
            to;
        
        // Limit knob movement / find new position.
        pos = pos.limit(this.mouse.min, this.mouse.max);
        to = step + ((pos - this.mouse.pos) * (this.options.reverse ? -1 : 1));

        // Move element / store current position.
        this.setPosition(to, true);
		this.mouse.pos = pos;
        
        // fire event
        this.fireEvent('drag', step);
		return false;
    },
    
    /**
     * @summary Removes the events used for the drag operation.
     * @param {Object} The mouseup event object.
     */
    stop: function (e) {        
        document.removeEvent('mousemove', this.bound.drag);
        document.removeEvent('mouseup', this.bound.end);
        
        this.dragging = false;
        this.fireEvent('stop', this.getPosition());
    },
    
    /**
     * @description When using the class in a reversed state, this
     * function switches the margins around. Applies
     * to 'margin-left' and 'margin-right' only.
     */
    reverse: function () {
        var knob = this.elements.knob,
            margin = knob.getStyle('margin-left');
        
        knob.setStyle('margin-left', 'auto')
            .setStyle('margin-right', margin);
    },
    
    /**
     * @summary Sets the knob's position.
     * @param {Number} A value defined in CSS pixels.
     * @param {Boolean} If true, prevents the 'onStep' event from firing.
     */
    setPosition: function (step, negate) {
        this.elements.knob.style[this.modifier[this.axis]] = step + 'px';
        if (!negate) { this.fireEvent('step', step); }
    },
    
    /**
     * @summary Retreives the knob's position.
     * @return {Number} The position in CSS pixels.
     */
    getPosition: function () {
        return parseInt(this.elements.knob.style[this.modifier[this.axis]]);
    },
    
    /**
     * @summary Returns the slider as a HTML node when using
     * the "$" function.
     * @return {Element} The div.slider as a complete string.
     */
    toElement: function () {
        return this.elements.slider;
    }
});
