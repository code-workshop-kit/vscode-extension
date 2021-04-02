class <%= participantName %>CounterComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h1>Hello, <%= participantName %>!</h1>`;
  }
}
customElements.define('<%= participantNameToLower %>-counter-component', <%= participantName %>CounterComponent);

export default `<<%= participantNameToLower %>-counter-component></<%= participantNameToLower %>-counter-component>`;
