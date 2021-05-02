
const tagNameMap = {
    "a": HTMLAnchorElement,
    "abbr": HTMLElement,
    "address": HTMLElement,
    "applet": HTMLElement,
    "area": HTMLAreaElement,
    "article": HTMLElement,
    "aside": HTMLElement,
    "audio": HTMLAudioElement,
    "b": HTMLElement,
    "base": HTMLBaseElement,
    "basefont": HTMLElement,
    "bdi": HTMLElement,
    "bdo": HTMLElement,
    "blockquote": HTMLQuoteElement,
    "body": HTMLBodyElement,
    "br": HTMLBRElement,
    "button": HTMLButtonElement,
    "canvas": HTMLCanvasElement,
    "caption": HTMLTableCaptionElement,
    "cite": HTMLElement,
    "code": HTMLElement,
    "col": HTMLTableColElement,
    "colgroup": HTMLTableColElement,
    "data": HTMLDataElement,
    "datalist": HTMLDataListElement,
    "dd": HTMLElement,
    "del": HTMLModElement,
    "details": HTMLDetailsElement,
    "dfn": HTMLElement,
    "dialog": HTMLDialogElement,
    "dir": HTMLDirectoryElement,
    "div": HTMLDivElement,
    "dl": HTMLDListElement,
    "dt": HTMLElement,
    "em": HTMLElement,
    "embed": HTMLEmbedElement,
    "fieldset": HTMLFieldSetElement,
    "figcaption": HTMLElement,
    "figure": HTMLElement,
    "font": HTMLFontElement,
    "footer": HTMLElement,
    "form": HTMLFormElement,
    "frame": HTMLFrameElement,
    "frameset": HTMLFrameSetElement,
    "h1": HTMLHeadingElement,
    "h2": HTMLHeadingElement,
    "h3": HTMLHeadingElement,
    "h4": HTMLHeadingElement,
    "h5": HTMLHeadingElement,
    "h6": HTMLHeadingElement,
    "head": HTMLHeadElement,
    "header": HTMLElement,
    "hgroup": HTMLElement,
    "hr": HTMLHRElement,
    "html": HTMLHtmlElement,
    "i": HTMLElement,
    "iframe": HTMLIFrameElement,
    "img": HTMLImageElement,
    "input": HTMLInputElement,
    "ins": HTMLModElement,
    "kbd": HTMLElement,
    "label": HTMLLabelElement,
    "legend": HTMLLegendElement,
    "li": HTMLLIElement,
    "link": HTMLLinkElement,
    "main": HTMLElement,
    "map": HTMLMapElement,
    "mark": HTMLElement,
    "marquee": HTMLMarqueeElement,
    "menu": HTMLMenuElement,
    "meta": HTMLMetaElement,
    "meter": HTMLMeterElement,
    "nav": HTMLElement,
    "noscript": HTMLElement,
    "object": HTMLObjectElement,
    "ol": HTMLOListElement,
    "optgroup": HTMLOptGroupElement,
    "option": HTMLOptionElement,
    "output": HTMLOutputElement,
    "p": HTMLParagraphElement,
    "param": HTMLParamElement,
    "picture": HTMLPictureElement,
    "pre": HTMLPreElement,
    "progress": HTMLProgressElement,
    "q": HTMLQuoteElement,
    "rp": HTMLElement,
    "rt": HTMLElement,
    "ruby": HTMLElement,
    "s": HTMLElement,
    "samp": HTMLElement,
    "script": HTMLScriptElement,
    "section": HTMLElement,
    "select": HTMLSelectElement,
    "slot": HTMLSlotElement,
    "small": HTMLElement,
    "source": HTMLSourceElement,
    "span": HTMLSpanElement,
    "strong": HTMLElement,
    "style": HTMLStyleElement,
    "sub": HTMLElement,
    "summary": HTMLElement,
    "sup": HTMLElement,
    "table": HTMLTableElement,
    "tbody": HTMLTableSectionElement,
    "td": HTMLElement,
    "template": HTMLTemplateElement,
    "textarea": HTMLTextAreaElement,
    "tfoot": HTMLTableSectionElement,
    "th": HTMLElement,
    "thead": HTMLTableSectionElement,
    "time": HTMLTimeElement,
    "title": HTMLTitleElement,
    "tr": HTMLTableRowElement,
    "track": HTMLTrackElement,
    "u": HTMLElement,
    "ul": HTMLUListElement,
    "var": HTMLElement,
    "video": HTMLVideoElement,
    "wbr": HTMLElement
};

export interface HTMLElementWithLifecycleEventMap extends HTMLElementEventMap {
    "connected": CustomEvent;
    "disconnected": CustomEvent;
}

//use custom elements just so we can get some lifecycle events for dom elements
export interface LifecycleEvents<T> {
    addEventListener<K extends keyof HTMLElementWithLifecycleEventMap>(type: K, listener: (this: T, ev: HTMLElementWithLifecycleEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementWithLifecycleEventMap>(type: K, listener: (this: T, ev: HTMLElementWithLifecycleEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
}

export const createElementWithLifecycle = <K extends keyof HTMLElementTagNameMap>(tag: K) => {
    const customTagname = `${tag}-lifecycle`;

    if (customElements.get(customTagname) === undefined) {
        customElements.define(customTagname, class extends tagNameMap[tag] implements LifecycleEvents<HTMLElementTagNameMap[K]> {
            connectedCallback() {
                super.dispatchEvent(new CustomEvent('connected'));
            }
            disconnectedCallback() {
                super.dispatchEvent(new CustomEvent('disconnected'));
            }

            addEventListener<T extends keyof HTMLElementWithLifecycleEventMap>(type: T, listener: (this: HTMLElementTagNameMap[K], ev: HTMLElementWithLifecycleEventMap[T]) => any, options?: boolean | AddEventListenerOptions): void {
                super.addEventListener(type, listener, options);
            }

            removeEventListener<T extends keyof HTMLElementWithLifecycleEventMap>(type: T, listener: (this: HTMLElementTagNameMap[K], ev: HTMLElementWithLifecycleEventMap[T]) => any, options?: boolean | EventListenerOptions): void {
                super.removeEventListener(type, listener, options);
            }
        }, { extends: tag });
    }

    return document.createElement(tag, { is: customTagname }) as HTMLElementTagNameMap[K] & LifecycleEvents<HTMLElementTagNameMap[K]>;
};
