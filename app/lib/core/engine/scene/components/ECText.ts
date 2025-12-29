import {ECID, type EntityComponent} from "~/lib/core/engine/scene/components/EntityComponent";

export class ECText implements EntityComponent {

    readonly id: ECID = ECID.Text;

    constructor(
        public text: string,
        public fontSize: number = 20,
        public fontFamily: string = "serif",
        public relX = 0,
        public relY = 0) {
    }
}