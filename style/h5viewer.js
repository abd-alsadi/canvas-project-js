

class h5viewerJs {
  constructor(parentID, callbacks) {
    this.callbacks = callbacks;
    this.parent = document.getElementById(parentID);
    this.canvas = this.createCanvas("canvas");
    this.canvas.tabIndex = '1';
    this.canvas.focus();
    this.img = new Image();
    this.resetValues();
    this.init();
  }

  setRotate(rotate) {
    this.rotate = rotate;
  }
  setScale(scaleX, scaleY) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }
  setFlipVertical(flipV) {
    this.flipV = flipV;
  }
  setFlipHorizental(flipH) {
    this.flipH = flipH;
  }
  setExtend(extendV, extendH) {
    this.extendH = extendH;
    this.extendV = extendV;
  }

  init() {
    this.shapes = [];
    this.currentSelectionHandles = [];
    this.isDrag = false;
    this.isResize = false;
    this.expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
    this.currentMousePos;
    this.currentSelectionShape = null;

    // since we can drag from anywhere in a node
    // instead of just its x/y corner, we need to save
    // the offset of the mouse when we start dragging.
    this.offsetx, this.offsety;

    // Padding and border style widths for mouse offsets
    this.stylePaddingLeft, this.stylePaddingTop, this.styleBorderLeft, this.styleBorderTop;
  }


  initSelectionHandles() {
    this.currentSelectionHandles = [];
    // set up the selection handle boxes
    for (var i = 0; i < 8; i++) {
      var rect = { x: 0, y: 0, w: 1, h: 1, fill: '#444444' };
      this.currentSelectionHandles.push(rect);
    }
  }

  resetValues() {


    this.x = 0;
    this.y = 0;
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this.beforeRenderH = 0;
    this.beforeRenderW = 0;

    this.currnetRenderH = this.h;
    this.currnetRenderW = this.w;

    this.extendV = false;
    this.extendH = false;

    this.scaleX = 1;
    this.scaleY = 1;
    this.flipH = false;
    this.flipV = false;
    this.rotate = 0;

    this.shapes = [];
    this.hands = [];
    this.currentSelectionShape = null;

    this.isDrag = false;
    this.isResize = false;
    this.expectResize = -1;

    this.lastDrawMousePos = { x: 0, y: 0 };
    this.firstDrawMousePos = { x: -1, y: -1 };
    this.currentMousePos = { x: 0, y: 0 };

    this.currentSettings = this.getDefaultSettingsAndStyles();
    this.currentState = this.getDefaultState();

    this.shapesCommand = { copyShape: null, cutShape: null };
    this.lastKeyboardCommand;

    this.contextMenuIDForCanvas = null;
    this.contextMenuIDForShape = null;
  }


  generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }



  recalculateShapes() {
    var newBoxes = [];
    for (var index = 0; index < this.shapes.length; index++) {
      this.shapes[index].recalculate(this.beforeRenderW, this.beforeRenderH, this.currnetRenderW, this.currnetRenderH);
      newBoxes.push(this.shapes[index]);
    }
    this.shapes = [];
    this.shapes = newBoxes;
  }


  clearCanvas(context) {
    if (context) {
      context.clearRect(this.x, this.y, this.w, this.h);
    }
  }


  getParentData() {
    var parentWidth = Number(this.parent.style.width.replace("px", ""));
    var parentHeight = Number(this.parent.style.height.replace("px", ""));
    return {
      w: parentWidth,
      h: parentHeight
    }
  }
  getImageData() {
    return {
      w: this.img.width,
      h: this.img.height
    }
  }

  drawShape(shape, context, optionalColor) {
    shape.draw(context, this.currnetRenderW, this.currnetRenderH);

    if (this.currentSelectionShape === shape && shape.settings.isAllowSelect) {
      context.strokeStyle = shape.settings.selectionColor;
      context.lineWidth = shape.settings.selectionWidth;
      shape.select(context);
      if (shape.settings.isAllowSelect && shape.settings.isAllowResize) {
        this.initSelectionHandles();
        shape.initResize(context, this.currentSelectionHandles);
      }

    }
  }



  loadImage(image) {
    var beforeCanvas = document.getElementById('canvas');

    if (beforeCanvas)
      beforeCanvas.remove();
    this.parent.appendChild(this.canvas);
    var img = this.img;
    var self = this;

    if (this.canvas.getContext) {
      this.ctx = canvas.getContext('2d');
      img.onload = function () {
        self.canvas.height = img.height;
        self.canvas.width = img.width;

        // fixes mouse co-ordinate problems when there's a border or padding
        // see getMouse for more detail
        if (document.defaultView && document.defaultView.getComputedStyle) {
          self.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['paddingLeft'], 10) || 0;
          self.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['paddingTop'], 10) || 0;
          self.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['borderLeftWidth'], 10) || 0;
          self.styleBorderTop = parseInt(document.defaultView.getComputedStyle(self.canvas, null)['borderTopWidth'], 10) || 0;
        }

        //fixes a problem where double clicking causes text to get selected on the canvas
        self.canvas.onselectstart = function () { return false; }
        self.canvas.onmousedown = self.mouseDownCanvas.bind(self);
        self.canvas.onmouseup = self.mouseUpCanvas.bind(self);
        self.canvas.ondblclick = self.dbclickCanvas.bind(self);
        self.canvas.onmousemove = self.mouseMoveCanvas.bind(self);
        self.canvas.addEventListener("keydown", self.keyDownCanvas.bind(self), true);
        self.canvas.addEventListener("contextmenu", self.openContextMenu.bind(self), true);
        self.canvas.addEventListener("click", self.closeAllContextMenu.bind(self), true);
        if (self.callbacks && self.callbacks.afterLoadImage) {
          self.callbacks.afterLoadImage();
        }
      }
      var timestamp = new Date().getTime();

      this.img.src = image;
      //this.getBase64FromImageUrl(image);

    }
  }

  getBase64FromImageUrl(URL) {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = URL;
    img.onload = function () {
      var canvas = document.createElement("base");
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);
      var dataURL = canvas.toDataURL("image/png");

      alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

    };
  }

  renderCanvas() {
    var beforeH = this.currnetRenderH;
    var beforeW = this.currnetRenderW;
    var x = this.x;
    var y = this.y;
    //------------------------------
    var parentData = this.getParentData();
    var h = this.h;
    var w = this.w;

    if (this.extendH && this.extendV) {
      w = parentData.w;
      h = parentData.h;
    } else if (this.extendV) {
      h = parentData.h;
    } else if (this.extendH) {
      w = parentData.w;

    }



    this.currnetRenderH = h;
    this.currnetRenderW = w;

    this.canvas.width = this.currnetRenderW;
    this.canvas.height = this.currnetRenderH;

    this.beforeRenderH = beforeH;
    this.beforeRenderW = beforeW;
    this.recalculateShapes();

    var rotate = this.rotate;
    var zoomX = this.scaleX;
    var zoomY = this.scaleY;
    var flipH = this.flipH;
    var flipV = this.flipV;

    var img = this.img;
    var canvas = this.canvas;
    if (zoomX < 1)
      zoomX = 1;
    if (zoomY < 1)
      zoomY = 1;

    if (canvas && img) {
      var ctx = this.ctx;
      this.clearCanvas(ctx);
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(rotate * Math.PI / 180.0);
      var scaleX = zoomX;
      var scaleY = zoomY;

      if (flipH && flipV) {
        scaleX = -1;
        scaleY = -1;
      } else if (flipH) {
        scaleX = -1;
        scaleY = 1;
      } else if (flipV) {
        scaleX = 1;
        scaleY = -1;
      }

      ctx.scale(scaleX, scaleY);

      if (Math.abs(rotate) == 90 || Math.abs(rotate) == 270) {
        ctx.translate(-y - h / 2, -x - w / 2);
      } else {
        ctx.translate(-x - w / 2, -y - h / 2);
      }

      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    }

    if (this.callbacks && this.callbacks.afterRender) {
      this.callbacks.afterRender();
    }

  }

  createCanvas(id) {
    var canvas = document.createElement("canvas");
    canvas.id = id;
    return canvas;
  }

  destroy() {
    this.canvas.remove();
    this.img.remove();
    this.resetValues();
  }

  refresh() {
    this.renderCanvas();
    // draw all boxes
    for (var i = 0; i < this.shapes.length; i++) {
      this.drawShape(this.shapes[i], this.ctx); // we used to call drawshape, but now each box draws itself
    }

  }


  getShapeDefaultSize() {
    return { w: 100, h: 100, r: 100 };
  }
  //----- events -----------
  keyDownCanvas(e) {
    if (e.key.toLowerCase() == 'delete') {
      this.removeShape(this.currentSelectionShape);
      this.lastKeyboardCommand = 'delete';
    } else if (e.ctrlKey && e.key === 'c') {
      this.copyShape(this.currentSelectionShape);
      this.lastKeyboardCommand = 'copy';
    } else if (e.ctrlKey && e.key === 'v') {
      if (this.lastKeyboardCommand === 'cut') {
        this.pastShape(this.shapesCommand.cutShape);
        this.shapesCommand.cutShape = null;
      } else if (this.lastKeyboardCommand == 'copy') {
        this.pastShape(this.shapesCommand.copyShape);
        this.shapesCommand.copyShape = null;
      }
      this.lastKeyboardCommand = 'paste';
    } else if (e.ctrlKey && e.key === 'x') {
      this.cutShape(this.currentSelectionShape);
      this.lastKeyboardCommand = 'cut';
    }
  }

  contextMenuCommand(e, menuType, command) {
    this.closeAllContextMenu(e);
    if (menuType == 'shape') {
      switch (command) {
        case 'delete_selection_shape':
          this.removeShape(this.currentSelectionShape);
          this.lastKeyboardCommand = 'delete';
          break;
        case 'copy_selection_shape':
          this.copyShape(this.currentSelectionShape);
          this.lastKeyboardCommand = 'copy';
          break;
        case 'cut_selection_shape':
          this.cutShape(this.currentSelectionShape);
          this.lastKeyboardCommand = 'cut';
          break;
        case 'paste_selection_shape':
          if (this.lastKeyboardCommand === 'cut') {
            this.pastShape(this.shapesCommand.cutShape);
            this.shapesCommand.cutShape = null;
          } else if (this.lastKeyboardCommand == 'copy') {
            this.pastShape(this.shapesCommand.copyShape);
            this.shapesCommand.copyShape = null;
          }
          this.lastKeyboardCommand = 'paste';
          break;
      }
    }

  }
  copyShape(shape) {
    if (shape) {
      var newShape = shape.clone();
      this.shapesCommand.copyShape = newShape;
      this.refresh();
    }
  }
  pastShape(shape) {
    if (shape) {
      shape.id = this.generateUUID();
      shape.x = this.lastDrawMousePos.x;
      shape.y = this.lastDrawMousePos.y;
      this.shapes.push(shape);
      this.refresh();
    }
  }

  removeShape(shape) {
    if (shape) {
      var index = this.shapes.findIndex(e => e.id == shape.id);
      if (index > -1) {
        this.currentSelectionShape = null;
        this.shapes.splice(index, 1);
        this.refresh();
      }
    }
  }
  cutShape(shape) {
    if (shape) {
      var index = this.shapes.findIndex(e => e.id == shape.id);
      if (index > -1) {
        shape.x = this.lastDrawMousePos.x;
        shape.y = this.lastDrawMousePos.y;
        this.shapesCommand.cutShape = shape;
        this.currentSelectionShape = null;
        this.shapes.splice(index, 1);
        this.refresh();
      }
    }
  }
  mouseUpCanvas(e) {
    this.lastDrawMousePos = this.getMouse(e);
    if (this.isDraw && this.lastDrawMousePos.x != this.firstDrawMousePos.x && this.lastDrawMousePos.y != this.firstDrawMousePos.y) {
      //add shape
      if (this.currentState.mode == 'draw') {
        var x = this.firstDrawMousePos.x;
        var y = this.firstDrawMousePos.y;
        switch (this.currentState.shapeType) {
          case 'oval':
            var w = this.lastDrawMousePos.x - x;
            var h = this.lastDrawMousePos.y - y;
            var data = { x: x, y: y, w: w, h: h };
            this.addShape(this.currentState.mode, data);
            break;
          case 'image':
            var w = this.lastDrawMousePos.x - x;
            var h = this.lastDrawMousePos.y - y;
            var data = { x: x, y: y, w: w, h: h };
            this.addShape(this.currentState.mode, data);
            break;
          case 'rect':
            var w = this.lastDrawMousePos.x - x;
            var h = this.lastDrawMousePos.y - y;
            var data = { x: x, y: y, w: w, h: h };
            this.addShape(this.currentState.mode, data);
            break;
          case 'line':
            var w = this.lastDrawMousePos.x - x;
            var h = this.lastDrawMousePos.y - y;
            var data = { x: x, y: y, w: w, h: h };
            this.addShape(this.currentState.mode, data);
            break;
          case 'emojy':
            var w = this.lastDrawMousePos.x - x;
            var h = this.lastDrawMousePos.y - y;
            var data = { x: x, y: y, w: w, h: h };
            this.addShape(this.currentState.mode, data);
            break

          default: //rect
            // var w = this.lastDrawMousePos.x - x;
            // var h = this.lastDrawMousePos.y - y;
            // var data= {x:x,y:y,w:w,h:h};
            // this.addShape(this.currentState.mode,data);

            break;

        }
      }
    }
    this.isDrag = false;
    this.isDraw = false;
    this.isResize = false;
    this.expectResize = -1;
    this.firstDrawMousePos = { x: -1, y: -1 };
  }

  setState(state, settings) {
    if ((this.currentState.shapeType == 'hand' && state.shapeType != 'hand') || (this.currentState.shapeType != 'hand' && state.shapeType == 'hand')) {
      this.currentSettings = settings;
      this.currentState = state;
      this.shapes = [];
      this.refresh();
    } else {
      this.currentSettings = settings;
      this.currentState = state;
    }
  }

  getDefaultSettingsAndStyles() {
    var settings = new Object();
    settings.isAllowSelect = true;
    settings.isAllowResize = true;
    settings.isAllowMove = true;
    settings.selectionColor = 'grey';
    settings.selectionWidth = 2;
    settings.selectionBoxColor = 'grey'; // New for selection boxes
    settings.selectionBoxSize = 6;
    var style = {
      font: "20px Arial",
      lineWidth: 4,
      strokeStyle: "blue",
      textBaseline: "middle",
      textAlign: "start",
      fillStyle: "red",
      opacity: 1
    };
    return {
      settings: settings,
      style: style,
      fill: true,
    }
  }
  getDefaultState() {
    return { mode: 'draw', shapeType: 'oval', data: {} };
  }

  checkShapeIsInsideCanvas(x, y, w, h) {
    if ((x + w) > this.x && (x + w) < (this.x + this.currnetRenderW) &&
      (y + h) > this.y && (y + h) < (this.y + this.currnetRenderH))
      return true;

    return false;
  }
  addShapeDbClick() {
    var id = this.generateUUID();
    var defaultSettingsAndStyles = this.currentSettings;
    var style = defaultSettingsAndStyles.style;
    var settings = defaultSettingsAndStyles.settings;
    var fill = defaultSettingsAndStyles.fill;

    if (this.currentState.shapeType == 'rect') {
      var size = this.getShapeDefaultSize();
      var width = size.w;
      var height = size.h;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      if (this.checkShapeIsInsideCanvas(newx, newy, width, height)) {
        var rect = new RectShape(settings, id, newx, newy, width, height, fill, style);
        this.shapes.push(rect);
        this.refresh();
      }

    } if (this.currentState.shapeType == 'image' && this.currentState.data.image) {
      var size = this.getShapeDefaultSize();
      var width = size.w;
      var height = size.h;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      var img = new Image();
      img.src = this.currentState.data.image;
      img.crossOrigin = "Anonymous";
      this.currentState.data.image = img;
      var self = this;
      if (this.checkShapeIsInsideCanvas(newx, newy, width, height)) {
        img.onload = function () {
          var rect = new ImageShape(settings, id, newx, newy, width, height, fill, style, self.currentState.data);
          self.shapes.push(rect);
          self.refresh();
        }
      }


    } else if (this.currentState.shapeType == 'oval') {
      var size = this.getShapeDefaultSize();
      var redius = size.r;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      if (this.checkShapeIsInsideCanvas(newx, newy, redius, redius)) {
        var oval = new OvalShape(settings, id, newx, newy, redius, redius, fill, style);
        this.shapes.push(oval);
        this.refresh();
      }

    } else if (this.currentState.shapeType == 'text' && this.currentState.data.text) {
      var text = this.currentState.data.text;
      var img = TextShape.convertTextToImage(text);
      var width = img.width / 2;
      var height = img.height;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      fill = true;
      this.currentState.data.image = img;
      if (this.checkShapeIsInsideCanvas(newx, newy, width, height)) {
        var self = this;
        img.onload = function () {
          var rect = new TextShape(settings, id, newx, newy, width, height, fill, style, self.currentState.data);
          self.shapes.push(rect);
          self.refresh();
        }
      }


    } else if (this.currentState.shapeType == 'emojy' && this.currentState.data.emojy) {
      var img = EmojyShape.convertTextToImage(this.currentState.data.emojy);
      var defSize = EmojyShape.getDefaultSizeEmojy();
      var width = defSize.w;
      var height = defSize.h;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      fill = true;
      this.currentState.data.image = img;
      if (this.checkShapeIsInsideCanvas(newx, newy, width, height)) {
        var self = this;
        img.onload = function () {
          var rect = new EmojyShape(settings, id, newx, newy, width, height, fill, style, self.currentState.data);
          self.shapes.push(rect);
          self.refresh();
        }
      }


    } else if (this.currentState.shapeType == 'line') {
      var size = this.getShapeDefaultSize();
      var width = size.w;
      var height = size.h;
      var newx = this.currentMousePos.x;
      var newy = this.currentMousePos.y;
      if (this.checkShapeIsInsideCanvas(newx, newy, width, height)) {
        var line = new LineShape(settings, id, newx, newy, width, height, fill, style);
        this.shapes.push(line);
        this.refresh();
      }

    }
  }

  addShapeDraw(data) {
    var id = this.generateUUID();
    var defaultSettingsAndStyles = this.currentSettings;
    var style = defaultSettingsAndStyles.style;
    var settings = defaultSettingsAndStyles.settings;
    var fill = defaultSettingsAndStyles.fill;
    if (this.currentState.shapeType == 'oval') {
      var oval = new OvalShape(settings, id, data.x, data.y, data.w, data.h, fill, style);
      this.shapes.push(oval);
    } else if (this.currentState.shapeType == 'image' && this.currentState.data.image) {
      var img = new Image();
      img.src = this.currentState.data.image;
      img.crossOrigin = "Anonymous";
      this.currentState.data.image = img;
      var self = this;
      img.onload = function () {
        var rect = new ImageShape(settings, id, data.x, data.y, data.w, data.h, fill, style, self.currentState.data);
        self.shapes.push(rect);
        self.refresh();
      }
    } else if (this.currentState.shapeType == 'emojy' && this.currentState.data.emojy) {
      var img = EmojyShape.convertTextToImage(this.currentState.data.emojy);
      var self = this;
      this.currentState.data.image = img;
      img.onload = function () {
        var rect = new EmojyShape(settings, id, data.x, data.y, data.w, data.h, fill, style, self.currentState.data)
        self.shapes.push(rect);
        self.refresh();
      }
    } else if (this.currentState.shapeType == "line") {
      var line = new LineShape(settings, id, data.x, data.y, data.w, data.h, fill, style);
      this.shapes.push(line);
    }
    else {
      var rect = new RectShape(settings, id, data.x, data.y, data.w, data.h, fill, style);
      this.shapes.push(rect);
    }
    this.refresh();
  }

  addShape(mode, data) {
    switch (mode) {
      case 'draw':
        this.addShapeDraw(data);
        break;
      case 'dbclick':
        this.addShapeDbClick();
        break;
    }
  }
  dbclickCanvas(e) {
    this.currentMousePos = this.getMouse(e);
    this.addShape(this.currentState.mode);
  }

  setContextMenuID(contextMenuIDForCanvas, contextMenuIDForShape) {
    this.contextMenuIDForCanvas = contextMenuIDForCanvas;
    this.contextMenuIDForShape = contextMenuIDForShape;
  }
  closeAllContextMenu(e) {
    if (this.callbacks.closeAllContextMenu)
      this.callbacks.closeAllContextMenu(e);
  }
  openContextMenu(e) {
    e.preventDefault();
    var contextMenuId;
    var forShape = this.currentSelectionShape || this.shapesCommand.copyShape || this.shapesCommand.cutShape;
    if (forShape) {
      contextMenuId = this.contextMenuIDForShape;
    } else {
      contextMenuId = this.contextMenuIDForCanvas;
    }

    if (!contextMenuId) {
      return;
    }

    this.closeAllContextMenu(e);

    if (this.callbacks.openContextMenu)
      this.callbacks.openContextMenu(e, contextMenuId, { x: this.currentMousePos.x, y: this.currentMousePos.y });
  }

  // Happens when the mouse is clicked in the canvas
  mouseDownCanvas(e) {
    if (this.callbacks.closeAllContextMenu)
      this.callbacks.closeAllContextMenu(e);

    this.currentMousePos = this.getMouse(e);
    this.lastDrawMousePos = this.currentMousePos;
    if (this.currentState.mode == 'draw')
      this.isDraw = true;

    if (this.firstDrawMousePos.x == -1 && this.firstDrawMousePos.y == -1) {
      this.firstDrawMousePos = this.currentMousePos;
    }

    if (this.currentState.shapeType == 'hand') {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastDrawMousePos.x, this.lastDrawMousePos.y);
    }
    //we are over a selection box
    if (this.expectResize !== -1) {
      this.isResize = true;
      return;
    }

    if (!this.isSetSelectionShape()) {
      this.currentSelectionShape = null;
      if (this.currentState.shapeType != 'hand') {
        this.refresh();
      }
    }
  }


  isSetSelectionShape() {
    for (var i = this.shapes.length - 1; i >= 0; i--) {

      // if the mouse pixel exists, select and break
      if (this.shapes[i].isSelect(this.currentMousePos.x, this.currentMousePos.y)) {
        this.currentSelectionShape = this.shapes[i];
        this.offsetx = this.currentMousePos.x - this.currentSelectionShape.x;
        this.offsety = this.currentMousePos.y - this.currentSelectionShape.y;
        this.currentSelectionShape.x = this.currentMousePos.x - this.offsetx;
        this.currentSelectionShape.y = this.currentMousePos.y - this.offsety;
        this.isDrag = true;
        this.isDraw = false;
        this.refresh();
        return this.currentSelectionShape;
      }
    }

    return null;
  }
  removeAllShapes() {
    this.shapes = [];
    this.refresh();
  }


  onDrawShape(e) {
    if (this.currentState.shapeType != 'hand') {
      this.refresh();
    }

    var x = this.firstDrawMousePos.x;
    var y = this.firstDrawMousePos.y;
    var id = this.generateUUID();
    var settings = this.currentSettings;
    switch (this.currentState.shapeType) {
      case 'hand':
        var newPoint = new PointShape(settings.settings, id, this.lastDrawMousePos.x, this.lastDrawMousePos.y, settings.fill, settings.style)
        this.shapes.push(newPoint);
        newPoint.draw(this.ctx);
        break;
      case 'oval':
        var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
        var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
        var ovalShape = new OvalShape(settings.settings, id, x, y, width, height, settings.fill, settings.style);
        ovalShape.draw(this.ctx);
        break;
      case 'image':
        if (this.currentState.data.image) {
          var img = new Image();
          img.src = this.currentState.data.image;
          img.crossOrigin = "Anonymous";
          this.currentState.data.image = img;
          var self = this;
          var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
          var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
          img.onload = function () {
            var imageShape = new ImageShape(settings.settings, id, x, y, width, height, settings.fill, settings.style, self.currentState.data);
            imageShape.draw(self.ctx);
          }
        }
        break;
      case 'emojy':
        if (this.currentState.data.emojy) {
          var img = EmojyShape.convertTextToImage(this.currentState.data.emojy);
          var defSize = EmojyShape.getDefaultSizeEmojy();
          var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
          var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
          this.currentState.data.image = img;
          var self = this;
          img.onload = function () {
            var rect = new EmojyShape(settings.settings, id, x, y, width, height, settings.fill, settings.style, self.currentState.data);
            rect.draw(self.ctx);
          }
        }

        break;
      case 'rect':
        var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
        var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
        var rectShape = new RectShape(settings.settings, id, x, y, width, height, settings.fill, settings.style);
        rectShape.draw(this.ctx);
        break;
      case 'line':
        var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
        var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
        var lineSHape = new LineShape(settings.settings, id, x, y, width, height, settings.fill, settings.style);
        lineSHape.draw(this.ctx);
        break;
      default:
        // var width = this.lastDrawMousePos.x - this.firstDrawMousePos.x;
        // var height = this.lastDrawMousePos.y - this.firstDrawMousePos.y;
        // var rectShape = new RectShape(settings.settings,id,x,y,width,height,settings.fill,settings.style);
        // rectShape.draw(this.ctx);
        break;
    }
  }
  onResizeShape(e) {
    if (this.checkShapeIsInsideCanvas(this.currentSelectionShape.x, this.currentSelectionShape.y, this.currentSelectionShape.w, this.currentSelectionShape.h)) {
      this.isDraw = false;
      this.currentSelectionShape.resize(this.expectResize, this.currentMousePos.x, this.currentMousePos.y);
      this.refresh();
    }

  }
  onDragShape(e) {
    this.isDraw = false;
    if (this.currentSelectionShape.settings.isAllowSelect && this.currentSelectionShape.settings.isAllowMove) {
      this.currentSelectionShape.x = this.currentMousePos.x - this.offsetx;
      this.currentSelectionShape.y = this.currentMousePos.y - this.offsety;
      this.refresh();
    }
  }

  // Happens when the mouse is moving inside the canvas
  mouseMoveCanvas(e) {
    this.refreshCursor();
    this.currentMousePos = this.getMouse(e);
    this.lastDrawMousePos = this.currentMousePos;
    if (this.isDrag) {
      this.onDragShape(e);
    } else if (this.isResize) {
      this.onResizeShape(e);
    } else if (this.isDraw) {
      this.onDrawShape(e);
    }

    this.currentMousePos = this.getMouse(e);
    // if there's a selection see if we grabbed one of the selection handles
    if (this.currentSelectionShape !== null && !this.isResize) {
      for (var i = 0; i < 8; i++) {
        // 0  1  2
        // 3     4
        // 5  6  7

        var cur = this.currentSelectionHandles[i];

        // we dont need to use the ghost context because
        // selection handles will always be rectangles
        if (cur && this.currentMousePos.x >= cur.x && this.currentMousePos.x <= cur.x + this.currentSelectionShape.settings.selectionBoxSize &&
          this.currentMousePos.y >= cur.y && this.currentMousePos.y <= cur.y + this.currentSelectionShape.settings.selectionBoxSize) {
          // we found one!
          this.expectResize = i;
          this.refresh();

          switch (i) {
            case 0:
              this.canvas.style.cursor = 'nw-resize';
              break;
            case 1:
              this.canvas.style.cursor = 'n-resize';
              break;
            case 2:
              this.canvas.style.cursor = 'ne-resize';
              break;
            case 3:
              this.canvas.style.cursor = 'w-resize';
              break;
            case 4:
              this.canvas.style.cursor = 'e-resize';
              break;
            case 5:
              this.canvas.style.cursor = 'sw-resize';
              break;
            case 6:
              this.canvas.style.cursor = 's-resize';
              break;
            case 7:
              this.canvas.style.cursor = 'se-resize';
              break;
          }
          return;
        }

      }
      // not over a selection box, return to normal
      this.isResize = false;
      this.expectResize = -1;
      this.canvas.style.cursor = 'auto';
    }

  }

  refreshCursor() {
    if (this.currentSelectionShape == null && this.currentState.mode == 'draw') {
      this.canvas.style.cursor = 'crosshair';
    }

  }
  download() {
    if (this.canvas) {
      window.location = this.canvas.toDataURL("image/png");
    }
  }


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

    var x = e.pageX - offsetX;
    var y = e.pageY - offsetY
    return {
      x: x,
      y: y
    };
  }

} //end class
