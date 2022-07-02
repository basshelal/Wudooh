import "chromedriver" // don't remove this! Needed by "selenium-webdriver" for Chrome
import {Browser, Builder, ThenableWebDriver} from "selenium-webdriver"
import sinonChrome from "sinon-chrome"
import {wait} from "../common"

let driver: ThenableWebDriver

Object.defineProperty(navigator, "userAgent", {value: "chrome", configurable: true})

var chrome: typeof sinonChrome = sinonChrome

beforeAll(() => {
    driver = new Builder()
        .forBrowser(Browser.CHROME)
        .build()
})

test("testName", async () => {
    console.log("This is a test")
    wait(1000, () => {})
})

afterAll(async () => {
    await driver.quit()
})

// TODO: Continue here!
//  We most likely need to use "the stack" ugh, Use webpack and possibly even React (or Preact) for things to be
//  scalable and testable, the bloat is un-escapable
//  Use any of these boilerplates:
//  https://github.com/duo-labs/chrome-extension-boilerplate
//  https://github.com/chibat/chrome-extension-typescript-starter
//  this is interesting too: https://www.streaver.com/blog/posts/testing-web-extensions
//  https://medium.com/information-and-technology/integration-testing-browser-extensions-with-jest-676b4e9940ca