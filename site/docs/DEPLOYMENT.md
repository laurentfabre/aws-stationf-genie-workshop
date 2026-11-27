# Deploy the workshop. AE and SA README

Use this kit for a two-hour Sales & Marketing workshop on Databricks Genie. Participants investigate the fictional NovaFlow business, inspect the generated SQL and present a decision. All 648 source rows are synthetic. The participant UI and exercises are in French.

The public [decision studio](https://laurentfabre.github.io/aws-stationf-genie-workshop/) needs no deployment. Each participant or pair runs one notebook in their own AWS Trial or in a workspace prepared by an SA. The notebook installs three Delta tables and a Genie Agent. App Builder is an optional follow-on exercise with separate prerequisites.

## AE. Prepare the session

1. Agree on the audience, date and one business decision per pair. Choose Marketing, Activation or Retention. Pipeline is a bonus.
2. Send participants the [Trial setup guide](TRIAL_SETUP.md), [notebook download](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/00_START_HERE.ipynb) and [participant ZIP](https://github.com/laurentfabre/aws-stationf-genie-workshop/releases/latest/download/stationf-genie-participants-2026-11-24.zip). No GitHub account is required to download them.
3. Ask them to create and check their Trial before the session. Confirm credits and expiration against the session date. The original event was 24 November 2026. Its agenda, dataset dates and resource prefix remain fixed in this kit.
4. Have the SA rehearse in the actual participant offer and region. Only advertise Builder after the SA has tested it there. Trial and Free Edition have different capabilities and quotas.
5. Use the [facilitation guide](FACILITATION.md) for timing. The studio tracks each participant's declared progress locally. It does not provide a shared facilitator dashboard or send help requests.

## SA. Prepare the workspace

Use an AWS Trial for the intended participant experience. FEVM serverless is suitable for an internal rehearsal, but a successful FEVM run does not prove Trial availability or another user's permissions.

Confirm that the installing identity can use notebook Serverless, create a schema and tables in an existing Unity Catalog catalog, use an existing SQL warehouse and create a Genie Agent. The notebook does not provision a workspace, catalog, warehouse, preview, grant or App Space. Do not use `samples` or `system` as the destination catalog.

For a shared workspace, allocate a dedicated schema to each pair and validate its members' permissions before the session. Separate schemas avoid name collisions; they do not establish access isolation. Validate access with the actual participant identity. The notebook preserves ownership and stops on incompatible resources, so do not install as a facilitator and assume a participant can rerun it as owner.

## SA or participant. Install through the UI

1. Download `00_START_HERE.ipynb`, import it into a personal workspace folder and select **Serverless**. The `.py` release asset is an alternative Databricks source notebook.
2. Execute the first cells through **Préparer mon installation** to list accessible catalogs and warehouses.
3. Supply the widgets below. Run only one installation at a time per schema.

| Widget | Value |
|---|---|
| `catalog` | An existing writable catalog. Letters, digits and underscores, starting with a letter or underscore. |
| `schema` | A unique name such as `stationf_20261124_equipe01`. Keep the required `stationf_20261124_` prefix even for a later event. |
| `warehouse_id` | The existing warehouse's 16-character ID, from SQL Warehouses → Connection details. |
| `action` | Start with `revue` to inspect the plan, then use `installer` to create resources. Use `verifier` for subsequent read-only data checks. |

4. Run **Installer et vérifier** with `installer`. Confirm 240 accounts, 48 campaign/week rows and 360 opportunities, six reference SQL checks, and the warehouse check.
5. Run **Créer mon Genie Agent**, then **Mon reçu et mes liens**. Open the returned Genie URL. A compatible rerun reuses the tables and preserves the existing Agent's edited instructions. `verifier` does not create an Agent.
6. Ask a live Genie question, inspect the SQL and compare its answer with the relevant [reference results](../reference-results.json). A quick smoke check is: “Combien de comptes contient account_snapshot au 17 novembre 2026 ? Donne aussi le MRR total en EUR et le SQL utilisé.” Expected: **240 accounts, EUR 705,600 MRR**. This checks one question, not the entire Agent.
7. Open the public studio or extract the ZIP and open `index.html`. Create a participant/pair profile. Paste the notebook receipt into **Mes liens Databricks**. Choose one mission, record evidence and export JSON before changing browser or switching between the website and the offline kit.

The notebook contains all data and installer code. Participants use native notebook authentication. They do not need a PAT, AWS key, local Python, CLI, package installation or access to the facilitator's workspace.

## Optional App Builder

Follow [APP_BUILDER.md](APP_BUILDER.md) to check the current region, preview, App Space and permissions. These prerequisites are separate from Genie Agent creation. If unavailable, mark Builder **Indisponible** in the studio and continue the Genie analysis, SQL checks and application specification. Do not mark an application deployment as passed without testing it.

## Rehearsal and troubleshooting

- Test a fresh dedicated schema, then rerun `installer` in that schema. Run `verifier` separately to check the installed data.
- Check the selected mission's Genie answers against reference SQL under the participant identity. If needed, use [manual Genie creation and troubleshooting](TROUBLESHOOTING.md).
- Test a restricted second identity before claiming read-only or denied access. An owner's success does not demonstrate those controls.
- Review [VALIDATION.md](VALIDATION.md). FEVM rehearsal evidence exists, but an actual participant Trial, Builder and second-identity access remain unverified in the published validation record. Record your own results privately.
- Export participant work before [cleanup](CLEANUP.md). Never drop the catalog or stop a shared warehouse. Trial expiration and billing require a separate account check.

## Reuse, publish and handle credentials

Clone the public repository if you need to maintain the workshop:

```bash
git clone https://github.com/laurentfabre/aws-stationf-genie-workshop.git
cd aws-stationf-genie-workshop
python3 scripts/check_publication.py --history
python3 -m unittest discover -s tests -v
```

See [CONTRIBUTING.md](https://github.com/laurentfabre/aws-stationf-genie-workshop/blob/main/CONTRIBUTING.md) to rebuild notebooks, the site, PDF and participant ZIP. GitHub Pages serves the committed `site/` directory. For your own fork, enable Pages with **GitHub Actions**, update the repository and download URLs for your fork, then publish matching release assets. Participants need neither Pages nor a fork to use the existing ZIP and notebook. No Vercel deployment is required.

Keep notebook outputs, session receipts, workspace URLs, identities, exports, `.env` files and credentials outside the public repository and ZIP. Clear all notebook outputs before sharing a notebook. Browser JSON exports contain participants' notes and environment links; share them only with their intended recipients. `.gitignore` prevents accidental additions of common private files; it does not remove files already committed. The publication check scans tracked/public files, ZIP members and optionally reachable Git history for known credential patterns and private environment references. It is a pattern check, not a guarantee that every possible secret format will be detected.

If a real credential is found in a published version, revoke or rotate it first, then remove it from current files, affected release assets and history through a coordinated cleanup. Deleting its current line alone does not revoke it.
