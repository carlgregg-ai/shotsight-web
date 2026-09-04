# ShotSight Stage 9 — Product QA (COMPLETE)

Date: 2026-09-04
Status: **COMPLETE — realistic mobile and desktop product journeys pass**

## Recovery baseline

Stage 8 was already complete and checkpointed. Stage 9 therefore did not reopen evidence, taxonomy, lesson writing, visual-system or diagnostic-engine design except where a realistic product journey exposed UX or test defects.

Stage 9 scope follows the durable Stage 1 plan: run realistic user journeys on phone and desktop, fix friction, then retest.

## Product journeys exercised

The automated product-journey gate now traverses the five persistent product areas on both 390×844 mobile and 1280×800 desktop:

- Today
- Train
- Playbook
- Diagnose
- Progress

It checks navigation reachability and horizontal fit, the Today → Train activity flow, pre-activity explanation, player entry/exit, Playbook target search, evidence-labelled lesson content, geometry disclosure, miss-language routing into Diagnose, supported diagnosis with explicit hypothesis/uncertainty and retest, unsupported-result stop behaviour that refuses to borrow a fix, and Progress reachability after the full journey.

Mobile additionally checks persistent navigation tap targets against the actual Playwright viewport.

## Friction / defects found and repaired

1. **Diagnosis entry copy did not clearly reflect the presentation-first decision engine.** It was rewritten to state the actual sequence: presentation → repeatable result → test → fix, with uncertainty retained when evidence does not support a prescription.
2. **General visual-guide copy was stale after source-attributed Playbook motion became available.** It was rewritten so generic movement guides are clearly secondary to presentation-specific source-attributed Playbook visuals.
3. **Integrated Playbook assets required cache-busting after the product-QA copy/integration change.** Asset query versions were advanced.
4. **First product-journey CI run exposed a test-context bug on mobile:** `innerWidth` was referenced from Node scope rather than page scope. This was a QA-harness defect, not an application defect. The assertion now compares tab geometry with the explicit Playwright `viewport.width`.

No evidence status was broadened to make a journey pass. DIRECT / SYNTHESIS / SHOTSIGHT_HYPOTHESIS / HOLD semantics remain intact.

## Final verification

Final Stage 9 tested commit: `9851312a288ade9f25b9c193994ed24df30fb51a`.

For that exact commit:

- ShotSight browser QA run `33833952279`: **SUCCESS**.
- Playbook smoke gate: **SUCCESS**.
- Diagnostic-engine gate: **SUCCESS**.
- Realistic product journeys: **SUCCESS** on mobile and desktop.
- GitHub Pages build/deployment run `33833951394`: **SUCCESS**.

The previously failing product-journey run `33833595437` was inspected rather than ignored; its sole Stage 9 failure was `innerWidth is not defined` in the mobile QA assertion. Desktop product journey, Playbook QA and diagnostic QA already passed in that run. The repaired test subsequently passed in the final Stage 9 run above.

## Scope boundary

Stage 9 certifies coherent realistic journeys and fixes concrete friction found by those journeys. It does not claim that every possible browser/device, accessibility assistive-technology combination or future content branch has been exhaustively tested.

## Stage gate

**Stage 9 status: COMPLETE.**

Next permitted stage: **Stage 10 — Deployment / final audit.** Inspect repository state, ensure only tested assets are committed, verify GitHub Pages, check the hosted application console/routes/PWA behaviour, and compare the deployed version with the tested code before declaring the programme complete.
