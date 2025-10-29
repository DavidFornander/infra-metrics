module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system or dependencies
        "ci", // CI/CD changes
        "chore", // Other changes (tooling, etc)
        "revert", // Revert a previous commit
        "config", // Configuration changes (custom type for infra)
        "infra", // Infrastructure changes (custom type)
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "docker", // Docker/compose changes
        "prometheus", // Prometheus configuration
        "grafana", // Grafana dashboards/datasources
        "tempo", // Tempo trace backend
        "otel", // OpenTelemetry collector
        "alertmanager", // Alertmanager config
        "blackbox", // Blackbox exporter
        "docs", // Documentation
        "env", // Environment configs (dev/stage/prod)
        "catalog", // Service catalog
        "slo", // SLO definitions
        "deps", // Dependencies
        "hooks", // Git hooks/tooling
      ],
    ],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [0], // Allow any case for subject
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};
