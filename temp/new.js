class RectShape{
  constructor(id,x,y,w,h,fill){ 
    this.id=id;
    this.x=x;
    this.y=y;
    this.h=h;
    this.w=w;
    this.fill=fill;
  }

  draw(context){
    context.fillRect(this.x,this.y,this.w,this.h);
  }
  clone(){
    var newRect = newRect(this.id,this.x,this.y,this.w,this.h,this.fill);
    return newRect;
  }
  recalculate(oldW,oldH,newW,newH){
    if(oldH!=newH || oldW!=newW){
      this.x=Math.floor((this.x/oldW)*newW);
      this.y=Math.floor((this.y/oldH)*newH);
      this.w=Math.floor((this.w/oldW)*newW);
      this.h=Math.floor((this.h/oldH)*newH);
    }
  }
}


class h5viewerJs{
  constructor(parentID,callbacks){   
    this.callbacks=callbacks;
      this.parent = document.getElementById(parentID);
      this.canvas = this.createCanvas("canvas");
      this.canvas.tabIndex='1';
      this.canvas.focus();
      this.ctx=this.canvas.getContext('2d');
      this.img = new Image();
      this.resetValues();
      this.init();
      
  }   

  init(){
        
     // The selection color and width. Right now we have a red selection with a small width
     this.mySelColor = '#CC0000';
     this.mySelWidth = 2;
     this.mySelBoxColor = 'darkred'; // New for selection boxes
     this.mySelBoxSize = 6;


    this.shapes = []; 
    // New, holds the 8 tiny boxes that will be our selection handles
    // the selection handles will be in this order:
    // 0  1  2
    // 3     4
    // 5  6  7
    this.selectionHandles = [];
    this.INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed
    this.isDrag = false;
    this.isResizeDrag = false;
    this.expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
    this.mouseX, this.mousey; // mouse coordinates

    // when set to true, the canvas will redraw everything
    this.isNeedRedraw = true;

    // The node (if any) being selected.
    // If in the future we want to select multiple objects, this will get turned into an array
    this.currentSelectionShape = null;

    // we use a fake canvas to draw individual shapes for selection testing
    this.ghostcanvas;
    this.gctx; // fake canvas context

    // since we can drag from anywhere in a node
    // instead of just its x/y corner, we need to save
    // the offset of the mouse when we start dragging.
    this.offsetx, this.offsety;

    // Padding and border style widths for mouse offsets
    this.stylePaddingLeft, this.stylePaddingTop, this.styleBorderLeft, this.styleBorderTop;
  }
  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  draw(box,context, optionalColor){
    if (context === this.gctx) {
      context.fillStyle = 'black'; // always want black for the ghost canvas
    } else {
      context.fillStyle = box.fill;
    }
   
      // We can skip the drawing of elements that have moved off the screen:
   if (box.x > this.w || box.y > this.h) return; 
   if (box.x + box.w < 0 || box.y + box.h < 0) return;
   

if(box.type=='rect'){
  context.fillRect(box.x,box.y,box.w,box.h);
}else if(box.type=='circle'){
  context.beginPath();
  context.arc(box.x,box.y,box.w,box.h,2*Math.PI);
  context.stroke();
}else if(box.type=='text'){
  
  context.lineWidth = 4;
  context.strokeStyle = "#000000";
context.fillStyle = "#abc";
context.font="20px Georgia";
//context.textAlign="center"; 
context.textBaseline = "middle";
context.fillStyle = "red";
var text="asd asd asjdn jasndj njasn jdnjasn djnasj ndjasnj dnjasn jdnajs ndjnasjn djnas jdn";
var width = context.measureText(text).width;
var height = context.measureText(text).height;

//context.fillRect(box.x,box.y,box.w,box.h);
  context.fillText(text,box.x+(box.w/2),box.y+(box.h/2),this.currnetRenderW);
}
 
    
  // draw selection
  // box is a stroke along the box and also 8 new selection handles
  
  if (this.currentSelectionShape === box) {
    
    context.strokeStyle = this.mySelColor;
    context.lineWidth = this.mySelWidth;
    context.strokeRect(box.x,box.y,box.w,box.h);
    
    // draw the boxes
    
    var half = this.mySelBoxSize / 2;
    
    // 0  1  2
    // 3     4
    // 5  6  7
    
    // top left, middle, right
    this.selectionHandles[0].x = box.x-half;
    this.selectionHandles[0].y = box.y-half;
    
    this.selectionHandles[1].x = box.x+box.w/2-half;
    this.selectionHandles[1].y = box.y-half;
    
    this.selectionHandles[2].x = box.x+box.w-half;
    this.selectionHandles[2].y = box.y-half;
    
    //middle left
    this.selectionHandles[3].x = box.x-half;
    this.selectionHandles[3].y = box.y+box.h/2-half;
    
    //middle right
    this.selectionHandles[4].x = box.x+box.w-half;
    this.selectionHandles[4].y = box.y+box.h/2-half;
    
    //bottom left, middle, right
    this.selectionHandles[6].x = box.x+box.w/2-half;
    this.selectionHandles[6].y = box.y+box.h-half;
    
    this.selectionHandles[5].x = box.x-half;
    this.selectionHandles[5].y = box.y+box.h-half;
    
    this.selectionHandles[7].x = box.x+box.w-half;
    this.selectionHandles[7].y = box.y+box.h-half;

    
    context.fillStyle = this.mySelBoxColor;
    for (var i = 0; i < 8; i ++) {
      var cur = this.selectionHandles[i];
      context.fillRect(cur.x, cur.y, this.mySelBoxSize, this.mySelBoxSize);
    }
  }
  }

