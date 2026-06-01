class TextMessage {
    constructor({text, onComplete, options = null}) {
        this.text = text;
        this.onComplete = onComplete;
        this.options = options; 
        this.element = null;

        this.choiceSelection = 0;
    }

    createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `
        <p class="TextMessage_p"></p>
    `;

    this.revealingText = new RevealingText({
        element: this.element.querySelector(".TextMessage_p"),
        text: this.text
    });

    // SOLO botón si no hay opciones
    if (!this.options) {
        const button = document.createElement("button");
        button.classList.add("TextMessage_button");
        button.innerText = "Next";

        button.addEventListener("click", () => this.done());

        this.element.appendChild(button);

        this.actionListener = new KeyPressListener("Enter", () => this.done());
    }
}

    // Render de opciones
    createOptions() {
    if (this.optionsRendered) return;
    this.optionsRendered = true;

    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add("TextMessage_options");

    this.options.forEach((opt, index) => {
        const button = document.createElement("button");
        button.classList.add("TextMessage_option");

        button.innerText = opt;

        button.addEventListener("click", () => {
            this.finishChoice(index);
        });

        optionsContainer.appendChild(button);
    });

    this.element.appendChild(optionsContainer);
}

    finishChoice(selection) {

    const value = selection;

    if (this.actionListener) {
        this.actionListener.unbind();
    }

    if (this.keyboardMenu) {
        document.removeEventListener("keydown", this.keyboardMenu);
    }

    this.element.remove();

    this.onComplete(value);
}

    done() {

    if (!this.revealingText.isDone) {
        this.revealingText.warpToDone();
        return;
    }

    if (this.options && !this.optionsRendered) {
        this.optionsRendered = true;
        this.createOptions();
        this.updateOptions();
        return;
    }

    if (this.actionListener) {
        this.actionListener.unbind();
    }

    if (this.keyboardMenu) {
        document.removeEventListener("keydown", this.keyboardMenu);
    }

    this.element.remove();
    this.onComplete();
}
updateOptions() {
    const buttons = this.element.querySelectorAll(".TextMessage_option");

    buttons.forEach((btn, index) => {
        if (index === this.choiceSelection) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

    init(container) {
    this.optionsRendered = false;

    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();

    // input opciones
    if (this.options) {
        this.choiceSelection = 0;

        this.keyboardMenu = (e) => {
            if (e.key === "ArrowUp") {
                this.choiceSelection--;
                if (this.choiceSelection < 0) {
                    this.choiceSelection = this.options.length - 1;
                }
                this.updateOptions();
            }

            if (e.key === "ArrowDown") {
                this.choiceSelection++;
                if (this.choiceSelection >= this.options.length) {
                    this.choiceSelection = 0;
                }
                this.updateOptions();
            }

            if (e.key === "Enter") {
                this.finishChoice(this.choiceSelection);
            }
        };

        document.addEventListener("keydown", this.keyboardMenu);

        // render inicial
        setTimeout(() => {
            this.createOptions();
            this.updateOptions();
        }, 0);
    }
}
}