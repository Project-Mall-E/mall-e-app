# Agent skills

This folder holds agent-facing guidelines so that coding agents (Cursor, OpenCode, etc.) follow consistent best practices when working on this repo.

## Contents

- **react-native-skills/** – React Native and Expo best practices from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (rendering, list performance, animations, UI, state, and more). The full guide for agents is `react-native-skills/AGENTS.md`; `SKILL.md` is a quick reference.

## Updating React Native skills

When the upstream repo adds or changes rules, refresh the local copy by running from the project root:

```bash
npm run update:agent-skills
```

Or directly:

```bash
./scripts/sync-react-native-skills.sh
```

Optional: pass a branch or tag to pin to a specific ref, e.g. `./scripts/sync-react-native-skills.sh main`. After syncing, review the changes and commit. The current upstream ref is recorded in `react-native-skills/.source`.
