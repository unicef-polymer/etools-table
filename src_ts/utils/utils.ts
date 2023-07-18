export const fireEvent = (el: any, eventName: string, eventDetail: any) => {
  el.dispatchEvent(
    new CustomEvent(eventName, {
      detail: eventDetail,
      bubbles: true,
      composed: true
    })
  );
};

export const toggleAttributeValue = (el: any, attrName: string, attrVal1: any, attrVal2: any) => {
  if (!el || !el.hasAttribute) {
    return;
  }

  if (!el.hasAttribute(attrName)) {
    el.setAttribute(attrName, attrVal1);
    return;
  }

  if (el.getAttribute(attrName) === attrVal1) {
    el.setAttribute(attrName, attrVal2);
  } else {
    el.setAttribute(attrName, attrVal1);
  }
};
