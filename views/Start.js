import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Start");
    }

    async getHtml() {
        return `
        <h1>this is a test - Start<h1>
        `;
    }
}
