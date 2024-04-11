# @seriouslag/httpclient

The monorepo for the `@seriouslag/httpclient` package.

## Contributing

### Requirements

_Node_: Check that node is installed with version 14.x or greater. Node's version can be checked with

```bash
# Check node version
node -v
```

### Setup

```bash
# Installs all dependencies
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
# Runs all unit tests
npm run test
```

```bash
# Runs all unit tests and builds a coverage report. Results are found in ./coverage folder.
npm run test:coverage
```

### Linting

```bash
# Lints all JS/TS files
npm run lint
```

```bash
# Lints and attempts to fix common linting errors in JS/TS files
npm run lint:fix
```

### Commiting code

Always work from a new branch off of main or fork this repo.

> Rebase often! This will help avoid merge large merge conflicts later.
>
> ```bash
> git fetch origin main
> git checkout origin main
> git pull
> git switch -
> git rebase origin/main
> ```

Pull requests (PR) must go through the build pipeline and peer reviewed before merging into main.\
Keep PRs small so they are easier to get through review.

### Debugging code

This repository comes with a `.vscode/launch.json` file.\
This can be used to run [debugging sesions using vscode](https://code.visualstudio.com/docs/editor/debugging).

---

[README](./README.md)
