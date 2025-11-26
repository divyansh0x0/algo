export class Slider extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});

        shadow.innerHTML = `
      <style>
        .card {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-family: sans-serif;
        }
      </style>

      <div class="card">
        <slot></slot>
      </div>
    `;
    }
}

// Register the component so the browser recognizes <my-card>
