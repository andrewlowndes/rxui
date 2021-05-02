# RxUI - Simple Reactive UI based on RxJS
Manage subscriptions to control reactions to UI elements, based on observables.

## Install
Ensure NodeJS is installed, install this library via `npm i rxui`

## Example
```javascript
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { createElement, reactive, reactivePrototyped, ifElse } from 'rxui';

//setup some manually managed observables for testing
const isDisabled = new BehaviorSubject(false);
const val2 = new BehaviorSubject(2);
const customText = new Subject<string>();

//we can wrap and promote any function (including prototyped methods) to reactive that accepts observables as parameters
const $ifElse = reactive(ifElse);
const $concat = reactivePrototyped(String, 'concat');

const val3 = reactive((val2: number) => (Math.abs(val2 + 1) + 2).toString() + 'px')(val2);
const resultText = merge($concat('some text: ', val3, ' and more...'), customText);

const wrap = createElement('div', {},
    createElement('input', {
        disabled: isDisabled,
        value: resultText,
        style: {
            position: 'absolute',
            left: val3
        },
        oninput: (event) => {
            customText.next((event.target as HTMLInputElement).value);
        }
    }),
    createElement('div', {
        style: {
            position: 'absolute',
            top: '120px'
        },
        textContent: resultText
    }),
    $ifElse(isDisabled, 'Disabled'),
    createElement('button', {
        style: {
            position: 'absolute',
            top: '40px'
        },
        onclick: () => {
            isDisabled.next(!isDisabled.getValue());
        }
    }, $ifElse(isDisabled, 'Enable', 'Disable'))
);

window.onload = () => {
    document.body.appendChild(wrap);

    //change some of the values in the observables to see the propagation
    setTimeout(() => {
        val2.next(-25);
    }, 2000);
    
    setTimeout(() => {
        val2.next(-53);
    }, 4000);

    setTimeout(() => {
        document.body.removeChild(wrap);
    }, 3000);
};
```

### Using JSX
There is built-in support for JSX
```javascript
const wrap = (
    <div>
        <input
            disabled={isDisabled}
            value={resultText}
            style={{
                position: 'absolute',
                left: val3
            }}
            oninput={(event: InputEvent) => {
                customText.next((event.target as HTMLInputElement).value);
            }} 
        />
        <div
            style={{
                position: 'absolute',
                top: '120px'
            }}
            textContent={resultText}
        ></div>
        {$ifElse(isDisabled, 'Enable')}
        <button
            style={{
                position: 'absolute',
                top: '40px'
            }}
            onclick={() => {
                isDisabled.next(!isDisabled.getValue());
            }}
        >
            {$ifElse(isDisabled, 'Enable', 'Disable')}
        </button>
    </div>
);
```
