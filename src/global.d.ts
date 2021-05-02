module JSX {
    type IntrinsicElements = {
        [key in keyof HTMLElementTagNameMap]: ObservableAttributes<Omit<HTMLElementTagNameMap[key], 'style'>> & { style?: ObservableAttributes<CSSStyleDeclaration> }
    }
}
