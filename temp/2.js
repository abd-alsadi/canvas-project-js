class h5viewerJs{
  constructor(parentID,callbacks){   
    this.callbacks=callbacks;
      this.parent = document.getElementById(parentID);
      this.canvas = this.createCanvas("canvas");
      this.img = new Image();
      this.resetValues();
  }   

  resetValues(){
      this.x=0;
      this.y=0;

      this.extendV=false;
      this.extendH=false;
      this.w=this.canvas.width;
      this.h=this.canvas.height;

      this.currnetRenderH=this.h;
      this.currnetRenderW=this.w;

    
      this.scaleX=1;
      this.scaleY=1;
      this.flipH=false;
      this.flipV=false;
      this.rotate=0;

  }


          clearCanvas(){
              var canvas = this.canvas;
             if(canvas){
              var ctx = canvas.getContext('2d');
              ctx.clearRect(this.x,this.y,this.w,this.h);
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
           loadImage(instance,image,callback){
              this.parent.innerHTML="";
              this.parent.appendChild(this.canvas);
              var canvas = this.canvas;
              var img = this.img;
              if(this.canvas.getContext){
             
               img.onload=function(){
                   canvas.height = img.height;
                   canvas.width = img.height;
                   instance.resetValues();
                   instance.render();
                   if(callback){
                      callback();
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
