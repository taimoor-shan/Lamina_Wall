# Project Instructions — LAMINA Wall Panel Showroom

You are working across multiple, separate sessions on this project. You will not remember previous sessions' conversations. **The source of truth for "what's done" and "what's next" is `LAMINA-PRD.md` in this repo root, not your memory.** Read it fully before writing any code, every session.

## Start of every session, in this order

1. Read `LAMINA-PRD.md` §0 ("Status at a Glance") to see which milestones are done, in progress, or blocked.
2. Read §10 ("Session Log") to see what previous sessions actually did and decided — this often has context that isn't in the checkboxes themselves (why a decision was made, what a client said, what didn't work).
3. Find the first milestone in §5 that isn't fully checked off. That's your starting point, unless the person you're working with tells you otherwise this session.
4. If a milestone is marked `Blocked` in §0, read the note before doing anything else — don't restart blocked work without addressing the blocker.

## While working

- **Work milestone by milestone, in order.** Don't skip ahead to a later milestone's tasks because they seem easy or related, even if you have spare context budget — the PRD's acceptance criteria exist specifically so milestones don't get marked done prematurely.
- **Check off checkboxes in `LAMINA-PRD.md` as you complete each task**, not in a batch at the end of the session. If the session ends unexpectedly, the file should still reflect real progress.
- **Update the §0 status table** the moment a milestone's acceptance criteria are all checked (`☑ Done`), or the moment you start one (`☐ In progress`).
- **Do not mark a milestone's acceptance criteria as done without actually verifying them.** "I wrote the code that should do this" is not the same as "I ran it and confirmed it." If you can't verify something (e.g. you don't have a live Resend account to test email delivery), leave that box unchecked and say so explicitly in the session log rather than checking it optimistically.

## Hard constraints — do not deviate from these without asking

These are decisions that were made deliberately, sometimes after a prior AI reviewer suggested changing them and the client explicitly rejected the suggestion. Do not "helpfully" revisit them on your own initiative:

- **No ecommerce language, ever.** No "cart," no "checkout," no "buy," no prices anywhere in the UI. This is a request/spec system, not a store. See PRD §4.
- **The homepage layout stays as the approved stacked, full-bleed collection-spread design.** Do not restructure it into tabs, filters, or a "material explorer" pattern on your own judgment — see PRD §5 M3 and §6 for why this was explicitly locked.
- **Stack is fixed:** Astro + TypeScript + plain CSS + Astro Content Collections (no CMS) + a single Svelte island for the request tray + Cloudflare Workers (not Pages). If something about this stack seems wrong or outdated by the time you're implementing, say so and ask — don't silently substitute a different stack or add a CMS.
- **No product/article number ever displays a price.**
- **Secrets never go in the frontend bundle or get committed to the repo.** See PRD §2.2 for exactly which variables are public vs. secret.

## When you're unsure

- If the PRD is ambiguous or silent on something you need to decide, make the smallest reasonable decision, implement it, and **log the decision and your reasoning in §10 (Session Log)** so it's visible to the next session and to the client — don't just decide silently.
- If a milestone's acceptance criteria can't be verified without something you don't have access to (a live domain, a real Resend account, a client answer from PRD §7), don't guess or fake it. Leave it unchecked, log it as blocked, and say so plainly to whoever is running the session.
- If you think a locked decision (see "Hard constraints" above) is actually wrong, say so and explain why — but don't unilaterally change it. Flag it for the human to decide.

## End of every session

Before ending, append a new entry to §10 (Session Log) in `LAMINA-PRD.md`, even if very little was completed. Use the template already in that section. This is not optional busywork — it's the only thing that lets the next session (which will have zero memory of this one) pick up correctly.

## Reference files

- `LAMINA-PRD.md` — the full spec, milestones, and acceptance criteria. Primary source of truth.
- `/reference/lamina-design-direction.html` — the client-approved visual/design-direction mockup. Every visual acceptance criterion in the PRD means "matches this file," not "looks nice by the agent's own judgment."
