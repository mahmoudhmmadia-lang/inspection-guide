# Inspection walkthrough

This is a standalone Arabic beginner guide. The latest user request supersedes
the older multi-chapter, fictional-example and review-only instructions.

- Publish only `chapters/01b-build.tex`: the step-by-step inspection workflow.
- Keep HR setup concise, but teach builder tools in depth: setting meanings,
  choices and reasons, concrete configuration, expected results, negative cases,
  and troubleshooting. Do not interpret "concise" as omitting form/dashboard detail.
- Keep dashboard creation, establishment data sources, KPI/charts/table, search,
  explicit widget-filter binding, access and publishing inside that chapter.
  Simplifying the guide must not remove these workflow steps.
- Start with a short hypothetical scenario using the verified organization names:
  «لنفترض أن لدينا مؤسسة اسمها…». Do not address the reader as the organization's
  owner or ask them to audit their current organization.
- Never mention in learner-facing prose that names/photos were taken from an
  existing organization, or tell readers to reuse pre-existing setup. Keep source
  provenance in README/review files only. Later steps may refer to items created
  in earlier steps of the hypothetical walkthrough.
- Explain each term on first use, especially record, record type, form, record
  question, field mapping, assignment, approval and publishing. State why the
  step is needed, then concrete clicks/values, then the expected result.
- Keep creation, configuration, save and verification instructions. Existing
  records do not justify replacing the tutorial with a review checklist.
- Use simple Modern Standard Arabic. Exact UI labels go in «».
- Use screenshots genuinely captured from the user's organization only. Current
  approved images are listed in README.md and trace to review/capture/capture.mjs
  (`org` environment). Do not use test2 `b-*` / `i-*` screenshots in this guide.
- Every screenshot has numbered markers and a matching `\\shotnote` legend.
  Inspect any screenshot before adding it. Never fabricate live screenshots or
  imply that a draft/warning state is a successfully configured final state.
- Read organization data only; do not create or alter records to write the guide.
  Never store credentials in source, reports or screenshots.
- Keep verification/capture limitations in README/progress and the user reply,
  not repeated in the instructional flow. Do not claim end-to-end verification
  from source inspection or static tests.
- `main.tex` selects the content. `site/` is generated; edit the sources and build.
- Run focused guide checks. Browser verification covers this single chapter,
  responsive layout, image loading, search and saved reading progress.
