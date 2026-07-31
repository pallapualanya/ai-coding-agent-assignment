# AI Coding Agent — Note Organization & Search

## Overview

This project implements a small AI coding agent that reads an existing codebase, understands it, and implements a product requirement with minimal guidance.

**Target repository:** [node-easy-notes-app](https://github.com/callicoder/node-easy-notes-app)
**Request given to the agent:** "Improve the application so users can better organise and search their notes."

The agent decided on an implementation and added **tags to notes**, along with a **search-by-tag API endpoint**, to let users organize and find their notes more easily.

## Architecture

The agent is a single Python script (agent.py) with four components:

1. **Repository Explorer** (explore_repo) — walks the repository and reads all relevant source files (.js, .ejs, .html, .css), skipping node_modules and large generated files like package-lock.json.
2. **Prompt Builder** (build_prompt) — combines the user's request with the full contents of the explored files into a single structured prompt for the LLM.
3. **LLM Client** (get_agent_response) — sends the prompt to an LLM (Llama 3.3 70B via the Groq API) and receives back a plan, a list of file changes, and a summary.
4. **Change Applier** (apply_changes) — parses the LLM's response using a strict ===FILE: path=== ... ===END FILE=== delimiter format and writes the new file contents directly back into the repository.

User Request -> Explore Repo -> Build Prompt -> Call LLM -> Parse Response -> Apply Changes -> Summary

## Agent Workflow

1. Agent receives the fixed user request (no further guidance provided, per assignment rules).
2. It scans the target repository and loads all source files into memory.
3. It builds one large prompt containing: the request, the full contents of every relevant file, and strict formatting instructions for how the LLM should structure its response.
4. The LLM returns: a short execution plan, the list of files it decided to change, the full new content of each changed file, and a summary of the change.
5. The agent parses this response and overwrites only the changed files on disk — all other files are left untouched, preserving existing functionality.
6. The full LLM response is also saved to agent_log.txt for traceability.

## How the Repository Is Explored

The agent does not use any static analysis or dependency graph — it takes a simple, LLM-driven approach: it reads every source file in the repository (excluding node_modules and lockfiles) and lets the LLM itself determine which files are relevant to the request, based on their content. This keeps the agent simple and general-purpose, at the cost of higher token usage on larger repositories.

## What the Agent Changed

- **app/models/note.model.js** — added a tags array field to the Note schema.
- **app/controllers/note.controller.js** — updated create and update to accept tags, and added a new searchByTag controller.
- **app/routes/note.routes.js** — added a new route, GET /notes/tag/:tag, to search notes by tag.

## Assumptions & Trade-offs

- **LLM provider:** The assignment allows any LLM/tooling. I used Groq's Llama 3.3 70B (via a free API key) instead of a paid provider like OpenAI or Anthropic, since a free-tier option was needed. This is a capable open model, though a proprietary model like Claude or GPT-4 may produce marginally more robust code in more complex repos.
- **Single-pass generation:** The agent sends the whole repository in one prompt and asks for a one-shot response, rather than using an iterative agent loop (e.g., explore, propose, run tests, revise). This was a deliberate simplicity trade-off given the small size of the target repo; it would not scale well to a large codebase, where a more incremental, tool-using agent would be needed.
- **No automated test execution:** The agent does not run the app's test suite or verify runtime behavior automatically — changes are validated by static code review rather than execution feedback.
- **Database driver compatibility:** The target repository uses an older Mongoose/MongoDB driver (built ~2016) that relies on the legacy OP_QUERY wire protocol, which was removed in MongoDB 5.1+. As a result, the app cannot run end-to-end against a modern local MongoDB installation without also upgrading the Mongoose dependency — this is a pre-existing limitation of the target repository, unrelated to the agent's own changes. The agent's code changes were verified through direct code review for correctness rather than a live run.

## How to Run

pip install groq
set GROQ_API_KEY=your_key_here
python agent.py