  recalc(){
    var newBoxes=[];
    for(var index=0;index<this.shapes.length;index++){
      newBoxes.push(this.calc(this.shapes[index]));
    }
    this.shapes=[];
    this.shapes=newBoxes;
  }
  calc(rect){
    var newRect=rect //JSON.parse(JSON.stringify(rect));
    if(this.beforeRenderH!=this.currnetRenderH || this.beforeRenderW!=this.currnetRenderW){
      newRect.x=Math.floor((newRect.x/this.beforeRenderW)*this.currnetRenderW);
      newRect.y=Math.floor((newRect.y/this.beforeRenderH)*this.currnetRenderH);
      newRect.w=Math.floor((newRect.w/this.beforeRenderW)*this.currnetRenderW);
      newRect.h=Math.floor((newRect.h/this.beforeRenderH)*this.currnetRenderH);
    }
    
   
    return newRect;
  }
   addRect(x, y, w, h, fill) {
    var rect =new Object();
    rect.type="rect";
    rect.id=this.generateUUID();
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    this.shapes.push(rect);
    this.setNeedRedraw(true);
  }
  addText(x, y, w, h, fill,text) {
    var rect =new Object();
    rect.type="text";
    rect.id=this.generateUUID();
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    this.shapes.push(rect);
    this.setNeedRedraw(true);  
  }
  addCircle(x, y, w, h, fill) {
    var rect =new Object();
    rect.type="circle";
    rect.id=this.generateUUID();
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    this.shapes.push(rect);
    this.setNeedRedraw(true); 
  }
  cloneObject(obj){
    if(obj){
      return  Object.assign(obj);//JSON.parse(JSON.stringify(obj));
    }
    return obj;
  }
  //wipes the canvas context
   clear(c) {

    c.clearRect(0, 0, this.w, this.h);

  }
 
