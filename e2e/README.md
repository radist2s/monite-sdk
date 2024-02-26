# @team-monite/e2e - End-to-End Package Testing

## Overview

This package is dedicated to testing the functionality of the `@monite/*` packages. It allows for verification of
package installation capabilities and the ability of building projects using these installed packages.

The testing process utilizes [Verdaccio](https://verdaccio.org/), a _local_ package registry, to simulate the publication
and installation of packages in a controlled environment. This approach ensures the reliability of the packages before
they are released into production.

### Running the Tests

#### Preparation

_You must build your packages before publishing!_
To do this, run the following command from the root of the repository:

```bash
yarn build
```

#### Testing

Execute the following command to start the end-to-end tests:

```bash
yarn e2e:test
```

This command will sequentially run:

- `e2e:publish-to-private-registry` - Publish packages to the local registry.
- `e2e:update-projects-from-private-registry` - Update dependencies in test projects.
- `e2e:build-projects` - Build the test projects.
- `e2e:unpublish-from-private-registry` - Remove packages from the local registry for reuse in future tests.

## Test Stands

- `projects/sdk-drop-in-with-vite` - SDK React with Vite as the bundler.

## Adding a New Test Stand

To add a new test stand:

1. Create a new folder in `projects/`
2. Set up a new project within this folder.

New test projects will automatically be detected and added to the list of testable projects.

## Dogfooding testing with the `@monite/*` packages

There are times when you need to check Dogfooding(`examples/with-nextjs-and-clerk-auth`) for compatibility with a
package you are working on.
In this case, you should first publish packages from the workspace and then install them in the Dogfooding project.

1. Run _local_ registry server:
   ```bash
   yarn verdaccio
   ```
   > This command will start the _local_ registry server on `http://localhost:4873/`,
   > which will be used to publish and install the packages.
2. Publish _a snapshot release_ of the packages:
   - Make sure you have exited the Changesets pre-release mode:
     ```bash
     yarn workspace @monite/monite-sdk changeset pre exit
     ```
   - Create a [snapshot](https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md) version of the
     packages:
     ```bash
     yarn workspace @monite/monite-sdk changeset version --snapshot my-test-snapshot-tag
     ```
   - Build the packages:
     ```bash
     yarn workspace @monite/monite-sdk build
     ```
   - Publish packages to the _local_ registry:
     ```bash
     yarn e2e:publish-to-private-registry
     ```
4. Patch `.yarnrc.yml` of the monorepo to use the _local_ registry:
   ```bash
   yarn monorepo:use-private-registry
   ```
5. Install packages in the Dogfooding project:

   Navigate to the Dogfooding project and install the packages you just published. For example, the published
   packages from the workspace will have the version: `0.0.0-my-test-snapshot-tag-20240215001328`

6. Revert the changes to the `.yarnrc.yml` file:
   ```bash
   yarn monorepo:use-default-registry
   ```
