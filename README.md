# Wudooh (وضوح)
![Wudooh Icon](https://github.com/basshelal/Wudooh/blob/master/assets/icon128c.png)

Wudooh (clarity in Arabic and Persian) is a simple chrome extension 
that makes reading Arabic text clearer and easier.

Note that this project is still a work in progress.

This project is based on [Jackson Petty's](https://github.com/jopetty) 
[Huruf](https://github.com/jopetty/Huruf).

Before:
![Before](https://github.com/basshelal/Wudooh/blob/master/pictures/Before.PNG)

After:
![After](https://github.com/basshelal/Wudooh/blob/master/pictures/After.PNG)

## Current Features
Wudooh will find any Arabic script text and update it to be in the more readable
Droid Arabic Naskh font.

This is not just for Arabic, but for any Arabic script, meaning this can work 
for Persian, Urdu and any other 
[Arabic script language](https://en.wikipedia.org/wiki/Arabic_script).

It will also update the text's size and line height to the user's choice ranging 
from 100% to 200% larger.

Wudooh will do this constantly onto any Arabic text, meaning newly loaded content
with Arabic text will still update.

## Future Features
* Live text updates as options are updated
* Whitelist or exempt websites
* More font options

## Known Issues

### Quran.com

[quran.com](https://quran.com/) uses different character encodings than usual, to fix this,
 turn off Wudooh while using quran.com.
 
With Wudooh:
![With](https://github.com/basshelal/Wudooh/blob/master/pictures/QuranWith.PNG)

Without Wudooh:
![Without](https://github.com/basshelal/Wudooh/blob/master/pictures/QuranWithout.PNG)
 
### YouTube

YouTube causes a few problems with this extension, but a simple page refresh will solve all of them.

Generally speaking, going from a page with updated Arabic text to another page will cause some problems.
A page refresh will always fix this issue.

### Pre-filled Input Fields

Wudooh will erase any Arabic text in pre-filled input fields,
this includes even your own input fields if you leave the page for a long time.

This is a problem I am actively working on fixing. 
Until then however, it is advised to turn off Wudooh while using Arabic text in input fields.