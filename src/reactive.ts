import { combineLatest, Observable, of } from "rxjs";
import { map } from "rxjs/operators";

//does not resolve to an array type when used in the rest param type so force with a union for now
export type ObservableArg<T extends Array<any>> = Array<unknown> & { [P in keyof T]: Observable<T[P]> | T[P] };

//wraps any method to bind all of the arguments to be observed and trigger a change in the function
export const reactive = <F extends (...args: any) => any>(func: F) => {
    return (...args: ObservableArg<Parameters<F>>): Observable<ReturnType<F>> => {
        const observableArgs = args.map((arg) => {
            return (arg instanceof Observable ? arg : of(arg));
        });

        return combineLatest(observableArgs).pipe(map((mapArgs) => func(...mapArgs)));
    }
};

export const reactivePrototyped = <T extends Function, S extends keyof T['prototype']>(classType: T, prototypeFunc: S) => {
    const func = classType.prototype[prototypeFunc];

    return reactive((instance: ThisType<T>, ...args: Parameters<T['prototype'][S]>): ReturnType<T['prototype'][S]> => func.apply(instance, args));
};
