# Echlon AI

**A software company that runs itself.**

Live site: **https://echlonai.echlonlabs.com/**

Describe an outcome in one sentence. A CTO agent turns it into a plan you approve, a Dev Group Manager delegates it to specialist engineers, every result is reviewed against its acceptance criteria, and lint and tests decide whether it ships. You watch it happen as a live transcript — or as a 3D office where each agent is a person walking to a colleague's desk.

## Why it exists

A sixteen-person org covering product, engineering, QA, security, DevOps, docs and go-to-market costs **$1.8M–$2.2M a year in base salary alone**, and a small feature still waits days for a free developer.

Coding assistants help one person type faster. They don't plan work, split it, review it, or refuse to ship something broken. Echlon is an organisation rather than an assistant:

- **Sixteen roles** with real reporting lines, tool permissions and job charters. The CTO plans and never writes code; the Dev Group Manager delegates and reviews but authors nothing.
- **Nothing ships on trust.** Every task carries acceptance criteria, work is reviewed against them and sent back when it falls short, then `npm run lint` and `npm test` run for real — an empty or broken result fails.
- **You hold the gate.** No code is written until you approve the plan; spend is capped per phase and per run, and one button stops the whole company mid-task.
- **Every decision is auditable** — an append-only log of every message, delegation and review verdict, browsable per employee.

A three-task feature that would take a human team roughly two-and-a-half person-days completes in minutes for a few dollars, metered live.

## About this repository

This repo contains **only the public showcase page**. It is generated: a workflow in the private source repository publishes `docs/site/` here whenever that directory changes, and GitHub Pages serves it from the default branch. No application source, configuration, credentials or run data is published.

Do not edit these files by hand — they are overwritten on the next publish.

The engine itself runs on the operator's own machine: it writes files and executes commands, so there is no hosted multi-tenant version. The **Log in** button on the site asks for the address of your own running instance.
