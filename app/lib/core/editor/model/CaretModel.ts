export class CaretModel{

    constructor(private row = 0, private col = 0) {}

    getRow():number{
        return this.row;
    }
    getColumn():number{
        return this.col;
    }

    incrementColumn(): void {
        // console.log("sad")
        this.col+=1;
    }
}