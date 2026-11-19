# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/liaw0/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/liaw0/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

[Bounty: Build the best GTA 6 trophy guide](https://make.fun/c/gta6-trophy-guide-01) · [make.fun](https://make.fun/?ref=ajkq5baq)

**Leonida Trophy Guide** — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade as PlayStation publishes them, a guide in our own words that cites its sources, a roadmap to the platinum, and a checklist that saves in your browser.

## What it does

- **Checklist** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online). Tick one off and it stays ticked (localStorage). Per-trophy notes, too.
- **Guides with sources** — every trophy has a guide written for this app, with its sources named and linked (Exophase and PSNProfiles for the official list and PSN targets, PowerPyx and GTA Zone for the how-to). Five trophies whose triggers are still unconfirmed at launch say so plainly instead of guessing.
- **Filters** — by grade, by kind (story, side characters, activities, collectibles, crime, exploration, money, 100% completion), by text search, hide earned, missable only.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until you earn them.
- **Roadmap to the platinum** — three steps (story 60–80 h, 100% checklist ~100 h, cleanup ~10 h) with per-step progress and the warnings that matter (cheats disable trophies, no mission replay, save at every chapter).
- **Missables** — only one trophy can possibly be missed (Positive Mental Attitude, the Chapter 1 meditation), and even that is unconfirmed; the page explains why everything else is safe.
- **Export / import** — download your progress as JSON and import it back; reset starts clean.
- **Fully offline** — static files under `app/`, no network request at run time. Add `?demo=1` to the address to preview it with 13 trophies already ticked.

## Run

```sh
node serve.ts
```

Then open http://localhost:8080 (add `?demo=1` for the demo progress).

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `out/dossier.json` with the vendored make.fun library.

## Verification

The trophy list was verified on 2026-11-19 against the live lists on Exophase and PSNProfiles (all 55 names, descriptions and grades agree; PSN progress targets from PSNProfiles; the hidden set of 28 from GTA Zone). No name, description or grade in the kit's starter list needed correcting. The guides draw on PowerPyx's GTA 6 Trophy Guide & Roadmap and GTA Zone's trophy list, cited per trophy, in this app's own words.

## License

MIT — see [LICENSE](LICENSE).
