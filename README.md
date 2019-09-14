# Wudooh وضوح
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nigfaloeeeakmmgndbdcijjegolpjfhn.svg)](https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/nigfaloeeeakmmgndbdcijjegolpjfhn.svg)](https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/nigfaloeeeakmmgndbdcijjegolpjfhn.svg)](https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn/reviews)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating-count/nigfaloeeeakmmgndbdcijjegolpjfhn.svg)](https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn/reviews)

[![Mozilla Add-on](https://img.shields.io/amo/v/wudooh.svg)](https://addons.mozilla.org/en-US/firefox/addon/wudooh/)
[![Mozilla Add-on](https://img.shields.io/amo/users/wudooh.svg)](https://addons.mozilla.org/en-US/firefox/addon/wudooh/)
[![Mozilla Add-on](https://img.shields.io/amo/stars/wudooh)](https://addons.mozilla.org/en-US/firefox/addon/wudooh/reviews)

[![Chrome](https://img.shields.io/badge/-Dowload%20on%20Chrome-yellow?style=flat&logo=Google%20Chrome&logoColor=blue)](https://chrome.google.com/webstore/detail/wudooh/nigfaloeeeakmmgndbdcijjegolpjfhn)
[![Firefox](https://img.shields.io/badge/-Dowload%20on%20Firefox-blue?style=flat&logo=Mozilla%20Firefox&logoColor=orange)](https://addons.mozilla.org/en-US/firefox/addon/wudooh/)

[![Wudooh Banner](https://github.com/basshelal/Wudooh/blob/master/pictures/GitHubPromo.png)](https://basshelal.github.io/Wudooh/)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/P5P5XSTN)

* [Current Features](#current-features)
    * [On Off Switch](#on-off-switch)
    * [Change Font](#change-font)
    * [Change Font Size](#change-font-size)
    * [Change Line Height](#change-line-height)
    * [Whitelist](#whitelist)
    * [Live Updates](#live-updates)
    * [Safe Editables](#safe-editables)
* [Future Features](#future-features)
* [Known Issues](#known-issues)
    * [Quran.com](#qurancom)
    * [YouTube](#youtube)
* [Contributing](#contributing)
* [All Fonts](#all-fonts)
* [Thanks](#thanks)

![User Testimonial](https://github.com/basshelal/Wudooh/blob/master/pictures/Testimonial.png)

Wudooh [(clarity in Arabic and Persian)](https://en.wiktionary.org/wiki/%D9%88%D8%B6%D9%88%D8%AD)
 is a simple browser extension that makes reading Arabic script text clearer and more pleasant.

This project is based on and is the successor to
 [Jackson Petty's](https://github.com/jopetty) 
 [Huruf](https://github.com/jopetty/Huruf). Wudooh adds many more features 
 and fixes commonly complained about problems found in Huruf.

Without Wudooh:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Without.PNG)

With Wudooh:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/With.PNG)

## Current Features

Wudooh will update all Arabic script text across the browser and modify it according 
to the user's options.

Wudooh will do this automatically to any Arabic text, meaning even newly loaded 
content with Arabic text will also update and become clearer.

This is not just for Arabic, but for any Arabic script, meaning this can work 
for Persian, Urdu and any other 
[Arabic script language](https://en.wikipedia.org/wiki/Arabic_script).

Wudooh popup:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Wudooh.PNG)

### On Off Switch

Wudooh allows the user to turn on or off the extension using a quick toggle switch.
A small feature, but a useful one that was requested in Huruf.

### Change Font

Wudooh gives the user 35 font choices to choose from, this includes Naskh fonts,
Ruqaa fonts, Nastaliq fonts and many more. This also includes default fonts such as 
Calibri and Times New Roman. The user can also choose the no-font font (lol wut), 
this will not change the font of the text.

A list of all currently supported fonts can be found [here](#all-fonts).

Without Wudooh:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/ImranKhanBefore.PNG)

With Wudooh:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/ImranKhanAfter.PNG)

### Change Font Size

Wudooh allows the user to change the size of the font from 100% (no change) to 
200% larger. This will increase the scale of the fonts meaning the ratios between sizes
will remain the same.

### Change Line Height

Wudooh allows the user to change the line height of Arabic text from 100% (no change) to 
200% larger. This goes well with the font size increase as the Arabic script contains many
elements that go above and below the centre of the line.

### Whitelist

Wudooh allows the user to whitelist domains from being clarified. This will make Wudooh ignore
any page on that domain. This is useful for websites that render text differently such as 
Quran.com or websites with already clear Arabic text.

Quran.com whitelisted:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Whitelisted.PNG)

### Live Updates

All Arabic script text will be updated by Wudooh, including newly loaded dynamic text such as 
from YouTube comments and other social media websites. Make Arabic Text Clear (Again?)!

Almost all option changes trigger live updates, this includes font change, font size 
change and line height change. This means that as the user updates those options all Arabic text
in all tabs will update to match those new settings. It is still recommended to refresh the page 
however, as some empty spacing may be different.

YouTube comments clarified by Wudooh, using Noto Sans Arabic font:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/YoutubeComments.gif)

### Safe Editables

Wudooh will ignore any text in editable fields such as text areas, search boxes and others. 
This was a major problem in Huruf that has been solved in Wudooh.

Wudooh safely ignores editable fields:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Editables.PNG)

## Future Features

* Allow for custom settings for each site
* Export and import settings (including whitelist) to be used across browsers

## Known Issues

### Quran.com

[quran.com](https://quran.com/) uses different character encodings than usual, to fix this,
 whitelist quran.com or turn off Wudooh while using quran.com.
 
Quran.com with Wudooh:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Quran.PNG)

Quran.com whitelisted:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Whitelisted.PNG)
 
### YouTube

YouTube causes a few problems with this extension, but a simple page refresh will solve all of them.

Generally speaking, going from a page with updated Arabic text to another page will cause some problems.
A page refresh will always fix this issue.

Initial page in Arabic:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Youtube1.PNG)

After visiting another playlist that contains no Arabic:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Youtube2.PNG)

After playing Arabic videos after another, the text circled in red is the correct title of the video,
note it is not clarified, the clarified text on the right is from the previous video:

![](https://github.com/basshelal/Wudooh/blob/master/pictures/Youtube3.PNG)

All of these problems can be fixed by a page refresh.

## Contributing

This project is fully open source and I am accepting pull requests, especially those that fix issues.
The code is well documented and commented and should be easy to understand for a beginner.

All code must be in TypeScript, strongly typed and well documented, commented and structured.
My general rule of thumb is to be verbose to give as much detail as possible 
(good names, allows show types, comment and document the code). Ambiguity causes bugs.

You are also welcome to fork this and use the same code to modify any other scripts such as 
[CJK](https://en.wikipedia.org/wiki/CJK_characters).
Few modifications would need to be made, only the `arabicRegEx` `const` in 
[`main.ts`](https://github.com/basshelal/Wudooh/blob/master/main.ts)
 would need to change within the TypeScript code (don't forget to compile to JavaScript). 
[`popup.html`](https://github.com/basshelal/Wudooh/blob/master/chrome/popup.html), 
[`styles.css`](https://github.com/basshelal/Wudooh/blob/master/chrome/styles.css) and 
[`fonts.css`](https://github.com/basshelal/Wudooh/blob/master/chrome/fonts.css) would need to be modified 
to accommodate different fonts and a different UI feel, but generally speaking, few modifications would need
to be made, especially to the TypeScript code.
You are free to do this and publish it [(Wudooh is MIT licensed)](https://github.com/basshelal/Wudooh/blob/master/LICENSE) 
but credit to Wudooh would be greatly appreciated.

I personally recommend [JetBrains WebStorm](https://www.jetbrains.com/webstorm/) or [VSCode](https://code.visualstudio.com).

## All Fonts

The list of all fonts in Wudooh can be found [here](https://basshelal.github.io/Wudooh/fonts).

All fonts used by Wudooh are open source but belong to their respective owners. I own none of these fonts.

## Thanks

Special thanks to [Jackson Petty](https://github.com/jopetty) for providing the general structure
and initial code from [Huruf](https://github.com/jopetty/Huruf).
