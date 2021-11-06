# Contributing

## Development

### Requirements

*Node*: Check that node is installed with version ^14.x. Node's version can be checked with

```bash
# Check node version
node -v
```

*Yarn*: Make sure that yarn 1 is globally installed with version ^1.22.10. To check global yarn version CD outside of project folder and run command:
```bash
# Check yarn version
yarn -v
```

```bash
# Install yarn globably using npm
npm install -g yarn
```

### Setup

```bash
# Installs all dependencies
yarn install
```

### Build
```bash
yarn build
```

### Testing
```bash
# Runs all unit tests
yarn test:unit
```

```bash
# Runs all unit tests and builds a coverage report. Results are found in ./coverage folder.
yarn test:coverage
```

### Linting
```bash
# Lints all JS/TS filess
```

```bash
# Lints and attemps to fix common linting errors in JS/TS files
yarn lint:fix
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

***

[README](./README.md)
