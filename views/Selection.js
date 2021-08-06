import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Selection");
    }

    async getHtml() {
        return `
        <h1>this is a test - selection<h1>
        `;
    }
}
