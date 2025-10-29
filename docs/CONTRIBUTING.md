# Development Tooling - Quick Reference

## ✅ What's Installed

### 1. **Husky** (Git Hooks)

Automatically runs checks before commits:

- ✅ **Pre-commit**: Formats and lints staged files
- ✅ **Commit-msg**: Validates commit messages

### 2. **Conventional Commits** (Commitlint)

Enforces standardized commit messages:

```
<type>(<scope>): <subject>
```

**Example**: `feat(prometheus): add new scrape target`

### 3. **Prettier** (Code Formatter)

Auto-formats:

- ✅ YAML files (`.yml`, `.yaml`)
- ✅ Markdown files (`.md`)
- ✅ JSON files (`.json`)

### 4. **Markdownlint** (Markdown Linter)

Checks Markdown files for style consistency.

---

## 🚀 Quick Commands

```bash
# Format all files
npm run format

# Check formatting (no changes)
npm run format:check

# Run all linters
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## 📝 Commit Message Format

### Valid Types

| Type       | Description              | Example                                     |
| ---------- | ------------------------ | ------------------------------------------- |
| `feat`     | New feature              | `feat(grafana): add new dashboard`          |
| `fix`      | Bug fix                  | `fix(docker): resolve port conflict`        |
| `docs`     | Documentation            | `docs(readme): update installation steps`   |
| `style`    | Code formatting          | `style: format YAML files`                  |
| `refactor` | Code refactoring         | `refactor(otel): simplify config structure` |
| `config`   | Configuration changes    | `config(prometheus): update retention time` |
| `infra`    | Infrastructure changes   | `infra(tempo): increase trace storage`      |
| `chore`    | Maintenance/tooling      | `chore(deps): update dependencies`          |
| `build`    | Build/dependency changes | `build: upgrade Docker base images`         |
| `ci`       | CI/CD changes            | `ci: add GitHub Actions workflow`           |
| `test`     | Adding/updating tests    | `test: add smoke tests for stack`           |
| `perf`     | Performance improvements | `perf(prometheus): optimize query time`     |
| `revert`   | Revert previous commit   | `revert: undo previous change to config`    |

### Valid Scopes

| Scope          | Description                |
| -------------- | -------------------------- |
| `docker`       | Docker/compose config      |
| `prometheus`   | Prometheus config          |
| `grafana`      | Grafana dashboards/sources |
| `tempo`        | Tempo trace backend        |
| `otel`         | OpenTelemetry collector    |
| `alertmanager` | Alertmanager config        |
| `blackbox`     | Blackbox exporter          |
| `docs`         | Documentation              |
| `env`          | Environment configs        |
| `catalog`      | Service catalog            |
| `slo`          | SLO definitions            |
| `deps`         | Dependencies               |
| `hooks`        | Git hooks/tooling          |

---

## ✅ Example Commits

```bash
# Adding a new feature
git commit -m "feat(prometheus): add scrape config for payment service"

# Fixing a bug
git commit -m "fix(docker): resolve Grafana port conflict with open-webui"

# Updating documentation
git commit -m "docs(architecture): document Tempo selection rationale"

# Formatting code
git commit -m "style: auto-format all YAML files with Prettier"

# Configuration change
git commit -m "config(otel): change logging exporter to debug"

# Infrastructure update
git commit -m "infra(tempo): configure 48h trace retention"

# Chore/maintenance
git commit -m "chore(deps): update Prettier to v3.3.3"
```

---

## ❌ Invalid Commits (Will Be Rejected)

```bash
# No type
git commit -m "updated stuff"  ❌

# Invalid type
git commit -m "updated(docker): changed config"  ❌

# Missing subject
git commit -m "feat(prometheus):"  ❌

# Subject ends with period
git commit -m "feat: add config."  ❌

# Invalid scope
git commit -m "feat(random): something"  ❌
```

---

## 🔧 How It Works

### Pre-commit Hook (Automatic)

1. You run `git commit`
2. Husky intercepts the commit
3. **Lint-staged** runs on staged files:
   - Prettier formats YAML/JSON/Markdown
   - Markdownlint checks Markdown files
4. If formatting changes files, they're auto-staged
5. Commit proceeds

### Commit-msg Hook (Automatic)

1. You provide a commit message
2. Husky validates it with **Commitlint**
3. Message must match: `<type>(<scope>): <subject>`
4. If invalid, commit is rejected with error message
5. If valid, commit proceeds

---

## 🛠️ Troubleshooting

### Hook Not Running?

```bash
# Reinstall Husky
npx husky install
```

### Commit Message Rejected?

Check the format:

```bash
# ✅ Correct
git commit -m "feat(prometheus): add new target"

# ❌ Wrong
git commit -m "added prometheus target"
```

### Want to Bypass (Emergency)?

```bash
# Skip hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"
```

---

## 📂 Configuration Files

| File                       | Purpose                |
| -------------------------- | ---------------------- |
| `.husky/pre-commit`        | Pre-commit hook        |
| `.husky/commit-msg`        | Commit message hook    |
| `commitlint.config.js`     | Commit validation      |
| `.prettierrc.json`         | Prettier settings      |
| `.prettierignore`          | Prettier exclusions    |
| `.markdownlint-cli2.jsonc` | Markdown linting rules |
| `package.json`             | Scripts and deps       |

---

## 🎯 Benefits

1. ✅ **Consistent formatting** - All YAML/Markdown files look the same
2. ✅ **Clear commit history** - Easy to understand what changed and why
3. ✅ **Automated changelog** - Can generate from conventional commits
4. ✅ **Better collaboration** - Everyone follows same standards
5. ✅ **Catch issues early** - Linting happens before commit, not in CI

---

## 📚 Learn More

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Commitlint](https://commitlint.js.org/)

---

**Ready to commit?** Just use the format: `type(scope): description` and you're good! 🚀
