const MouseInfo = {
    is_primary_btn_down: false,

    is_secondary_btn_down: false,

    is_auxiliary_btn_down: false,
    location: {x: 0, y: 0}
};

let element_in_focus; // element with respect to which mouse position is stored

const mousedownlistener = (evt) => {
    if (!element_in_focus.contains(evt.target))
        return;
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
};

const touchstartlistener = (evt) => {
    if (!element_in_focus.contains(evt.target))
        return;
    MouseInfo.is_primary_btn_down = true;
};
const touchmovelistener = evt => {
    let bounding_rect = {x: 0, y: 0};
    if (element_in_focus)
        bounding_rect = element_in_focus.getBoundingClientRect();
    MouseInfo.location.x = evt.touches[0].pageX - bounding_rect.x;
    MouseInfo.location.y = evt.touches[0].pageY - bounding_rect.y;
};

const touchendlistener = () => {
    MouseInfo.is_primary_btn_down = false;
};
const mouseuplistener = (evt) => {
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

};

const mousemovelistener = (evt) => {
    let bounding_rect = {x: 0, y: 0};
    if (element_in_focus)
        bounding_rect = element_in_focus.getBoundingClientRect();
    MouseInfo.location = {x: evt.x - bounding_rect.x, y: evt.y - bounding_rect.y};
};

export function setupMouseInfoFor(element) {
    if (!element) return;
    if (element_in_focus) {
        window.removeEventListener("mousedown", mousedownlistener);
        window.removeEventListener("touchstart", touchstartlistener);
        window.removeEventListener("touchmove", touchmovelistener);
        window.removeEventListener("touchend", touchendlistener);
        window.removeEventListener("mouseup", mouseuplistener);
        window.removeEventListener("mousemove", mousemovelistener);
    }
    element_in_focus = element;
    console.log("waw");
    window.addEventListener("mousedown", mousedownlistener);
    window.addEventListener("touchstart", touchstartlistener);
    window.addEventListener("touchmove", touchmovelistener);
    window.addEventListener("touchend", touchendlistener);
    window.addEventListener("mouseup", mouseuplistener);
    window.addEventListener("mousemove", mousemovelistener);
}


export default MouseInfo;