AI_POLICY.md

Guitar Architect — Baseline Preservation & Controlled Evolution Policy

1. Purpose

This document defines the operational constraints for any AI-assisted development on the Guitar Architect platform.
The system is classified as production-grade and behaviorally frozen.
AI must operate strictly as a maintenance and feature-extension engineer, not as a system architect.

2. Canonical Source of Truth

Repository:
https://github.com/DPDDA-tech/guitar-architect

Frozen Baseline Tag:
v1.0.0-login-first-stable

Production Reference:
https://guitararchitect.com.br

All UI, routing, architecture, and musical logic must be treated as authoritative based on this tag and the live deployment.

3. Baseline System Behavior (Immutable)

The following behaviors are locked and protected unless explicit authorization is provided by the project owner:

Application Flow

The application loads directly into a login-first interface

After login, users are routed into the Fretboard Editor

Default language is Portuguese (pt-BR)

Language switching is optional and user-controlled

Data Model

Storage is 100% local (browser-based)

No backend services

No authentication servers

No cloud persistence

No cross-device synchronization

Architecture

React + Vite frontend

Client-side rendering only (no SSR)

No framework migrations

No folder restructuring

No dependency substitutions

Musical Engine

The following subsystems are considered core musical logic and protected from refactoring:

Harmonic logic engine

Fretboard rendering system

Interval and scale computation

Chord and degree mapping

Diagram layering and visualization system

4. AI Operational Rules
Forbidden Actions

AI MUST NOT:

Refactor system architecture

Rewrite entire files

Introduce new frameworks or major libraries

Change routing or initialization logic

Modify login flow behavior

Redesign UI/UX

Rename or move files and folders

Alter branding, naming, or version signature

Allowed Actions

AI MAY:

Add incremental features only

Use minimal, isolated diffs

Modify only files directly related to the requested feature

Preserve coding conventions and file structure

Maintain backward compatibility

5. Authorized Feature Scope

AI is authorized to propose or implement only the following feature categories:

Multi-String Instrument Support

Guitars with more than 6 strings

Bass instruments (4 and 5 strings)

Global Transposition Engine

Non-destructive harmonic shifting

Preserves visual, theoretical, and degree relationships

Automatic Harmonic Field Generation

Scale-based chord field visualization

Degree-aware harmonic mapping

Harmonic Progression Timeline

Step-based progression modeling

Editor-linked harmonic flow visualization

6. Change Proposal Format (Mandatory)

All AI-generated technical output must follow this structure:

Affected Files

List only files that will be modified.

Patch Format

Provide diff-style code blocks only

Do NOT provide full file rewrites

Rationale

Explain the purpose of each change

Reference baseline compatibility and preservation

7. Identity & Branding Protection

The following elements are brand-locked:

Product name: Guitar Architect

Login-first experience

Dark modern UI theme

Professional composer-grade interface tone

Branding footer and version signature

8. Compliance Clause

If a request conflicts with this policy, AI must respond with:

"This request violates the Guitar Architect AI Policy. Please specify an authorized change scope."

9. Status

System Classification:
Production System — Controlled Evolution Mode

Maintained by:
DPDDA-tech
Guitar Architect Engineering