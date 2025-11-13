// components/dashboard/TranslationBlot.ts
"use client";

import type QuillType from "quill";

export default function registerTranslationBlot() {
  if (typeof window === "undefined") return;

  const ReactQuill = require("react-quill-new");
  const Quill = (ReactQuill as any).Quill as typeof QuillType;

  if (!Quill || typeof Quill.import !== "function") return;

  const Inline = Quill.import("blots/inline") as any;

  class TranslationBlot extends Inline {
    static blotName = "translation";
    static tagName = "span";
    static className = "translated-part";

    static create(value: string) {
      const node = super.create() as HTMLElement;
      node.setAttribute("data-translation", value);
      node.style.backgroundColor = "#fff8dc";
      node.style.borderRadius = "3px";
      node.style.padding = "0 3px";
      node.style.cursor = "pointer";
      node.style.transition = "background 0.2s ease";
      return node;
    }

    static formats(node: HTMLElement) {
      return node.getAttribute("data-translation");
    }

    format(name: string, value: string) {
      if (name === "translation" && value) {
        (this.domNode as HTMLElement).setAttribute("data-translation", value);
      } else {
        super.format(name, value);
      }
    }
  }

  if (!(Quill as any).imports["formats/translation"]) {
    Quill.register(TranslationBlot);
  }
}
