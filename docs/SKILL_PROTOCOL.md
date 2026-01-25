# Skill Protocol Manual

> **Status:** Active
> **Context:** This document provides a self-contained guide for Agents to understand, select, and execute specific "Skills" (methodologies) stored within the `skills/` directory.

## 0. Automatic Injection (Jules)

**System Note:** If you are reading this via `scripts/inject_skills.py`, you have successfully initiated the Bootstrap Sequence.

- **Action:** Internalize the skills below.
- **Next Step:** Return to the user and declare readiness.

## 1. The Skill System Philosophy

This repository is equipped with a library of **Skills**. A Skill is a formalized, repeatable process for completing complex engineering tasks. Instead of guessing how to approach a problem, you must first check if a relevant Skill exists and follow its protocol.

**Why use Skills?**

- **Consistency:** Ensures every task is executed with the same rigor.
- **Reliability:** Prevents common errors (e.g., skipping tests, forgetting reviews).
- **Autonomy:** Provides you with the specific prompts and steps needed to drive sub-agents or managing your own workflow.

## 2. Directory Structure

All skills are located in `skills/`. Each subdirectory represents a distinct skill.

```text
skills/
├── brainstorming/                  # Techniques for generating ideas
├── executing-plans/                # Standard execution loop
├── subagent-driven-development/    # High-reliability implementation w/ sub-agents
├── systematic-debugging/           # Scientific method for bug fixing
├── test-driven-development/        # TDD workflow
├── writing-plans/                  # How to structure implementation plans
... and others
```

Inside each skill folder, you will typically find:

- **`SKILL.md`**: The master protocol. **Read this first.** It contains the decision trees, flowcharts, and step-by-step instructions.
- **`*-prompt.md`**: Specialized system prompts to be used when dispatching sub-agents or switching contexts.

## 3. How to Select a Skill

Before starting a task, ask: **"What kind of work am I doing?"**

| Scenario                                                         | Recommended Skill                       |
| :--------------------------------------------------------------- | :-------------------------------------- |
| I have a complex feature request and need a plan.                | `skills/writing-plans`                  |
| I have a plan and need to implement it reliably in this session. | `skills/subagent-driven-development`    |
| I have a bug report but don't know the cause.                    | `skills/systematic-debugging`           |
| I need to write code and want to ensure correctness.             | `skills/test-driven-development`        |
| I am stuck or need creative solutions.                           | `skills/brainstorming`                  |
| I am finished with the code and need to verify before PR.        | `skills/verification-before-completion` |

## 4. Execution Protocol

Once a skill is selected:

1.  **Read the Manual**: Open `skills/<skill-name>/SKILL.md`.
2.  **Internalize the Flow**: Look for the "Process" or "Workflow" section. Understand the sequence of steps.
3.  **Follow the Steps**:
    - If the skill requires creating a plan, create it.
    - If the skill requires dispatching sub-agents, use the provided `*-prompt.md` templates.
    - If the skill requires a review loop, **do not skip it**.
4.  **Completion**: When the skill's criteria for "Done" are met, you may proceed to the next phase (often `finishing-a-development-branch`).

## 5. Key Skills Overview

### A. Subagent-Driven Development (`skills/subagent-driven-development`)

**Use when:** You have a clear plan and want to implement it with maximum quality.
**Core Loop:**

1.  **Implementer**: Writes code and tests.
2.  **Spec Reviewer**: Verifies requirements are met.
3.  **Quality Reviewer**: Verifies code health.
    **Rule:** You cannot merge or mark "done" until _both_ reviewers approve.

### B. Systematic Debugging (`skills/systematic-debugging`)

**Use when:** You encounter an error.
**Core Loop:**

1.  **Reproduce**: Create a minimal reproduction case.
2.  **Hypothesize**: List potential causes.
3.  **Test**: Verify hypotheses one by one.
    **Rule:** Do not change code "randomly" hoping it works. Prove the failure, then prove the fix.

### C. Test-Driven Development (`skills/test-driven-development`)

**Use when:** Writing any logic.
**Core Loop:** Red (Fail) -> Green (Pass) -> Refactor.
**Rule:** No production code without a failing test first.

## 6. Self-Correction

If you find yourself:

- "Just trying things" -> Stop. Use `systematic-debugging`.
- Writing a massive file without checks -> Stop. Use `subagent-driven-development` or `test-driven-development`.
- Confused about the goal -> Stop. Use `writing-plans` or `brainstorming`.

## 7. Protocol for Jules

**Identity Check:**
If you are identified as **Jules** (the system user/agent):

1.  Your `AGENTS.md` directive supersedes all else.
2.  You are the **Principal Engineer**. You do not ask for permission to use skills; you use them to ensure excellence.
3.  **Bootstrap:** You MUST run `python3 scripts/inject_skills.py` to unlock your session.

**You are a skilled engineer. Use your tools.**
