/*
 * Default categories template JS.
 * html : categories.html
 * devices : tablet/smartphone.
 * *******/

var flipview = (function(){
    var slideIds = [-1,0,1];
    var flipEleSelector = ".flipView";
    var speedMapping = {"fast":400,"slow":2000};

    var fm = function(flipView,maxslides,options){
        this.params = options || {};
        this.flipArea = flipView.parent();
        this.flipEle = flipView;
        this.rotAngle = 0;
        this.maxSlides = maxslides;
        this.slideIds = [-1,0,1];
        setupLayout.call(this);
        bindFlipEvent.call(this);
        setupConfigurations.call(this);
    };

    /**
     * Sets up the various configurational parameters
     * @method setupConfigurations
     */
    var setupConfigurations = function(){
        var speed = parseInt(this.params.speed);
        if(!speed){
            speed = ((typeof(this.params.speed) === "string" ? speedMapping[this.params.speed] : 1000 ) || 1000);
        }
        this.params.speed = speed/1000;
    };

    /**
     * Sets up the DOM layout.
     * @method setupLayout
     */
    var setupLayout = function(){
        this.flipEle.css("position","relative").append("<div class='front'></div>").append("<div class='next'></div>").append($("<div class='prev'></div>"));
        this.flipArea.css("-webkit-perspective","1000");
        this.flipEle.css("-webkit-transform-style","preserve-3d");
        $(flipEleSelector +" > div").css({"-webkit-backface-visibility":"hidden","position":"absolute","height":"100%","width":"100%"}).addClass("flipSlide");
        $(".next,.prev",this.flipEle).hide().css("-webkit-transform","rotateY(-180deg)");
    };

    /**
     * Binds touch events to calculate the exact logic for doing flipping and panning.
     * @method bindFlipEvent
     * @return {[type]}
     */
    var bindFlipEvent = function(){
        var minimumDisplPossible = 10;
        var touchEndTimer, touchMoveTimer, startPosX, lastPosX, firstTouchMove = true;
        var handleTouchstart = function(ev){
                var touchobj = ev.originalEvent.changedTouches[0];
                startPosX = touchobj.pageX;
                lastPosX = touchobj.pageX;
            }.bind(this);
        var handleTouchmove = function(ev){
            ev.preventDefault();
            var touchobj = ev.originalEvent.changedTouches[0];
            if(Math.abs(touchobj.pageX-lastPosX)<minimumDisplPossible){
                //return;
            }
            lastPosX = touchobj.pageX;
            if((startPosX < 550 && this.slideIds[0] !==-1) || (startPosX > 650 && this.slideIds[2] !==-1)){
                    if(firstTouchMove){
                        if(startPosX < 550){
                            $(".prev",this.flipEle).show();
                            $(".next",this.flipEle).hide();
                        }else if(startPosX > 650){
                            $(".next",this.flipEle).show();
                            $(".prev",this.flipEle).hide();
                        }
                        setTimeout(function(){
                            pan.call(this,(touchobj.pageX-startPosX)/2,startPosX < 550 ? 1 : -1);
                        }.bind(this),50);
                        firstTouchMove=false;
                    }
                    pan.call(this,(touchobj.pageX-startPosX)/3,startPosX < 550 ? 1 : -1);
            }
        }.bind(this);
        var handleTouchend = function(ev){
                ev.preventDefault();
                if(touchEndTimer){
                    clearTimeout(touchEndTimer);
                }
                touchEndTimer = setTimeout(function(){
                    var touchobj = ev.originalEvent.changedTouches[0];
                    if((touchobj.pageX-startPosX)<-100 && startPosX > 800 && this.slideIds[2] !==-1) {
                        if(firstTouchMove){
                            $(".next",this.flipEle).show();
                            $(".prev",this.flipEle).hide();
                        }
                        setTimeout(function(){
                            flip.call(this,-1);    
                            firstTouchMove=true;
                        }.bind(this),50);
                        firstTouchMove=true;
                    }else if((touchobj.pageX-startPosX)>100 && startPosX < 400 && this.slideIds[0] !== -1){
                        if(firstTouchMove){
                            $(".prev",this.flipEle).show();
                            $(".next",this.flipEle).hide();
                        }
                        setTimeout(function(){
                            flip.call(this,1);    
                            firstTouchMove=true;
                        }.bind(this),50);
                        
                    }else{
                        pan.call(this,0,1);
                        this.flipEle.css({"transition-duration":this.params.speed+"s"});    
                        firstTouchMove=true;
                    }
                }.bind(this),50);
            }.bind(this);
        this.flipArea.on('touchstart',handleTouchstart).on('touchmove',handleTouchmove).on('touchend',handleTouchend);
    };

    /**
     * After the rotation the slides have to be switched.
     * @method setSlides
     * @param  {string}  direction [description]
     */
    var setSlides = function(direction){
            var nextEle = $(".next",this.flipEle);
            var currEle = $(".front",this.flipEle);
            var prevEle = $(".prev",this.flipEle);
            
            if(direction<0){
                this.slideIds[0] = this.slideIds[1];
                this.slideIds[1] = this.slideIds[2];
                this.slideIds[2] = (this.slideIds[1]+1) < this.maxSlides? (this.slideIds[1]+1) : -1 ;
                nextEle.removeClass("next").addClass("front");
                prevEle.removeClass("prev").addClass("next");
                currEle.removeClass("front").addClass('prev');
            }else{
                this.slideIds[2] = this.slideIds[1];
                this.slideIds[1] = this.slideIds[0];
                this.slideIds[0] = (this.slideIds[0]-1);
                nextEle.removeClass("next").addClass("prev");
                prevEle.removeClass("prev").addClass("front");
                currEle.removeClass("front").addClass('next');
            }
    };
    
    /**
     * Carries out the flip operation rotating the whole outer slide by 180.
     * @method flip
     * @param  {[type]} direction [description]
     * @return {[type]}
     */
    var flip = function(direction){
            if(this.beforeFlip){
                this.beforeFlip(direction);
            }
            this.rotAngle += (direction * 180);
            var ang = this.rotAngle;
            this.flipEle.css({"-webkit-transform":"rotateY("+(ang)+"deg)","transition-duration":this.params.speed+"s","transition-timing-function":"linear"});        
            setTimeout(function(){
                //Draw the next set of articles; well only if something is there to draw
                setSlides.call(this,direction);
                if(direction<0 && this.slideIds[2] > -1){
                    this.onFlipNext();
                    $(".next",this.flipEle).css("-webkit-transform","rotateY("+((this.slideIds[2]%2)*180)+"deg)");

                }else if(direction>0 && this.slideIds[0] > -1){
                    this.onFlipPrev();
                    $(".prev",this.flipEle).css("-webkit-transform","rotateY("+((this.slideIds[2]%2)*180)+"deg)");
                }
            }.bind(this),1000);
    };

    /**
     * Calculates the scale value to which the slide size should be reduced to.
     * @method getScaleValue
     * @param  {number}      angleRotated The angle by which slide is rotated
     * @return {number}
     */
    var getScaleValue = function(angleRotated){
        angleRotated = Math.min(Math.abs(angleRotated),180);
        angleRotated = angleRotated > 90 ? 90-angleRotated : angleRotated;
        var maxScale = this.params.maxScale/100 || 0.4;
        return(1 - (angleRotated >= 0 ? (angleRotated/90)*maxScale : maxScale + (angleRotated/90)*maxScale));
    };
    
    /**
     * Carries out rotation as per the value calculated from the event.
     * @method pan
     * @param  {number} angleToRotate the angle to rotate as a number.
     * @param  {number} direction     -1 clockwise, 1 anticlockwise
     */
    var pan = function(angleToRotate,direction){
            var angle = this.rotAngle+angleToRotate;
            if(direction>0){
                angle = angle < this.rotAngle ? this.rotAngle : angle;
                if(angle - this.rotAngle > 180){
                    angle = this.rotAngle + 180;
                }
            }else if(direction <= 0){
                angle = angle > this.rotAngle ? this.rotAngle : angle;
                if(this.rotAngle - angle  > 180){
                    angle = this.rotAngle - 180;
                }
            }
            var dur = (this.params.speed/180)*(Math.abs(angle - this.rotAngle));
            this.flipEle.css({"-webkit-transform":"scale("+getScaleValue.call(this,angleToRotate)+") rotateY("+angle+"deg)","transition-duration":""+dur+"s","transition-timing-function":"linear"});    
    };
   return fm;
})();
/*==END==============================*categories.js*================*/