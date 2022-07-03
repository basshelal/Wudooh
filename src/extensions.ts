import {wait} from "./common"

declare global {
    interface Array<T> {
        contains(element: T): boolean;
        clear(): void;
        filterAsync(predicate: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<Array<T>>
        forEachAsync(callback: (value: T, index: number, array: T[]) => Promise<void>): Promise<void>
    }

    interface String {
        contains(string: string): boolean
    }

    // TODO: Better way of having delayed task that changes if updated before ran
    interface Element {
        currentTask: number;

        postDelayed(millis: number, func: Function): void;
    }
}

export function extensions(): void {
    if (!Array.prototype.contains) {
        Array.prototype.contains = function <T>(element: T): boolean {
            return this.indexOf(element) !== -1
        }
    }

    if (!Array.prototype.clear) {
        Array.prototype.clear = function <T>(): void {
            this.splice(0, this.length)
        }
    }

    if (!Array.prototype.filterAsync) {
        Array.prototype.filterAsync = async function <T>(predicate: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<Array<T>> {
            const booleans: Array<boolean> = await Promise.all(this.map((value, index, array) => predicate(value, index, array)))
            return this.filter((_value, index) => booleans[index])
        }
    }

    if (!Array.prototype.forEachAsync) {
        Array.prototype.forEachAsync = async function <T>(callback: (value: T, index: number, array: T[]) => Promise<void>): Promise<void> {
            await Promise.all(this.map((value, index, array) => callback(value, index, array)))
        }
    }

    if (!String.prototype.contains) {
        String.prototype.contains = function (string: string) {
            return this.indexOf(string) !== -1
        }
    }

    if (typeof Element !== "undefined" && !Element.prototype.postDelayed) {
        Element.prototype.postDelayed = function (millis: number, func: Function) {
            let localTask = wait(millis, () => {
                if (localTask === this.currentTask) func.call(this)
            })
            this.currentTask = localTask
        }
    }
}