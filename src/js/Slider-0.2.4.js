/**
 * Slider.js - version 0.2.4 - 24/04/14
 * 
 * Copyright (c) 2014 Nathan Bishop
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
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
     * Constructor
     * 
     * @constructs
     * @param {object} Additional configuration options.
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
     * Builds the slider manually. Elements can be accessd 
     * using the class property "elements".
     * 
     * @protected
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
     * Sets default positions, helper properties additional
     * classes or anything else that might be needed. Essentially
     * a post-build method.
     * 
     * @protected
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
     * Attaches the needed event handlers, enabling the 
     * slider for use.
     * 
     * @public
     */
    attach: function () {
        this.elements.knob.addEvent('mousedown', this.bound.start);
    },
    
    /**
     * Detaches event handlers, preventing the slider from
     * being used.
     * 
     * @public
     */
    detach: function () {
        this.elements.knob.removeEvent('mousedown', this.bound.start);
    },
    
    /**
     * Defines the mouse limits and starting
     * co-ordinates. Once this function is called
     * we are dragging.
     * 
     * @event
     * @protected
     * @param {object} The mousedown event object.
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
     * Applies the limits and moves the knob.
     * 
     * @event
     * @protected
     * @param {object} The mousemove event object.
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
     * Removes the events used for the drag operation.
     * 
     * @event
     * @protected
     * @param {object} The mouseup event object.
     */
    stop: function (e) {        
        document.removeEvent('mousemove', this.bound.drag);
        document.removeEvent('mouseup', this.bound.end);
        
        this.dragging = false;
        this.fireEvent('stop', this.getPosition());
    },
    
    /**
     * When using the class in a reversed state, this
     * function switches the margins around. Applies
     * to 'margin-left' and 'margin-right' only.
     * 
     * @private
     */
    reverse: function () {
        var knob = this.elements.knob,
            margin = knob.getStyle('margin-left');
        
        knob.setStyle('margin-left', 'auto')
            .setStyle('margin-right', margin);
    },
    
    /**
     * Sets the knob position in CSS pixels.
     * 
     * @public
     * @param {number} A value defined in CSS pixels.
     * @param {boolean} If true, prevents the 'onStep' event from firing.
     */
    setPosition: function (step, negate) {
        this.elements.knob.style[this.modifier[this.axis]] = step + 'px';
        if (!negate) { this.fireEvent('step', step); }
    },
    
    /**
     * Retreives the knob position in CSS pixels.
     * 
     * @public
     */
    getPosition: function () {
        return parseInt(this.elements.knob.style[this.modifier[this.axis]]);
    },
    
    /**
     * Returns the slider as a HTML node when using
     * the "$" function.
     * 
     * @public
     */
    toElement: function () {
        return this.elements.slider;
    }
});
