export const fireEvent = (el, eventName, eventDetail) => {
    el.dispatchEvent(new CustomEvent(eventName, {
        detail: eventDetail,
        bubbles: true,
        composed: true
    }));
};
export const toggleAttributeValue = (el, attrName, attrVal1, attrVal2) => {
    if (!el || !el.hasAttribute) {
        return;
    }
    if (!el.hasAttribute(attrName)) {
        el.setAttribute(attrName, attrVal1);
        return;
    }
    if (el.getAttribute(attrName) === attrVal1) {
        el.setAttribute(attrName, attrVal2);
    }
    else {
        el.setAttribute(attrName, attrVal1);
    }
};
