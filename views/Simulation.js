import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Simulation");
    }

    async getHtml() {
        return `
        <h1>this is a test - Simulation<h1>
        `;
    }
}


