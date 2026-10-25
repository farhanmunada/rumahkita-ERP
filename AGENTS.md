# AGENTS.md

> Aturan universal agen coding. Salin file ini ke root setiap projek baru.
> Knowledge base lintas-projek: `C:\Users\vola\agentVault`

---

## 1. Aturan Inti

1. **Keamanan deny-first** — jangan baca/tulis/cetak/commit file rahasia (`.env`, `.env.*`, `*.pem`, `id_rsa`, token cloud).
2. **Jangan curangi tes** — perbaiki kode bisnis, bukan asersi tes. Jangan hapus/lemahkan tes agar hijau.
3. **Jangan halusinasi dependensi** — urutan: stdlib → paket terpasang → fungsi mandiri → minta izin manusia sebelum menambah paket.
4. **Batas 3 kali** — gagal 3x berturut di target sama: stop, rollback via git, lapor hipotesis + error ke manusia.
5. **Jangan klaim selesai palsu** — linter, build, typecheck, dan tes harus hijau sebelum bilang selesai.
6. **Tulis ke file, bukan chat** — riset, PRD, arsitektur ditulis ke `docs/`. Chat hanya status ringkas (maks 5 baris).
7. **Jangan mengarang fakta** — setiap klaim faktual harus punya sumber (file dibaca / output perintah / docs resmi). Belum yakin → nyatakan "belum diverifikasi".
8. **Agnostik platform** — jangan berasumsi projek selalu web/Next.js. Wajib konfirmasi target platform (Web, Mobile, Desktop, CLI, Backend) jika belum jelas.

---

## 2. Alur Kerja

1. **Intake** — baca `AGENTS.md` + seluruh `docs/`. Klarifikasi target platform & tech stack jika belum eksplisit.
2. **Riset** — eksplor codebase (`read_file`, `search_files`, `terminal`) & docs resmi (`web_extract`, `web_search`) → tulis ke `docs/RESEARCH.md`. Detail: baca `C:\Users\vola\agentVault\02-Execution-Lifecycle\research-methodology.md`.
3. **Spec** — perjelas intent via pertanyaan klarifikasi → tulis PRD ke `docs/PRD.md` (Bahasa Indonesia).
4. **[GERBANG 1]** — berhenti, tunggu approval manusia.
5. **Arsitektur** — pecah tugas + rancangan → `docs/ARCHITECTURE.md`.
6. **[GERBANG 2]** — berhenti bila tugas ≥3 file / ubah skema DB, tunggu approval.
7. **Implementasi** — kode bersih, incremental, verifikasi tiap langkah. Sebelum refactor, baca `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\05-refactoring-guidelines.md`.
8. **Verifikasi** — typecheck + lint + unit test, lalu smoke test nyata (DB/migrasi).
9. **Review** — self-review pakai checklist `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\04-code-review-checklist.md`. Regresi, keamanan, diff bersih.
10. **Commit** — commit atomik konvensional (`feat(...)`, `fix(...)`). Branching & lockfile rules: `C:\Users\vola\agentVault\01-Core-Rules\git-discipline.md`.

---

## 3. Gerbang Manusia (STOP & WAIT)

- **Gerbang 1 — PRD:** setelah `docs/PRD.md` selesai, berhenti. Jangan tulis kode/skema sebelum disetujui.
- **Gerbang 2 — Arsitektur:** untuk tugas ≥3 file atau perubahan skema DB, paparkan rencana lalu berhenti sebelum file kode pertama.

---

## 4. Bahasa

- Semua dokumen di `docs/` → **Bahasa Indonesia** (istilah teknis/identifier tetap Inggris).
- Kode & komentar → **Bahasa Inggris**.

---

## 5. Referensi Knowledge Base (baca sesuai kebutuhan)

Vault path: `C:\Users\vola\agentVault`. Baca node **hanya bila butuh detail** — jangan muat semua di awal sesi. Gunakan `read_file` untuk membaca node vault.