  goooooooo(){
    this.renderShapes(true);
  }
  // Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
 renderShapes(force) {
  if (this.isNeedRedraw == true || force) {
    
    this.render();
    // Add stuff you want drawn in the background all the time here
    
    // draw all boxes
    var l = this.shapes.length;
    for (var i = 0; i < l; i++) {      
      this.draw(this.shapes[i],this.ctx); // we used to call drawshape, but now each box draws itself
    }
    
    // Add stuff you want drawn on top all the time here
    this.setNeedRedraw(false);
  }
}


mykeyDown(e){
  if(e.key.toLowerCase()=='delete'){
    if(this.currentSelectionShape){
      var index = this.shapes.findIndex(e=>e.id==this.currentSelectionShape.id);
      if(index>-1){
        this.currentSelectionShape=null;
        this.shapes.splice(index,1);
        this.goooooooo();
      }
      
    }
  }
}
// Happens when the mouse is moving inside the canvas
 myMove(e){

  if (this.isDrag) {
    this.getMouse(e);
    
    this.currentSelectionShape.x = this.mouseX - this.offsetx;
    this.currentSelectionShape.y = this.mousey - this.offsety;   
    
    // something is changing position so we better invalidate the canvas!
    this.setNeedRedraw(true);
  } else if (this.isResizeDrag) {
    // time ro resize!
    var oldx = this.currentSelectionShape.x;
    var oldy = this.currentSelectionShape.y;
    
    // 0  1  2
    // 3     4
    // 5  6  7
    switch (this.expectResize) {
      case 0:
        this.currentSelectionShape.x = this.mouseX;
        this.currentSelectionShape.y = this.mousey;
        this.currentSelectionShape.w += oldx - this.mouseX;
        this.currentSelectionShape.h += oldy - this.mousey;
        break;
      case 1:
        this.currentSelectionShape.y = this.mousey;
        this.currentSelectionShape.h += oldy - this.mousey;
        break;
      case 2:
        this.currentSelectionShape.y = this.mousey;
        this.currentSelectionShape.w = this.mouseX - oldx;
        this.currentSelectionShape.h += oldy - this.mousey;
        break;
      case 3:
        this.currentSelectionShape.x = this.mouseX;
        this.currentSelectionShape.w += oldx - this.mouseX;
        break;
      case 4:
        this.currentSelectionShape.w = this.mouseX - oldx;
        break;
      case 5:
        this.currentSelectionShape.x = this.mouseX;
        this.currentSelectionShape.w += oldx - this.mouseX;
        this.currentSelectionShape.h = this.mousey - oldy;
        break;
      case 6:
        this.currentSelectionShape.h = this.mousey - oldy;
        break;
      case 7:
        this.currentSelectionShape.w = this.mouseX - oldx;
        this.currentSelectionShape.h = this.mousey - oldy;
        break;
    }
    
    this.setNeedRedraw(true);
    }
    this.getMouse(e);
    // if there's a selection see if we grabbed one of the selection handles
    if (this.currentSelectionShape !== null && !this.isResizeDrag) {
      for (var i = 0; i < 8; i++) {
        // 0  1  2
        // 3     4
        // 5  6  7
        
        var cur = this.selectionHandles[i];
        
        // we dont need to use the ghost context because
        // selection handles will always be rectangles
        if (this.mouseX >= cur.x && this.mouseX <= cur.x + this.mySelBoxSize &&
          this.mousey >= cur.y && this.mousey <= cur.y + this.mySelBoxSize) {
          // we found one!
          this.expectResize = i;
          this.setNeedRedraw(true);
          
          switch (i) {
            case 0:
              this.canvas.style.cursor='nw-resize';
              break;
            case 1:
              this.canvas.style.cursor='n-resize';
              break;
            case 2:
              this.canvas.style.cursor='ne-resize';
              break;
            case 3:
              this.canvas.style.cursor='w-resize';
              break;
            case 4:
              this.canvas.style.cursor='e-resize';
              break;
            case 5:
              this.canvas.style.cursor='sw-resize';
              break;
            case 6:
              this.canvas.style.cursor='s-resize';
              break;
            case 7:
              this.canvas.style.cursor='se-resize';
              break;
          }
          return;
        }
        
      }
      // not over a selection box, return to normal
      this.isResizeDrag = false;
      this.expectResize = -1;
      this.canvas.style.cursor='auto';
    }
    
  }
  
  
// Happens when the mouse is clicked in the canvas
 myDown(e){
  this.getMouse(e);
  
  //we are over a selection box
  if (this.expectResize !== -1) {
    this.isResizeDrag = true;
    return;
  }
  
  this.clear(this.gctx);
  var l = this.shapes.length;
  for (var i = l-1; i >= 0; i--) {
    // draw shape onto ghost context
  this.draw(this.shapes[i],this.gctx, 'black');
    
    // get image data at the mouse x,y pixel
    var imageData = this.gctx.getImageData(this.mouseX, this.mousey, 1, 1);
    var index = (this.mouseX + this.mousey * imageData.width) * 4;
    
    // if the mouse pixel exists, select and break
    if (imageData.data[3] > 0) {
      this.currentSelectionShape = this.shapes[i];
      this.offsetx = this.mouseX - this.currentSelectionShape.x;
      this.offsety = this.mousey - this.currentSelectionShape.y;
      this.currentSelectionShape.x = this.mouseX - this.offsetx;
      this.currentSelectionShape.y = this.mousey - this.offsety;
      this.isDrag = true;
      
      this.setNeedRedraw(true);
      this.clear(this.gctx);
      return;
    }
    
  }
  // havent returned means we have selected nothing
  this.currentSelectionShape = null;
  // clear the ghost canvas for next time
  this.clear(this.gctx);
  // invalidate because we might need the selection border to disappear
  this.setNeedRedraw(true);
}


