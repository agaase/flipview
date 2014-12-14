/*
 * Default categories template JS.
 * html : categories.html
 * devices : tablet/smartphone.
 * *******/

var flipview = (function(){
    var slideIds = [-1,0,1];
    var flipRuleId = 10;
    var speedMapping = {"fast":700,"slow":2000,"default" : 1300};
    var defaultMaxScale = 0.3;

    var fm = function(flipView,maxslides,options){
        this.params = options || {};
        this.flipArea = flipView.parent();
        this.w = this.flipArea.width();
        this.leftCutoff = flipView[0].getBoundingClientRect().left + parseInt(this.w/2-this.w/15,10);
        this.rightCutoff = flipView[0].getBoundingClientRect().left + parseInt(this.w/2+this.w/15,10);
        this.flipEle = flipView;
        this.rotAngle = 0;
        this.maxSlides = maxslides;
        this.slideIds = [-1,0,1];
        setupLayout.call(this);
        bindFlipEvent.call(this);
        setupConfigurations.call(this);
    };

    var transitionSlide = function(fromAngle, toAngle, dir){
        fromAngle = fromAngle || (dir === -1 ? toAngle + 180 : toAngle - 180);
        console.log("Rotating from angle - "+ fromAngle + " to angle - "+ toAngle);
        var diff = Math.abs(Math.abs(fromAngle)-Math.abs(toAngle));
        var level = parseInt(((diff-90)/180)*100,10);
        var time = this.params.speed*level/100;
        if(diff>90){
            var halfAngle = dir === -1 ? toAngle + 90 : toAngle - 90;
            this.flipEle.css({"-webkit-transform":"scale("+this.params.maxScale+") rotateY("+(halfAngle)+"deg)","transform":"scale("+this.params.maxScale+") rotateY("+(halfAngle)+"deg)","-webkit-transition-duration":time+"s","-webkit-transition-timing-function":"linear","transition-duration":time+"s","transition-timing-function":"linear"});        
            setTimeout(function(){
                this.flipEle.css({"-webkit-transform":"scale(1) rotateY("+(toAngle)+"deg)","transform":"scale(1) rotateY("+(toAngle)+"deg)","-webkit-transition-duration":(this.params.speed-time)+"s","-webkit-transition-timing-function":"linear","transition-duration":(this.params.speed-time)+"s","transition-timing-function":"linear"});        
            }.bind(this),time*1000);
        }else{
            var dur = (this.params.speed/180)*(Math.abs(fromAngle - toAngle))*1000;
            setTimeout(function(){
                this.flipEle.css({"-webkit-transform":"rotateY("+(toAngle)+"deg)","transform":"rotateY("+(toAngle)+"deg)","-webkit-transition-duration":this.params.speed+"s","-webkit-transition-timing-function":"linear","transition-duration":this.params.speed+"s","transition-timing-function":"linear"});        
            }.bind(this),dur);
        }
    };

    /**
     * Sets up the various configurational parameters
     * @method setupConfigurations
     */
    var setupConfigurations = function(){
        var speed = parseInt(this.params.speed,10);
        var defaultSpeed = window.innerWidth > 700 ? speedMapping[this.params.speed] : 500; 
        if(!speed){
            speed = ((typeof(this.params.speed) === "string" ? speedMapping[this.params.speed] : defaultSpeed ) || defaultSpeed);

        }

        if(!speed){
            speed = typeof(this.params.speed) === "string" ? speed : "default";
            speed = speedMapping[speed] || speedMapping["default"];
            speed = window.innerWidth<700 ? speed/1.5 : speed;
        }
        this.params.speed = (speed/1000);
        this.params.maxScale = typeof(this.params.maxScale) === "number" ? this.params.maxScale : defaultMaxScale;
    };

    /**
     * Sets up the DOM layout.
     * @method setupLayout
     */
    var setupLayout = function(){
        this.flipEle.css("position","relative").append("<div class='front'></div>").append("<div class='next'></div>").append("<div class='prev'></div>");
        this.flipArea.css({"-webkit-perspective":"1000","perspective" : "1000"});
        this.flipEle.css({"-webkit-transform-style":"preserve-3d","transform-style":"preserve-3d"});
        $("> div",this.flipEle).css({"-webkit-backface-visibility":"hidden","backface-visibility":"hidden","position":"absolute","height":"100%","width":"100%"}).addClass("flipSlide");
        $(".next,.prev",this.flipEle).hide().css({"-webkit-transform":"rotateY(-180deg)","transform":"rotateY(-180deg)"});
    };  

    /**
     * Binds touch events to calculate the exact logic for doing flipping and panning.
     * @method bindFlipEvent
     * @return {[type]}
     */
    var bindFlipEvent = function(){
        var minimumDisplPossible = 10;
        var touchEndTimer, touchMoveTimer, startPosX, lastPosX, firstTouchMove = true, touchStarted = false;
        var handleTouchstart = function(ev){
                if(!this.flipLock){
                    touchStarted = true;
                }
                //var touchobj = ev.originalEvent.changedTouches[0];
                var touchobj = ev.originalEvent.type === "mousedown" ? ev.originalEvent : ev.originalEvent.changedTouches[0];
                startPosX = touchobj.pageX;
                lastPosX = touchobj.pageX;
            }.bind(this);
        var handleTouchmove = function(ev){
            ev.preventDefault();
            if(touchMoveTimer){
                clearTimeout(touchMoveTimer);
            }
            touchMoveTimer = setTimeout(function(){
                var touchobj = ev.originalEvent.type === "mousemove" ? ev.originalEvent : ev.originalEvent.changedTouches[0];
                if(!touchStarted){
                    return;
                }
                if(Math.abs(touchobj.pageX-lastPosX)<minimumDisplPossible){
                    //return;
                }
                lastPosX = touchobj.pageX;
                if((startPosX < this.leftCutoff && this.slideIds[0] !==-1) || (startPosX > this.rightCutoff && this.slideIds[2] !==-1)){
                        if(firstTouchMove){
                            if(startPosX < this.leftCutoff){
                                $(".prev",this.flipEle).show();
                                $(".next",this.flipEle).hide();
                            }else if(startPosX > this.rightCutoff){
                                $(".next",this.flipEle).show();
                                $(".prev",this.flipEle).hide();
                            }
                            pan.call(this,(touchobj.pageX-startPosX)/2,startPosX < this.leftCutoff ? 1 : -1);
                            firstTouchMove=false;
                        }
                        pan.call(this,(touchobj.pageX-startPosX)/3,startPosX < this.leftCutoff ? 1 : -1);
                }
            }.bind(this),firstTouchMove ? 30 : 5);
        }.bind(this);
        var handleTouchend = function(ev){
                if(!touchStarted){
                    return;
                }
                ev.preventDefault();
                if(touchEndTimer){
                    clearTimeout(touchEndTimer);
                }
                if(touchMoveTimer){
                    clearTimeout(touchMoveTimer);
                }
                touchEndTimer = setTimeout(function(){
                    touchStarted = false;
                    var touchobj = ev.originalEvent.type === "mouseup" ? ev.originalEvent : ev.originalEvent.changedTouches[0];
                    if((touchobj.pageX-startPosX)<-100 && startPosX > this.rightCutoff && this.slideIds[2] !==-1) {
                        if(firstTouchMove){
                            $(".next",this.flipEle).show();
                            $(".prev",this.flipEle).hide();
                        }
                        setTimeout(function(){
                            flip.call(this,-1);    
                            firstTouchMove=true;
                        }.bind(this),50);
                        firstTouchMove=true;
                    }else if((touchobj.pageX-startPosX)>100 && startPosX < this.leftCutoff && this.slideIds[0] !== -1){
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
        this.flipArea.on('mousedown',handleTouchstart).on('mousemove',handleTouchmove).on('mouseup',handleTouchend);
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
            this.flipLock = true;
            setTimeout(function(){
                //Locking any touch events until the flip is completed.
                //Not doing this is just too much of complexity.
                this.flipLock = false;
            }.bind(this),this.params.speed*1000);
            if(this.beforeFlip){
                //Callback function before calling flip.
                this.beforeFlip(direction);
            }
            var oldA = this.rotAngle;
            this.rotAngle += (direction * 180);
            var ang = this.rotAngle;
            
            transitionSlide.call(this,this.panAngle,this.rotAngle,direction);
            this.panAngle = undefined;
            setTimeout(function(){
                //Draw the next set of articles; well only if something is there to draw
                setSlides.call(this,direction);
                
                if(direction<0){
                    this.onFlipNext();
                    $(".next",this.flipEle).css({"-webkit-transform":"rotateY("+((this.slideIds[2]%2)*180)+"deg)","transform":"rotateY("+((this.slideIds[2]%2)*180)+"deg)"});
                }else if(direction>0){
                    this.onFlipPrev();
                    $(".prev",this.flipEle).css({"-webkit-transform":"rotateY("+((this.slideIds[2]%2)*180)+"deg)","transform":"rotateY("+((this.slideIds[2]%2)*180)+"deg)"});
                }
            }.bind(this),this.params.speed*1000);
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
        var scale = 1-(this.params.maxScale) ;
        return(1 - (angleRotated >= 0 ? (angleRotated/90)*scale : scale + (angleRotated/90)*scale));
    };
    
    /**
     * Carries out rotation as per the value calculated from the event.
     * @method pan
     * @param  {number} angleToRotate the angle to rotate as a number.
     * @param  {number} direction     -1 clockwise, 1 anticlockwise
     */
    var pan = function(angleToRotate,direction){
            if(this.flipLock){
                return;
            }
            angleToRotate = angleToRotate * 2000/window.innerWidth;
            var angle = this.rotAngle+angleToRotate;

            if(direction>0){
                this.panAngle = angle;
                angle = angle < this.rotAngle ? this.rotAngle : angle;
                if(angle - this.rotAngle >= 180){
                    angle = this.rotAngle + 180;
                }
            }else if(direction <= 0){
                this.panAngle = angle;
                angle = angle > this.rotAngle ? this.rotAngle : angle;
                if(this.rotAngle - angle  >= 180){
                    angle = this.rotAngle - 180;
                }
            }

            this.panAngle = angle;
            var dur = (this.params.speed/180)*(Math.abs(angle - this.rotAngle));
            var currScale = getScaleValue.call(this,angleToRotate);
            this.flipEle.css({"-webkit-transform":"scale("+currScale+") rotateY("+angle+"deg)","transform":"scale("+currScale+") rotateY("+angle+"deg)","-webkit-transition-duration":""+dur+"s","-webkit-transition-timing-function":"linear","transition-duration":""+dur+"s","transition-timing-function":"linear"});    
    };
   return fm;
})();
/*==END==============================*categories.js*================*/