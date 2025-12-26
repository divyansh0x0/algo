class Camera {
    public camera_updated = true;
    public onupdate: Function | null = null;

    constructor() {
    }

    private _x = 0;

    public get x() {
        return this._x;
    }

    public set x(x_new: number) {
        this._x = x_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }

    private _y = 0;

    public get y() {
        return this._y;
    }

    public set y(y_new: number) {
        this._y = y_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }

    private _zoom = 1;

    public get zoom() {
        return this._zoom;
    }

    public set zoom(zoom_new: number) {
        this._zoom = zoom_new;
        this.camera_updated = true;
        if (this.onupdate)
            this.onupdate();
    }
}