| Topik | File |
|---|---|
| Indeks lengkap | `C:\Users\vola\agentVault\INDEX.md` |
| Aturan inti & guardrails | `C:\Users\vola\agentVault\01-Core-Rules\non-negotiables.md` |
| Git, branching, lockfile | `C:\Users\vola\agentVault\01-Core-Rules\git-discipline.md` |
| Inisiasi projek | `C:\Users\vola\agentVault\01-Initiation-and-Spec\01-project-initiation.md` |
| Template PRD | `C:\Users\vola\agentVault\01-Initiation-and-Spec\02-prd-generation.md` |
| Validasi PRD | `C:\Users\vola\agentVault\01-Initiation-and-Spec\03-prd-validation-gate.md` |
| Tech stack & dependency ladder | `C:\Users\vola\agentVault\02-Architecture-and-Tech\01-tech-stack-decision.md` |
| Desain sistem | `C:\Users\vola\agentVault\02-Architecture-and-Tech\02-system-design.md` |
| Lifecycle & workflow | `C:\Users\vola\agentVault\02-Execution-Lifecycle\lifecycle-and-workflow.md` |
| Metodologi riset | `C:\Users\vola\agentVault\02-Execution-Lifecycle\research-methodology.md` |
| Clean code standards | `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\01-clean-code-standards.md` |
| Pola struktur folder | `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\02-file-structure-patterns.md` |
| Code ordering & separation | `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\03-code-ordering-and-separation.md` |
| Code review checklist | `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\04-code-review-checklist.md` |
| Refactoring guidelines | `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\05-refactoring-guidelines.md` |
| Anti-pattern & debugging | `C:\Users\vola\agentVault\03-Anti-Patterns\failure-modes-and-recovery.md` |
| Testing berlapis | `C:\Users\vola\agentVault\04-Quality-and-Repeated-Testing\01-multi-stage-testing.md` |
| Anti-tampering tes | `C:\Users\vola\agentVault\04-Quality-and-Repeated-Testing\02-anti-tampering.md` |
| Keamanan & sandboxing | `C:\Users\vola\agentVault\04-Security\risk-tiers-and-sandboxing.md` |
| Git / versioning | `C:\Users\vola\agentVault\01-Core-Rules\git-discipline.md` |
| Tech stack | `C:\Users\vola\agentVault\02-Architecture-and-Tech\01-tech-stack-decision.md` |

**Pemetaan Intent → Node Vault:**

| Intent | Node |
|---|---|
| Fitur baru | `01-Initiation-and-Spec/` → `02-Execution-Lifecycle/lifecycle-and-workflow` → `03-Implementation-and-Clean-Code/` |
| Riset / verifikasi docs | `02-Execution-Lifecycle/research-methodology` |
| Perencanaan / breakdown | `02-Execution-Lifecycle/lifecycle-and-workflow` (Fase 1-2) |
| Bug / debugging | `03-Anti-Patterns/failure-modes-and-recovery` (Section 5) |
| Code review / audit | `03-Implementation-and-Clean-Code/04-code-review-checklist` |
| Refactoring | `03-Implementation-and-Clean-Code/05-refactoring-guidelines` |
| Arsitektur / desain | `02-Architecture-and-Tech/02-system-design` |
| Testing | `04-Quality-and-Repeated-Testing/01-multi-stage-testing` |
| Keamanan | `04-Security/risk-tiers-and-sandboxing` |
| Git / versioning | `01-Core-Rules/git-discipline` |
| Tech stack | `02-Architecture-and-Tech/01-tech-stack-decision` |

---

## 6. Matriks Perizinan

| Risiko | Aksi | Kebijakan |
|---|---|---|
| Rendah | read, grep, glob, git status/diff, unit test | Auto-allow |
| Sedang | edit kode, tambah dependensi, migrasi DB | Konfirmasi |
| Tinggi | `rm -rf`, `git push -f`, edit `.env`, drop DB | Blokir / tanya manusia |

---

## 7. Perintah Verifikasi

> Sesuaikan dengan stack projek. Contoh per platform:

**Web (Node.js):**
- Lint: `npm run lint` / Typecheck: `npx tsc --noEmit` / Test: `npm test` / Build: `npm run build`

**Python:**
- Lint: `ruff check .` / Typecheck: `mypy .` / Test: `pytest` / Build: `python -m build`

**Go:**
- Lint: `golangci-lint run` / Test: `go test ./...` / Build: `go build ./...`

**Mobile (Flutter):**
- Lint: `flutter analyze` / Test: `flutter test` / Build: `flutter build`

**Rust:**
- Lint: `cargo clippy` / Test: `cargo test` / Build: `cargo build`
