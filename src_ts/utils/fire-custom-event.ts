export const fireEvent = (el: any, eventName: string, eventDetail: any) => {
  el.dispatchEvent(
    new CustomEvent(eventName, {
      detail: eventDetail,
      bubbles: true,
      composed: true
    })
  );
};
