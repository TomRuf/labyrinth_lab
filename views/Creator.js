import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Creator");
    }

    async getHtml() {
        return `
        <h1>this is a test - Creator<h1>
        `;
    }
}
