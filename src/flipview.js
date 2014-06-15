/*
 * Default categories template JS.
 * html : categories.html
 * devices : tablet/smartphone.
 * *******/

var flipview = (function(){
    var tileIds = [-1,0,1];
    var tileSelector = ".flipTile";
    var flipEleSelector = ".flipView";


    var fm = function(flipArea){
        this.flipArea = flipArea;
        this.flipEle = $(".flipView",this.flipArea);
        this.rotAngle = 0;
        this.tileIds = [-1,0,1];
        setupLayout.call(this);
        setViews.call(this);
    };


    var setupLayout = function(){
        this.flipArea.css("-webkit-perspective","1000");
        this.flipEle.css("-webkit-transform-style","preserve-3d");
        $(tileSelector,this.flipEle).css("-webkit-backface-visibility","hidden");
    };

    /* Normal draw function, just adding the code for initial draw of list of articles*/
    var setViews = function(){
        $(".back",this.flipEle).hide().css("-webkit-transform","rotateY(-180deg)");
        swipeEvent.call(this);
    };
 
    var setTiles = function(direction){
            var nextEle = $(".next",this.flipEle);
            var currEle = $(".front",this.flipEle);
            var prevEle = $(".prev",this.flipEle);
            
            if(direction<0){
                this.tileIds[0] = this.tileIds[1];
                this.tileIds[1] = this.tileIds[2];
                this.tileIds[2] = (this.tileIds[1]+1) < 20? (this.tileIds[1]+1) : -1 ;
                nextEle.removeClass("next back").addClass("front");
                prevEle.removeClass("prev").addClass("next");
                currEle.removeClass("front").addClass('back prev');
            }else{
                this.tileIds[2] = this.tileIds[1];
                this.tileIds[1] = this.tileIds[0];
                this.tileIds[0] = (this.tileIds[0]-1);
                nextEle.removeClass("next").addClass("prev");
                prevEle.removeClass("prev back").addClass("front");
                currEle.removeClass("front").addClass('back next');
            }
    };
    

    var flip = function(direction){
            this.rotAngle += (direction * 180);
            var ang = this.rotAngle;
            this.flipEle.css({"-webkit-transform":"rotateY("+(ang)+"deg)","transition-duration":"1s","transition-timing-function":"linear"});        
            setTimeout(function(){
                //Draw the next set of articles; well only if something is there to draw
                setTiles.call(this,direction);
                if(direction<0 && this.tileIds[2] > -1){
                    this.onFlipNext();
                    $(".next",this.flipEle).css("-webkit-transform","rotateY("+((this.tileIds[2]%2)*180)+"deg)");

                }else if(this.tileIds[0] > -1){
                    this.onFlipPrev();
                    $(".prev",this.flipEle).css("-webkit-transform","rotateY("+((this.tileIds[2]%2)*180)+"deg)");
                }
            }.bind(this),1000);
           
    };
    
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
            var dur = (Math.abs(angle - this.rotAngle)*6)/1000;
            dur  = dur > 0.05 ? dur  : 0.05;
            this.flipEle.css({"-webkit-transform":"rotateY("+angle+"deg)","transition-duration":""+dur+"s","transition-timing-function":"linear"});    
    };
    

    var swipeEvent = function(){
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
            if((startPosX < 550 && this.tileIds[0] !==-1) || (startPosX > 650 && this.tileIds[2] !==-1)){
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
                    if((touchobj.pageX-startPosX)<-100 && startPosX > 800 && this.tileIds[2] !==-1) {
                        if(firstTouchMove){
                            $(".next",this.flipEle).show();
                            $(".prev",this.flipEle).hide();
                        }
                        setTimeout(function(){
                            flip.call(this,-1);    
                            firstTouchMove=true;
                        }.bind(this),50);
                        firstTouchMove=true;
                    }else if((touchobj.pageX-startPosX)>100 && startPosX < 400 && this.tileIds[0] !== -1){
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
                        this.flipEle.css({"transition-duration":"1s"});    
                        firstTouchMove=true;
                    }
                }.bind(this),50);
            }.bind(this);
        this.flipArea.on('touchstart',handleTouchstart).on('touchmove',handleTouchmove).on('touchend',handleTouchend);
    };
    
   return fm;
})();
/*==END==============================*categories.js*================*/