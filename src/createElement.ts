import { Observable, Subscription } from "rxjs";
import { createElementWithLifecycle } from "./createElementWithLifecycle";

export type ObservableAttributes<T> = Partial<{ [prop in keyof T]: T[prop] | Observable<T[prop]>}>;

const subscribeAttributes = <T extends object>(obj: T, attr: ObservableAttributes<T>): Array<Subscription> => {
    const subscriptions = new Array<Subscription>();
    
    for (const key in attr) {
        const newValue = attr[key];

        if (newValue instanceof Observable) {
            subscriptions.push(newValue.subscribe((val) => obj[key] = val ));
        } else if (newValue !== undefined) {
            obj[key] = newValue as any; // unable to infer the type correctly :(
        }
    }

    return subscriptions;
};

/**
 * Create a reactive component that subscribes and unsubscribes to observables bound to attributes and methods on the input
 * we need to ensure the subscriptions are automatically subscribed and unsubscribed when the dom is attached and detached from the dom
 */
type ObservableOr<T> = Observable<T> | T;
export type ChildType = ObservableOr<Node | string | undefined | null>;

export const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, attributes: ObservableAttributes<Omit<HTMLElementTagNameMap[K], 'style'>> & { style?: ObservableAttributes<CSSStyleDeclaration> }, ...children: Array<ChildType>) => {
    const element = createElementWithLifecycle(tag);

    const subscriptions = new Array<Subscription>();

    const onConnect = () => {
        subscriptions.map((subscription) => subscription.unsubscribe());
        subscriptions.length = 0;

        if (element.isConnected) {
            if (attributes) {
                //handle style differently (mutate style properties individually)
                const style = attributes.style;
                delete attributes.style;

                subscriptions.push(...subscribeAttributes(element, attributes as ObservableAttributes<HTMLElementTagNameMap[K]>));

                //TODO: support using an observable object for the style
                if (style !== undefined) {
                    subscriptions.push(...subscribeAttributes(element.style, style));
                }
            }

            //TODO: support using an observable array for the children
            if (children.length) {
                for (let child of children) {
                    if (child instanceof Observable) {
                        element.appendChild(document.createTextNode(''));

                        subscriptions.push(child.subscribe((val) => {
                            const prevNode = element.childNodes[children.indexOf(child)];
                            
                            if (val instanceof HTMLElement) {
                                element.replaceChild(val, prevNode);
                            } else if (typeof val === 'string') {
                                element.replaceChild(document.createTextNode(val), prevNode);
                            } else {
                                element.replaceChild(document.createTextNode(''), prevNode);
                            }
                        }));
                    } else {
                        if (child instanceof HTMLElement) {
                            element.appendChild(child);
                        } else if (typeof child === 'string') {
                            element.appendChild(document.createTextNode(child));
                        } else {
                            element.appendChild(document.createTextNode(''));
                        }
                    }
                }
            }
        }
    };

    const onDisconnect = () => {
        subscriptions.map((subscription) => subscription.unsubscribe());
        subscriptions.length = 0;
    };

    element.addEventListener('connected', onConnect);
    element.addEventListener('disconnect', onDisconnect);

    return element;
};
