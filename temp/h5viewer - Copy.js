class h5viewerJs{
    constructor(parentID){
        this.dragging =false;
        this.dragStartLocation=null; 
        this.snapshot=null;

        
        this.parentID = parentID;
        this.parent = document.getElementById(parentID);
        this.canvas = this.createCanvas("canvas");
        this.img = new Image();


    }   
    
   
      
    destroy(){
        this.canvas.remove();
        this.img.remove();
    }
            createCanvas(id){
                    var canvas= document.createElement("canvas");
                    canvas.id = id ;
                    canvas.width="512";
                    canvas.height="512";
                    return canvas;
            }
             renderArea(image){
                this.parent.innerHTML="";
                this.parent.appendChild(this.canvas);
                var canvas = this.canvas;
                canvas.addEventListener("mousedown",this.dragStart,true);
                canvas.addEventListener("mousemove",this.drag,true);
                canvas.addEventListener("mouseup",this.dragStop,true);
                var img = this.img;
                if(this.canvas.getContext){
                 img.onload=function(){
                    // canvas.height = img.height;
                    // canvas.width = img.height;
                   reset();
                 }
                 this.img.src=image;
                }
              
            }

           
            reset(){
                var img = this.img;
                var canvas = this.canvas;
                if(canvas && img){
                    var rotate = 0 ;
                    var zoomX = 1 ;
                    var zoomY = 1 ;
                    this.render(0,0,canvas.height,canvas.width,rotate,zoomX,zoomY,false,false);
                }
            }
            apply(rotate,zoomX,zoomY,flipH,flipV){
                var img = this.img;
                var canvas = this.canvas;
                if(canvas && img){
                    var rotate = rotate ;
                    var zoomX = zoomX ;
                    var zoomY = zoomY ;
                    this.render(0,0,canvas.height,canvas.width,rotate,zoomX,zoomY,flipH,flipV);
                }
            }
            render(x,y,h,w,rotate,zoomX,zoomY,flipH,flipV){
                var img = this.img;
                var canvas = this.canvas;
                if(zoomX < 1)
                zoomX = 1;
                if(zoomY < 1)
                zoomY = 1;

               if(canvas && img){
                var ctx = canvas.getContext('2d');
                ctx.clearRect(x,y,w,h);
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
                
            }
          
}