 myUp(){
    this.isDrag = false;
    this.isResizeDrag = false;
    this.expectResize = -1;
  
}


// adds a new node
 myDblClick(e) {
  this.getMouse(e);
  // for this method width and height determine the starting X and Y, too.
  // so I left them as vars in case someone wanted to make them args for something and copy this code
  if(this.mode=='rect'){
    
    var width = 20;
    var height = 20;
    this.addRect(this.mouseX - (width / 2), this.mousey - (height / 2), width, height, 'rgba(220,205,65,0.7)');
    
  }else if(this.mode=='circle'){
    var width = 20;
    var height = 20;
    this.addCircle(this.mouseX - (width / 2), this.mousey - (height / 2), width, height, 'rgba(220,205,65,0.7)');
  }else if(this.mode == 'text'){
    
    var width = 100;
    var height = 20;
    this.addText(this.mouseX - (width / 2), this.mousey - (height / 2), width, height, 'rgba(220,205,65,0.7)','mytext');
  }
}


setNeedRedraw(isNeedRedraw) {
  this.isNeedRedraw = isNeedRedraw;
}


// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
 getMouse(e) {
  var element = canvas, offsetX = 0, offsetY = 0;

  if (element.offsetParent) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  offsetX += this.stylePaddingLeft;
  offsetY += this.stylePaddingTop;

  offsetX += this.styleBorderLeft;
  offsetY += this.styleBorderTop;

  this.mouseX = e.pageX - offsetX;
  this.mousey = e.pageY - offsetY
}


setDrawType(type){
  this.mode=type;
}

  resetValues(){

      this.x=0;
      this.y=0;

      this.extendV=false;
      this.extendH=false;
      this.w=this.canvas.width;
      this.h=this.canvas.height;

      this.beforeRenderH=0;
      this.beforeRenderW=0;

      this.currnetRenderH=this.h;
      this.currnetRenderW=this.w;

    
      this.scaleX=1;
      this.scaleY=1;
      this.flipH=false;
      this.flipV=false;
      this.rotate=0;

      this.shapes = []; 
      this.currentSelectionShape = null;

      this.isDrag = false;
      this.isResizeDrag = false;
      this.expectResize = -1;

  }


