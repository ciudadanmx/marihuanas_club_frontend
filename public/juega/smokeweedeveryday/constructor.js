class Rapper {
    constructor(image, x, y, width, height) {
        this.img = new Image();
        this.img.src = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.dx = 1;
        this.dy = 1;
    }

    rightBorder() {
        return this.x + this.width
    }

    bottomBorder() {
        return this.y + this.height
    }
}
