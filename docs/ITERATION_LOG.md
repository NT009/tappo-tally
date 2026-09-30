# Implementation & Iteration Log

This document tracks mistakes, structural changes, and bug fixes made **during and after the implementation phase** of the application. 

By recording these changes, we ensure consistent alignment and prevent repeating past mistakes in future features.

---

## Iteration 1: Debounced Request Batching
**Date:** 2026-09-28

### 1. Dashboard Mutation Overload
- **Mistake:** The initial implementation locked the UI button and fired a separate API request for every single tap on a tally box. This created unnecessary friction and could overload the server if a user tapped rapidly.
- **Fix:** Implemented a **Debounced Request Batching** pattern on the frontend. The UI now updates instantly and accumulates pending increments locally. A debounced timer (700ms) waits until the user finishes tapping, then sends a single API request with the total batch amount. A small pulsing `CloudUpload` icon in the corner indicates when a background sync is actively occurring.
