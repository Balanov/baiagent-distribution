# Security and trust model

## Reporting

Please open a private GitHub Security Advisory for vulnerabilities. Do not include private documents, credentials, personal data or sensitive customer URLs in public issues.

## Data boundaries

- Desktop model inference runs locally through Ollama on `127.0.0.1` or embedded `node-llama-cpp`; cloud model tokens are not required.
- Desktop public research makes outbound requests to the entered website and public search sources.
- Optional local documents are parsed on the user's computer and included only in the local model context.
- The web version sends the entered public URL to the configured research endpoint (by default `https://baiagent.ru/xray/api/research.php`). It does not accept local documents and does not claim browser-based local model inference.
- Distribution ranking, barter drafts, local autopilot transitions and outbox generation are deterministic and do not require a model.
- Outbox files contain no credentials. External actions require separately configured scoped connectors and are not executed by the current web build.

## Implemented safeguards

- Electron uses context isolation, sandboxing and no renderer Node integration.
- Native export accepts bounded text content and only `.md` / `.json` filenames, with an explicit save dialog.
- Public fetching rejects credentials, non-HTTP protocols, non-standard ports and private/reserved network addresses, including redirects.
- Responses, page counts, local file counts and local file sizes are bounded.
- The inherited public research endpoint has a basic per-IP rate limit.
- External search is hostname-first and unrelated snippets are filtered.
- Model output is structured and citations must be exact substrings of retrieved sources.
- Unsupported numbers are rejected in inherited recommendation generation.
- Readiness blocks distribution when first-party evidence or a concrete offering is absent.
- Every channel has a qualification event and stop rule; sending is not recorded as revenue.

## Autonomy boundaries

- Local actions can run without a human operator.
- Public-rule reading requires a `public_web:read` connector; publishing or contacting requires `channel:publish_or_contact` for the specific channel.
- Connectors must not bypass platform restrictions, create unapproved financial commitments or perform indiscriminate outreach.
- Current outbox entries remain `waiting_for_connector`; no successful external delivery is inferred from draft generation.

## Important limitations

- A citation proves that text was retrieved, not that its claim is true, complete or commercially valuable.
- Public pages and snippets are untrusted input. Prompt-injection resistance is defence in depth, not a guarantee.
- The basic per-IP research limit is not a substitute for edge quotas, abuse monitoring and alerting during a large launch.
- Windows artifacts are not code-signed in the default local build. macOS artifacts are not notarized by the default workflow.
- Review third-party and model licenses before redistribution.

Please report concrete reproduction steps and affected versions. Do not publicly claim a vulnerability is exploitable before validating it against the current source.
