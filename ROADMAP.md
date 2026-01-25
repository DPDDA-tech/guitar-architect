ROADMAP.md

Guitar Architect — Product & Technical Evolution Plan
Maintained by: DPDDA-tech
Baseline Reference: v1.0.0-login-first-stable
Status: Active — Controlled Growth

1. Product Vision

Guitar Architect is positioned as a professional-grade harmonic design environment for guitarists, composers, educators, and theorists.

The platform is not a “practice tool.”
It is a musical architecture system for:

Harmonic modeling

Structural visualization

Theoretical exploration

Composition planning

2. Core Design Principles

All future development must preserve:

Login-first workflow

Local-only data model

Visual-first music theory

Non-destructive editing

Professional studio aesthetic

Zero-friction performance

3. Versioning Strategy
Version	Tier	Goal
1.0.x	Stability	Lock UX, engine integrity, branding
1.1.x	Expansion	Extend instrument and harmonic scope
1.2.x	Intelligence	Introduce theoretical automation
2.0	Composer Suite	Full harmonic architecture system
4. Release Track — v1.1 (Instrument & Harmonic Expansion)
4.1 Multi-String Instrument Engine

Status: Approved
Priority: High

Scope

Support for:

7-string guitar

8-string guitar

4-string bass

5-string bass

Technical Requirements

Dynamic string array generator

Adaptive tuning matrix

Fretboard SVG scaling logic

Note mapping abstraction layer

UX Rules

Instrument selector panel

Preset tunings per instrument type

Visual layout remains consistent across formats

4.2 Global Transposition System

Status: Approved
Priority: High

Scope

Shift all harmonic data by chromatic offset

Applies to:

Scales

Chords

Intervals

Diagrams

Fingering layers

Technical Requirements

Central transposition engine

Non-destructive state transformation

Reversible operations

Visual feedback layer (key shift indicator)

UX Rules

Must feel “musical,” not “technical”

Control uses musical language (Key, Interval, Semitone)

One-click reset to original state

5. Release Track — v1.2 (Theoretical Intelligence Layer)
5.1 Harmonic Field Generator

Priority: High

Scope

Auto-generate:

Diatonic triads

Diatonic tetrads

Functional harmony labels (T, SD, D)

Output

Visual chord field map

Degree-based navigation

One-click chord injection into fretboard

5.2 Progression Timeline

Priority: Medium

Scope

Horizontal harmonic timeline

Chord blocks in sequence

Playback visualization (non-audio)

Structural composition planning

UX Goal

Make Guitar Architect usable as a songwriting and composition sketchpad, not only a theory tool.

6. Release Track — v2.0 (Composer Suite)
6.1 Harmonic Projects System

Named harmonic compositions

Multi-section structure

Thematic variation mapping

6.2 Visual Export Engine

Print-ready harmonic sheets

Teaching diagrams

Composition blueprints

6.3 Theory-to-Performance Bridge

Fingering path optimization

Position shift suggestions

Playability scoring

7. Non-Goals (Explicitly Forbidden)

The following will NOT be pursued:

User accounts

Cloud sync

Subscription model

Social sharing

Audio playback

DAW integration

Mobile-first redesign

Guitar Architect remains a pure harmonic architecture platform.

8. Technical Evolution Rules

All development must:

Preserve file structure

Avoid framework changes

Maintain local-first storage

Be diff-based (no rewrites)

Keep SVG as the rendering core

9. UX Maturity Model
Stage	Description
Tool	Diagram generator
System	Harmonic workspace
Studio	Composition environment
Suite	Musical architecture platform

Target state: Suite

10. Success Metrics
Product

Faster harmonic prototyping

Reduced theory-to-diagram time

Increased diagram density per session

Technical

Sub-200ms UI response

Zero backend dependency

Stable browser persistence

11. Governance

All roadmap changes must:

Reference BASELINE.md

Declare regression risk

Define rollback path

Preserve login-first UX

12. Product Identity Statement

Guitar Architect is not a guitar app.
It is a harmonic construction environment where music is designed before it is played.