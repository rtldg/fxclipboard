# fxclipboard

Rewrite things in your clipboard, like domains, maybe with regex

https://addons.mozilla.org/en-US/firefox/addon/fxclipboard/

Links copied from x.com / twitter.com also lose their share tracking params (`s`, `t`, `a`, `ref_src`, `ref_url`). A numeric `t` stays, since that's a video timestamp.

## Orion (macOS / iOS)

WebKit doesn't let extensions read the clipboard in the background, so in Orion only copies made inside a web page get rewritten:
- "Copy link" buttons like the one in x.com's share menu
- Cmd+C / the Copy menu on selected text

Copying from the address bar, or "Copy Link" in a link's long-press/right-click menu, happens outside the page and stays as it is.

the beautiful options page:
![options_page](https://github.com/user-attachments/assets/7cfd2ca9-f0e9-4742-97b3-a648f263527d)
