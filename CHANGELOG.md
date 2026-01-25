CHANGELOG.md

Guitar Architect — Product & Engineering Change Log
Maintained by: DPDDA-tech
Standard: Keep a Changelog (adapted)
Baseline Reference: v1.0.0-login-first-stable

[Unreleased]
Planned

Multi-string instrument support (7–8 string guitars, 4–5 string bass)

Global transposition engine (±12 semitones, tonal/absolute modes)

Automatic diatonic harmonic field generator

Harmonic progression timeline (composition mode)

[1.0.0] — 2026-01-25

Tag: v1.0.0-login-first-stable
Status: Production Baseline — Frozen Core

Added

Login-first user experience with local-only identity

SVG-based interactive fretboard rendering engine

Scale visualization system (chromatic and diatonic)

Triads and tetrads by degree

Harmonic layering system (notes, intervals, fingering, dots)

Left-handed mode

Custom tuning support

Multi-diagram workspace (up to 12 diagrams)

LocalStorage-based project persistence

Internationalization (Portuguese default, English supported)

SEO baseline (title, meta description, favicon, PWA manifest)

Branding system (Modern Maestro visual identity)

Architecture

React + TypeScript frontend

Vite build system

Tailwind CSS styling

Client-side routing (SPA)

No backend services

No external data dependencies

UX Invariants

Login screen is the mandatory first user experience

Portuguese is the default language

Storage disclaimer visible to users

Dark, professional, composer-grade interface theme

Security / Privacy

All user data stored locally in the browser

No server communication for authentication or persistence

No third-party tracking

Known Limitations

Fixed 6-string guitar model

No global transposition system

No harmonic field automation

No progression timeline

Versioning Notes
Semantic Strategy

Major (2.0+) — Architectural or product paradigm shifts

Minor (1.x) — Feature expansion within the same architecture

Patch (1.0.x) — Stability, bug fixes, and non-breaking improvements

Governance

All entries must:

Reference a Git tag or release commit

Align with BASELINE.md

Respect AI_POLICY.md

Reflect roadmap direction in ROADMAP.md

Contribution Rules

No change enters the log without a corresponding commit or tag

Features must list user-facing impact

Architectural changes must list regression risk

Product Identity Statement

Guitar Architect evolves as a musical architecture platform, not as a conventional music app.
Every change must preserve its role as a professional harmonic design environment.