          clearCanvas(){
             if(this.ctx){
               this.ctx.clearRect(this.x,this.y,this.w,this.h);
             }
          }
          destroy(){
              this.canvas.remove();
              this.img.remove();
              this.resetValues();
          }
          createCanvas(id){
                  var canvas= document.createElement("canvas");
                  canvas.id = id ;
                  return canvas;
          }
           loadImage(image){
              this.parent.innerHTML="";
              this.parent.appendChild(this.canvas);
              var canvas = this.canvas;
              var img = this.img;
              var self = this;
              if(this.canvas.getContext){
                this.ctx = canvas.getContext('2d');
            


               img.onload=function(){
                
                   canvas.height = img.height;
                   canvas.width = img.height;
                    self.HEIGHT = canvas.height;
                    self.WIDTH = canvas.width;
                   self.ghostcanvas = self.createCanvas('canvas2');
                   self.ghostcanvas.height = self.HEIGHT;
                   self.ghostcanvas.width = self.WIDTH;
                   self.gctx = self.ghostcanvas.getContext('2d');
            
                // fixes mouse co-ordinate problems when there's a border or padding
                // see getMouse for more detail
                if (document.defaultView && document.defaultView.getComputedStyle) {
                  self.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['paddingLeft'], 10)     || 0;
                  self.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['paddingTop'], 10)      || 0;
                  self.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['borderLeftWidth'], 10) || 0;
                  self.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['borderTopWidth'], 10)  || 0;
                }
  
                
                  // make renderShapes() fire every INTERVAL milliseconds
                  setInterval(self.renderShapes.bind(self), self.INTERVAL);

                            //fixes a problem where double clicking causes text to get selected on the canvas
                             self.canvas.onselectstart = function () { return false; }
              
                              // set our events. Up and down are for dragging,
                              // double click is for making new boxes
                              self.canvas.onmousedown = self.myDown.bind(self);
                              self.canvas.onmouseup = self.myUp.bind(self);
                              self.canvas.ondblclick = self.myDblClick.bind(self);
                              self.canvas.onmousemove = self.myMove.bind(self);
                              self.canvas.addEventListener("keydown", self.mykeyDown.bind(self), true);
                // set up the selection handle boxes
                for (var i = 0; i < 8; i ++) {
                  var rect ={x:0,y:0,w:1,h:1,fill:'#444444'};
                  self.selectionHandles.push(rect);
                }
              
                   if(self.callbacks && self.callbacks.afterLoadImage){
                    self.callbacks.afterLoadImage();
                   }
               }
               this.img.src=image;
              }
            
          }

          getParentData(){
            var parentWidth = Number(this.parent.style.width.replace("px",""))-15;
              var parentHeight = Number(this.parent.style.height.replace("px",""))-15;
              return {
                w:parentWidth,
                h:parentHeight
              }
          }
        
          render(){

            var beforeH= this.currnetRenderH;
            var beforeW=this.currnetRenderW;
              var x = this.x;
              var y = this.y;
              //------------------------------
              var h = this.h;
              var w = this.w;
              var parentData = this.getParentData();
              if(this.extendH && this.extendV){
                  w=parentData.w;
                  h=parentData.h;
               }else if(this.extendV){
                  h=parentData.h;
               }else if(this.extendH){
                  w=parentData.w;
               }

             
                this.currnetRenderH=h;
                this.currnetRenderW=w;
          
             
                this.beforeRenderH=beforeH;
                this.beforeRenderW=beforeW;
                  this.recalc();
                 
            
               
              

               
               //------------------------------
              var rotate = this.rotate;
              var zoomX = this.scaleX;
              var zoomY = this.scaleY;
              var flipH = this.flipH;
              var flipV = this.flipV;

              var img = this.img;
              var canvas = this.canvas;
              if(zoomX < 1)
              zoomX = 1;
              if(zoomY < 1)
              zoomY = 1;

             if(canvas && img){
              var ctx = canvas.getContext('2d');
             this.clearCanvas();
              ctx.save();
              ctx.translate(x+w/2,y+h/2);
              ctx.rotate(rotate* Math.PI/180.0);
              var scaleX =zoomX;
              var scaleY = zoomY;

              if(flipH && flipV){
                  scaleX = -1;
                  scaleY = -1;
              }else if(flipH){
                  scaleX = -1;
                  scaleY=1;
              }else if(flipV){
                  scaleX = 1;
                  scaleY = -1;
              }
              
              ctx.scale(scaleX,scaleY);

              if(Math.abs(rotate) == 90 || Math.abs(rotate) ==270){
                  ctx.translate(-y-h/2,-x-w/2);
              }else{
                  ctx.translate(-x-w/2,-y-h/2);
              }
              
                 ctx.drawImage(img,x,y,w,h);
           
             
              ctx.restore();
             }

             if(this.callbacks && this.callbacks.afterRender){
                this.callbacks.afterRender();
             }
               
          }
        
          setRotate(rotate){
              this.rotate=rotate;
          }
          setScale(scaleX,scaleY){
              this.scaleX=scaleX;
              this.scaleY=scaleY;
          }
          setFlipVertical(flipV){
              this.flipV=flipV;
          }
          setFlipHorizental(flipH){
              this.flipH=flipH;
          }
          setExtend(extendV,extendH){
              this.extendH=extendH;
              this.extendV=extendV;
          }
        
}
