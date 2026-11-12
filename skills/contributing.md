# Contributing

Welcome! Contributions are how this project grows, and we want to review and merge
your code as quickly as possible.
To make that happen smoothly, we've set up a few pragmatic guidelines.
They exist to save _your_ time and keep review cycles fast.

## How to Contribute Successfully

1. **Let's align first (Issues before PRs):** Except for critical hotfixes, please make sure there is an open issue before you start writing code.
   We want to agree on the approach early so you don't spend time building something that conflicts with the project's direction.

2. **Keep PRs small and focused:** We optimize for flow and fast feedback.
   Massive PRs are difficult to review and tend to sit in the queue longer.
   Aim for incremental, logical changes (ideally under 400 lines of code).
   If a feature is large, split it into smaller, easily digestible PRs.

3. **Conventional Commits:** Please format your PR title using the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat: add database connection pool`, `fix: resolve memory leak`, `docs: update setup guide`).
   This makes the history easy to read and lets changelogs and versioning be automated.

4. **Leave it better than you found it:**
   - Include tests for your changes to keep the project stable for everyone.
   - Update the `README.md` or relevant documentation if you change behavior or an API.
   - Make sure all checks pass before requesting a review.

## Proposing Major Changes (RFC)

For standard features and bug fixes, a regular issue is perfect.
But if you are proposing a new architectural pattern, a major dependency swap, or a cross-cutting capability, use a lightweight RFC (Request for Comments) process to work out the details before anyone writes code.

1. Open an issue proposing the idea.
2. Once we agree the problem is worth solving, write the RFC as a markdown file under `docs/rfcs/` (e.g., `docs/rfcs/0001-new-caching-strategy.md`) describing the problem, the proposed solution, and the alternatives you considered.
3. Open a PR with _just_ that markdown file.
4. We discuss and refine the RFC together in the PR comments.
5. Once the RFC PR is merged, you have the green light to start implementing!

## Before Requesting a Review

To get a fast review, make sure your PR has:

- A linked issue
- Tests for the change
- Passing checks
- A Conventional Commits title
