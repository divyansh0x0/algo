const MouseInfo = {
    is_primary_btn_down: false,

    is_secondary_btn_down: false,

    is_auxiliary_btn_down: false,
    location: {x: 0, y: 0},
}
let element_in_focus = null; // element with respect to which mouse position is stored
export function setupMouseInfoFor(element){
    if(!element_in_focus) return
    element_in_focus = element;
}
window.onmousedown = (evt) => {
    switch (evt.button) {
        case 0:
            MouseInfo.is_primary_btn_down = true;
            break;
        case 1:
            MouseInfo.is_auxiliary_btn_down = true;
            break;
        case 2:
            MouseInfo.is_secondary_btn_down = true;
            break;
        default:
            console.log("Unknown mouse down info: " + evt);
            break;
    }

}
window.ontouchstart = (evt) =>{
    MouseInfo.is_primary_btn_down = true;
}
window.ontouchmove = (evt)=>{
    let bounding_rect = {x:0,y:0}
    if(element_in_focus)
        bounding_rect = element_in_focus.getBoundingClientRect();
    MouseInfo.location.x =  evt.touches[0].pageX - bounding_rect.x;
    MouseInfo.location.y =  evt.touches[0].pageY - bounding_rect.y;
}
window.ontouchend = (evt) =>{
    MouseInfo.is_primary_btn_down = false;
}
window.onmouseup = (evt) => {
    switch (evt.button) {
        case 0:
            MouseInfo.is_primary_btn_down = false;
            break;
        case 1:
            MouseInfo.is_auxiliary_btn_down = false;
            break;
        case 2:
            MouseInfo.is_secondary_btn_down = false;
            break;
        default:
            console.log("Unknown mouse up info: " + evt);
            break;
    }

}
window.onmousemove = (evt) => {
    let bounding_rect = {x:0,y:0}
    if(element_in_focus)
        bounding_rect = element_in_focus.getBoundingClientRect();
    MouseInfo.location = {x: evt.x - bounding_rect.x, y: evt.y - bounding_rect.y};

}

export default MouseInfo