
class Shape {
    constructor() {

    }
    isSelect(x, y) {
        return x > this.x && x < (this.x + this.w) && y > this.y && y < (this.h + this.y);
    }
    select(context) {
        context.strokeRect(this.x, this.y, this.w, this.h);
    }
    initResize(context, selectionHandles) {
        var mySelColor = this.settings.selectionColor;
        var mySelWidth = this.settings.selectionWidth;
        var mySelBoxColor = this.settings.selectionBoxColor; // New for selection boxes
        var mySelBoxSize = this.settings.selectionBoxSize;

        // draw the shapees
        var half = mySelBoxSize / 2;

        // 0  1  2
        // 3     4
        // 5  6  7

        // top left, middle, right
        selectionHandles[0].x = this.x - half;
        selectionHandles[0].y = this.y - half;

        selectionHandles[1].x = this.x + this.w / 2 - half;
        selectionHandles[1].y = this.y - half;

        selectionHandles[2].x = this.x + this.w - half;
        selectionHandles[2].y = this.y - half;

        //middle left
        selectionHandles[3].x = this.x - half;
        selectionHandles[3].y = this.y + this.h / 2 - half;

        //middle right
        selectionHandles[4].x = this.x + this.w - half;
        selectionHandles[4].y = this.y + this.h / 2 - half;

        //bottom left, middle, right
        selectionHandles[6].x = this.x + this.w / 2 - half;
        selectionHandles[6].y = this.y + this.h - half;

        selectionHandles[5].x = this.x - half;
        selectionHandles[5].y = this.y + this.h - half;

        selectionHandles[7].x = this.x + this.w - half;
        selectionHandles[7].y = this.y + this.h - half;


        context.fillStyle = mySelBoxColor;
        for (var i = 0; i < 8; i++) {
            var cur = selectionHandles[i];
            if (cur && cur.w != 0 && cur.h != 0)
                context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
        }
    }

    recalculate(oldW, oldH, newW, newH) {
        if (oldH != newH || oldW != newW) {
            this.x = Math.floor((this.x / oldW) * newW);
            this.y = Math.floor((this.y / oldH) * newH);
            this.w = Math.floor((this.w / oldW) * newW);
            this.h = Math.floor((this.h / oldH) * newH);
        }
    }
    resize(expectResize, mouseX, mouseY) {
        var oldx = this.x;
        var oldy = this.y;

        // 0  1  2
        // 3     4
        // 5  6  7
        switch (expectResize) {
            case 0:
                this.x = mouseX;
                this.y = mouseY;
                this.w += oldx - mouseX;
                this.h += oldy - mouseY;
                break;
            case 1:
                this.y = mouseY;
                this.h += oldy - mouseY;
                break;
            case 2:
                this.y = mouseY;
                this.w = mouseX - oldx;
                this.h += oldy - mouseY;
                break;
            case 3:
                this.x = mouseX;
                this.w += oldx - mouseX;
                break;
            case 4:
                this.w = mouseX - oldx;
                break;
            case 5:
                this.x = mouseX;
                this.w += oldx - mouseX;
                this.h = mouseY - oldy;
                break;
            case 6:
                this.h = mouseY - oldy;
                break;
            case 7:
                this.w = mouseX - oldx;
                this.h = mouseY - oldy;
                break;
        }

    }
    fillStyle(context) {
        if (this.style.font)
            context.font = this.style.font;
        if (this.style.lineWidth)
            context.lineWidth = this.style.lineWidth;
        if (this.style.strokeStyle)
            context.strokeStyle = this.style.strokeStyle;
        if (this.style.textAlign)
            context.textAlign = this.style.textAlign;
        if (this.style.textBaseline)
            context.textBaseline = this.style.textBaseline;
        if (this.style.fillStyle)
            context.fillStyle = this.style.fillStyle;

        if (this.style.opacity)
            context.globalAlpha = this.style.opacity / 100;

    }

    setDefaultSettings() {
        if (!this.settings) {
            settings = new Object();
        }

        // if (!this.settings.selectionColor)
        //     this.settings.selectionColor = '#CC0000';

        // if (!this.settings.selectionWidth)
        //     this.settings.selectionWidth = 2;

        // if (!this.settings.selectionBoxColor)
        //     this.settings.selectionBoxColor = 'darkred';

        // if (!this.settings.selectionBoxSize)
        //     this.settings.selectionBoxSize = 6;

    }

}

class RectShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.settings = settings;

        this.setDefaultSettings();
    }

    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }
    isSelect(x, y) {
        return super.isSelect(x, y);
    }

    clone() {
        var newRect = new RectShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style);
        return newRect;
    }
    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);
        context.rect(this.x, this.y, this.w, this.h);
        if (this.fill)
            context.fill();
        else
            context.stroke();

        context.globalAlpha = 1;
    }


}



class ImageShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style, data) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.data = data;
        this.settings = settings;
        this.setDefaultSettings();
    }
    setDefaultSettings() {
        super.setDefaultSettings();
    }

    isSelect(x, y) {
        return super.isSelect(x, y);
    }
    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }

    clone() {
        var newRect = new ImageShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style, this.data);
        return newRect;
    }

    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);
        if (this.data && this.data.image) {
            this.drawImage(context);
            if (this.fill) {
                context.fill();
            } else {
                context.stroke();
            }
            context.globalAlpha = 1;
        }
    }
    drawImage(context) {
        context.drawImage(this.data.image, this.x, this.y, this.w, this.h);
    }
}


class OvalShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.settings = settings;
        this.setDefaultSettings();
    }
    isSelect(x, y) {
        return super.isSelect(x, y);
    }

    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }

    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }

    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);
        var rx = this.w / 2;
        var ry = this.h / 2;
        const centerX = this.x + rx;
        const centerY = this.y + ry;

        context.beginPath();
        context.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);

        if (this.fill) {
            context.fill();
        } else {
            context.stroke();
        }

        context.globalAlpha = 1;

    }

    clone() {
        var newOval = new OvalShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style);
        return newOval;
    }


    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }

}


class LineShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.settings = settings;

        this.setDefaultSettings();
    }

    isSelect(x, y) {
        return super.isSelect(x, y);
    }
    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }


    clone() {
        var newRect = new LineShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style);
        return newRect;
    }
    draw(context, cw, ch) {
        //  // We can skip the drawing of elements that have moved off the screen:
        //  if (this.x > cw || this.y > ch) return; 
        //  if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.w, this.y + this.h);

        context.stroke();

        context.globalAlpha = 1;
    }
}

class TextShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style, data) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.data = data;
        this.settings = settings;

        this.setDefaultSettings();
    }
    isSelect(x, y) {
        return super.isSelect(x, y);
    }

    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }


    clone() {
        var newRect = new TextShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style, this.data);
        return newRect;
    }
    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);

        if (this.data && this.data.image) {
            context.drawImage(this.data.image, this.x, this.y, this.w, this.h);
            if (this.fill) {
                context.fill();
            } else {
                context.stroke();
            }
            context.globalAlpha = 1;
        }

    }
    static convertTextToImage(text) {
        var canvas = document.createElement('canvas');
        var image = TextShape.getImageFromText(text, canvas)
        canvas.remove();
        return image;
    }


    static getImageFromText(text, canvas) {
        var width = 0;
        var height = 0;
        var allHeight = 0;
        var context = canvas.getContext('2d');
        var arr = text.split('\n');
        context.font = "30px Arial";
        context.textAlign = 'center';
        for (var index = 0; index < arr.length; index++) {
            let metrics = context.measureText(arr[index]);
            if (metrics.width > width)
                width = metrics.width;

            var hh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

            if (hh > height)
                height = hh;

            allHeight += hh;
            context.fillText(arr[index], canvas.width / 2, (index) * 30 + height);
        }
        var img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

}

class EmojyShape extends Shape {
    constructor(settings, id, x, y, w, h, fill, style, data) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.h = Math.abs(h);
        this.w = Math.abs(w);
        this.fill = fill;
        this.style = style;
        this.data = data;
        this.settings = settings;

        this.setDefaultSettings();
    }
    isSelect(x, y) {
        return super.isSelect(x, y);
    }

    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        super.select(context);
    }


    clone() {
        var newRect = new EmojyShape(this.settings, this.id, this.x, this.y, this.w, this.h, this.fill, this.style, this.data);
        return newRect;
    }
    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        this.fillStyle(context);

        if (this.data && this.data.image) {
            context.drawImage(this.data.image, this.x, this.y, this.w, this.h);
            if (this.fill) {
                context.fill();
            } else {
                context.stroke();
            }
            context.globalAlpha = 1;
        }

    }
    static getDefaultSizeEmojy() {
        return {
            w: 50,
            h: 50
        };
    }
    static convertTextToImage(text) {
        var canvas = document.createElement('canvas');
        var dfe = EmojyShape.getDefaultSizeEmojy();
        canvas.width = dfe.w;
        canvas.height = dfe.h;
        var image = EmojyShape.getImageFromText(text, canvas);
        canvas.remove();
        return image;
    }


    static getImageFromText(text, canvas) {
        var context = canvas.getContext('2d');
        let metrics = context.measureText(text);
        context.font = '20px Arial';
        context.textAlign = 'center';
        var hh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        var img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

}



class PointShape extends Shape {
    constructor(settings, id, x, y, fill, style) {
        super();
        this.id = id;
        this.x = Math.abs(x);
        this.y = Math.abs(y);
        this.fill = fill;
        this.style = style;
        this.settings = settings;

        this.setDefaultSettings();
    }

    setDefaultSettings() {
        super.setDefaultSettings();
    }

    initResize(context, selectionHandles) {
        //super.initResize(context, selectionHandles);
    }
    recalculate(oldW, oldH, newW, newH) {
        super.recalculate(oldW, oldH, newW, newH);
    }
    resize(expectResize, mouseX, mouseY) {
        //super.resize(expectResize, mouseX, mouseY);
    }
    fillStyle(context) {
        super.fillStyle(context);
    }
    select(context) {
        //super.select(context);
    }
    isSelect(x, y) {
        //return super.isSelect(x, y);
        return false;
    }

    clone() {
        var newRect = new PointShape(this.settings, this.id, this.x, this.y, this.fill, this.style);
        return newRect;
    }
    draw(context, cw, ch) {
        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > cw || this.y > ch) return;

        this.fillStyle(context);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.globalAlpha = 1;
    }


}
