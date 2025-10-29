# Development Setup

This repository uses automated tooling to ensure code quality and consistent commit messages.

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Docker & Docker Compose

## Initial Setup

```bash
# Install dependencies
npm install

# Husky will be automatically initialized via the prepare script
```

## Git Hooks (Husky)

This repository uses [Husky](https://typicode.github.io/husky/) to manage Git hooks:

### Pre-commit Hook

Automatically runs before each commit:

- **Prettier**: Formats staged YAML, JSON, and Markdown files
- **Markdownlint**: Lints and fixes Markdown files
- **Lint-staged**: Only processes files that are staged for commit

### Commit-msg Hook

Validates commit messages against [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Commit Message Format

### Type (Required)

Must be one of:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (not affecting functionality)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD changes
- `chore`: Other changes (tooling, maintenance)
- `config`: Configuration changes (infra-specific)
- `infra`: Infrastructure changes (infra-specific)
- `revert`: Revert a previous commit

### Scope (Optional but Recommended)

Indicates what part of the codebase is affected:

- `docker`: Docker/compose configuration
- `prometheus`: Prometheus configuration
- `grafana`: Grafana dashboards/datasources
- `tempo`: Tempo trace backend
- `otel`: OpenTelemetry collector
- `alertmanager`: Alertmanager configuration
- `blackbox`: Blackbox exporter
- `docs`: Documentation
- `env`: Environment configs (dev/stage/prod)
- `catalog`: Service catalog
- `slo`: SLO definitions
- `deps`: Dependencies
- `hooks`: Git hooks/tooling

### Examples

✅ **Good commit messages:**

```
feat(prometheus): add scrape config for new service
fix(docker): resolve port conflict for Grafana
docs(readme): update installation instructions
config(otel): change logging to debug exporter
infra(tempo): configure trace retention to 48h
chore(deps): update Prettier to v3.3.3
```

❌ **Bad commit messages:**

```
updated stuff
Fixed bug
WIP
asdf
```

## Available Scripts

### Formatting

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check
```

### Linting

```bash
# Run all linters
npm run lint

# Lint Markdown files
npm run lint:md

# Lint YAML files
npm run lint:yaml

# Auto-fix linting issues
npm run lint:fix
```

## Bypassing Hooks (Emergency Only)

If you absolutely need to bypass hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip commit-msg hook
git commit -n -m "message"
```

**⚠️ Use sparingly!** Hooks exist to maintain code quality.

## Configuration Files

| File                       | Purpose                   |
| -------------------------- | ------------------------- |
| `.prettierrc.json`         | Prettier formatting rules |
| `.prettierignore`          | Files to skip formatting  |
| `.markdownlint-cli2.jsonc` | Markdown linting rules    |
| `commitlint.config.js`     | Commit message validation |
| `.husky/pre-commit`        | Pre-commit hook script    |
| `.husky/commit-msg`        | Commit-msg hook script    |
| `package.json`             | Dependencies and scripts  |

## Troubleshooting

### Husky hooks not running

```bash
# Reinstall Husky hooks
npx husky install
```

### Prettier formatting conflicts

```bash
# Check what Prettier would change
npm run format:check

# Apply all formatting
npm run format
```

### Commit message rejected

```bash
# View the commitlint config
cat commitlint.config.js

# Example valid commit:
git commit -m "feat(prometheus): add new scrape target"
```

### Node modules issues

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## Editor Integration

### VS Code

Install these extensions for the best experience:

- **Prettier** - Code formatter
  - `esbenp.prettier-vscode`
- **Markdownlint** - Markdown linting
  - `DavidAnson.vscode-markdownlint`
- **YAML** - YAML language support
  - `redhat.vscode-yaml`
- **Conventional Commits** - Commit message helper
  - `vivaxy.vscode-conventional-commits`

### Recommended VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[markdown]": {
    "editor.formatOnSave": true,
    "editor.wordWrap": "on"
  },
  "[yaml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Contributing

1. **Fork** the repository
2. **Clone** your fork
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feat/my-feature`
5. **Make** your changes
6. **Commit** with conventional commits: `git commit -m "feat(scope): description"`
7. **Push** to your fork: `git push origin feat/my-feature`
8. **Open** a Pull Request

All commits will be automatically validated and formatted! 🎉
