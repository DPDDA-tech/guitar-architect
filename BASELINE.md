BASELINE.md

Guitar Architect — Technical Baseline & UX Lock Specification
Version: v1.0.0-login-first-stable
Status: Frozen — Production Reference
Maintained by: DPDDA-tech

1. Purpose

This document defines the canonical technical and user-experience baseline for the Guitar Architect platform.
It establishes the system’s frozen state, against which all future changes must be validated.

This baseline ensures:

Behavioral stability

UX consistency

Musical engine integrity

Safe, incremental evolution

2. Canonical References

Repository:
https://github.com/DPDDA-tech/guitar-architect

Baseline Tag:
v1.0.0-login-first-stable

Production Deployment:
https://guitararchitect.com.br

All behavior, UI flow, and system architecture are considered authoritative based on this version.

3. System Architecture Snapshot
Frontend Stack

React (Client-Side Rendering)

Vite Build System

TypeScript

Tailwind CSS (utility-based styling)

Execution Model

Fully client-side

No server-side rendering

No backend services

No APIs required for core operation

Persistence Model

Browser-based storage only (LocalStorage / IndexedDB)

No remote persistence

No authentication server

No user accounts stored externally

4. Official First User Experience (UX Invariant)
Login-First Interface (Locked Behavior)

This is the mandatory first screen for all users.

Visual Identity

Centered card layout

Dark modern theme

Guitar Architect branding

Version signature displayed at footer

Professional, “composer-grade” interface tone

Functional Role

User identification is local-only

No authentication validation against a server

User name/email is used strictly for:

Project labeling

Local session continuity

UX personalization

UX Messaging (Invariant)

The following concepts must always be preserved:

Projects are stored locally

Data never leaves the browser

Clearing site data will erase projects

No cross-device sync exists

5. Application Flow (Locked)
[Load App]
   ↓
[Login Screen]
   ↓
[Main Fretboard Editor]
   ↓
[Project Creation / Editing / Visualization]

Routing Rules

Root route (/) must resolve to login-first or direct editor only if a local user session exists

Invalid routes must redirect to root

No marketing or landing page is allowed before the login screen

6. Musical Engine Baseline

The following systems are considered core and protected:

Harmonic Logic

Chromatic scale model

Interval mapping

Scale generation

Degree-based harmonic functions

Visualization Engine

SVG-based fretboard rendering

Layered diagram system

Marker, line, and fingering overlays

Tonic highlighting

Label modes (notes, intervals, fingers, dots)

Composition Features

Triads and tetrads by degree

Mode visualization

Left-handed mode

Custom tunings

Multi-diagram layout system

7. Internationalization Baseline
Default Language

Portuguese (pt-BR)

Supported Languages

Portuguese

English

Rules

Language switching is user-controlled

No automatic browser-language override

All UI text must be sourced from i18n.ts

8. Branding & Identity Lock

The following elements must not be altered without explicit approval:

Product name: Guitar Architect

Dark professional UI theme

Login-first experience

Footer version signature

Visual tone: Modern Maestro (technical + artistic hybrid)

9. Regression Protection Checklist

Any new version must pass the following checks:

UX

 Login screen loads first

 Storage disclaimer is visible

 Version signature is displayed

 Portuguese loads by default

System

 Editor loads after login

 Projects persist locally

 No network requests for storage or auth

 Routing redirects invalid paths to root

Musical Engine

 Scales render correctly

 Intervals map properly

 Chords display by degree

 Tonic highlight works

 Layer visibility toggles correctly

10. Authorized Evolution Scope

Only the following feature tracks are approved for development beyond this baseline:

Extended Instrument Support

7, 8+ string guitars

4 and 5 string bass

Global Transposition Engine

Non-destructive harmonic shifting

Preserves theoretical relationships

Harmonic Field Generator

Scale-based chord field visualization

Progression Timeline System

Harmonic sequence modeling

11. Change Control Policy
Rules

All changes must:

Be incremental

Preserve folder structure

Avoid file rewrites

Use diff-based patches

Maintain backward compatibility

Forbidden

Framework migration

Backend introduction

Cloud sync

UI redesign

Branding changes

Architectural refactors

12. System Classification

Product Tier:
Production-Grade Creative Platform

Mode:
Frozen Core — Controlled Evolution

Audit Status:
Baseline Locked
UX and Musical Engine Protected