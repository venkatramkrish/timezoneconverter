# Timeband

A one-page time zone converter for people who schedule meetings across continents from their phone.

Pick a time. See it in every city that matters. Send it to Outlook.

---

## Why I built it

I run a business with customers across the US and Europe. Meeting times get proposed in chat and email all day: *"Does Thursday 10am ET work?"* Answering that from my phone was consistently harder than it should be.

**The time zone picker in Outlook mobile doesn't match the one on the web.** On the web I get *Eastern Time (US & Canada)* — one clear option. On mobile I get *Eastern Standard Time* and *Eastern Daylight Time* as separate entries, and I have to know which one applies on that particular date. In August it's daylight time. In December it's standard time. Getting it wrong puts the meeting an hour off.

**Neither version lets me search by city.** I think in cities — New York, Milan, Singapore. The dropdown thinks in zone names, and there's no search box on the web version at all.

**Outlook desktop can show multiple time zones side by side. Mobile can't.** On my laptop I can see immediately that 10am Eastern is 7:30pm at home. On my phone there's no such view, so I'd end up searching Google, or waiting until I was back at my desk to answer a question that should take five seconds.

The result was a small, constant tax on scheduling: every cross-border meeting request needed a detour.

## What it does

Each city gets a 24-hour band, and all the bands share one timeline, so a single playhead runs through every one of them. Drag it and every city updates together. Keep dragging past midnight and it rolls into the next day.

Bands are shaded by what people are probably doing — dark for asleep, amber for working hours, pale for awake but off the clock. Where the amber overlaps is where a meeting is realistic. Weekends are never shaded amber.

The shading is guidance, not a rule. Nothing is blocked or greyed out: any slot on any day can be picked and scheduled, including the middle of the night. It's there to make an awkward time obvious before you propose it, not to stop you proposing it.

**Two layouts, same data.** Bands run horizontally; List runs the day vertically with a column per city. Bands answer *"where does everyone's day overlap?"*; List answers *"is 10:30 or 11:00 better?"* Toggle in the header; your choice is remembered.

- **Cities, not abbreviations.** Pick "New York", not "EST" or "EDT".
- **Daylight saving is automatic**, and correct for the date you've selected — not just today. Choose a date in November and it already knows it's EST.
- **Starts with wherever you are.** On first run it reads the device's own zone and pairs it with one counterpart — New York for most people, London if you're already in New York. Nothing is hardcoded: both rows are ordinary cities you can rename, replace or remove. Up to four at once.
- **Preset chips** cover the common zones; search covers everything else, including by abbreviation.
- **Tap any city box** to make it the one you're setting the time in. The small chevron changes which city it is.
- **A Here row appears when you travel**, tracking your device's zone. It hides itself at home, and can be dismissed if you don't want it.
- **15, 30 or 60 minute steps**, driving the slots, the dropdown and the nudge buttons together.
- **12 or 24 hour clock.**
- **Straight into Outlook.** Pick a slot, set a title, duration and attendees, and it opens a pre-filled event.
- **Works offline.** Installed to the home screen, it runs with no network at all.

## Scheduling

Four ways out of the app. All send the time in UTC or the correct local wall clock, so nothing shifts in transit.

| Route | Multi-zone note in description | Opens |
|---|---|---|
| Outlook app / desktop | no — copied to clipboard instead | Outlook directly |
| Outlook web | yes | browser, offers handoff to the app |
| Google | yes | Google Calendar |
| `.ics` | yes | share sheet, then any calendar |

The invite body lists the time in every zone, with the one you set it in first, so attendees see their own local time spelled out.

`ms-outlook://` is undocumented and has no notes field, so the app route can't carry the description — it puts the text on the clipboard on the way out instead. For meetings where that note matters, `.ics` is the better route on a phone: it lands in the Outlook app *and* keeps the description.

The **WORK / PERSONAL** toggle switches the Outlook web link between `outlook.office.com` (Microsoft 365) and `outlook.live.com` (personal accounts).

## How it works

A single HTML file with no framework, no build step and no backend, plus a service worker for offline use. Time zone maths runs through the browser's built-in IANA database — the same source the operating system uses, updated with it. That's why daylight saving stays correct without anything to maintain, and why it works on a plane.

Installed as a home-screen app it remembers your cities, layout, step size and clock format.

## Adding it to your phone

Open the URL in **Safari** — Chrome can't do this on iOS. Wait a few seconds for the "Saved for offline" note, then Share → **Add to Home Screen** → Add.

It launches full screen with no address bar, works with no connection, and remembers your cities and settings.

## Known limits

- **Four zones maximum.** Beyond that the columns are too narrow to read on a phone.
- **Working hours are assumed to be 9–6 everywhere.** This only affects the shading, never what you can book.
- **No calendar sync.** It doesn't know when you're busy.
- **The Outlook app route drops the description** (see above).

## Roadmap

**Free/busy overlay** — read my Outlook calendar and shade booked hours onto my own band, so I can see an open slot rather than proposing one and discovering the conflict later. Needs an Azure app registration and sign-in, which is a real step up in complexity, so it's parked for now.

## Licence

MIT — see [LICENSE](LICENSE). Use it, change it, ship it; no warranty.

Typefaces are loaded from Google Fonts (Bricolage Grotesque and IBM Plex Mono, both SIL Open Font License) and are not redistributed here. There are no other dependencies.

---

## Maintainer notes

*Only relevant if you're hosting your own copy. Skip this if someone gave you a link.*

### Deploying

It needs to be served over HTTPS — iOS won't add a home-screen app from a file. Any static host works; this one runs on GitHub Pages.

Upload `index.html`, `sw.js`, `manifest.webmanifest`, `apple-touch-icon.png` and `icon-512.png` to a public repo, all at the top level. Then Settings → Pages → Source **Deploy from a branch** → branch **main**, folder **/ (root)** → Save. After a couple of minutes the site is live at `https://<username>.github.io/<repo>/`.

If Pages says it's configured but nothing deploys, set the branch to **None**, save, then set it back to **main** and save again. That forces a fresh build.

### Shipping a change

Editing `index.html` isn't enough on its own — an installed copy keeps serving the cached version until the service worker is told the cache is stale. Bump the version string at the top of `sw.js`:

```js
var CACHE = "timeband-v30";
```

Commit both files; GitHub Pages redeploys automatically. On the phone, close the app fully from the app switcher and reopen it twice: the first launch fetches the new version in the background, the second runs it.
