<h1 align="center">
  HttpClient
</h1>

<p align="center">
  Typed wrapper around axios.
</p>

<p align="center">
  <a href="https://github.com/seriouslag/HttpClient/actions">
    <img alt="Github - Action" src="https://github.com/seriouslag/httpclient/actions/workflows/main.yml/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/@seriouslag/httpclient">
    <img alt="NPM Package" src="https://img.shields.io/npm/v/@seriouslag/httpclient">
  </a>
  <a href="https://dev.azure.com/landongavin/nullspace/_build?definitionId=3">
    <img alt="Code Coverage" src="https://img.shields.io/azure-devops/coverage/landongavin/nullspace/3/main?label=Coverage">
  </a>
  <a href="https://sonarcloud.io/project/issues?id=seriouslag_HttpClient">
    <img alt="Sonar Violations" src="https://img.shields.io/sonar/violations/seriouslag_HttpClient/main?format=long&server=https%3A%2F%2Fsonarcloud.io">
  </a>
</p>

<p align="center">
  HttpClient helps standardarize making HTTP calls and handling when errors are thrown. HttpClient works both in the browser and node environments. Exposes an easy interface to abort HTTP calls using <a href="https://developer.mozilla.org/en-US/docs/Web/API/AbortController">AbortController</a>. See below about using AbortController in older environments.
</p>

<h2 align="center">Installation</h2>

```bash
npm install @seriouslag/httpclient
```

<h2 align="center">Example</h2>

<p align="center">To see additional examples check the examples folder in `src/examples/`</p>

```typescript
import { HttpClient } from '@seriouslag/httpclient';

interface NamedLink {
  name: string;
  url: string;
}

interface PokemonPage {
  count: number;
  next: string|null;
  previous: string|null;
  results: NamedLink[];
}

const httpClient = new HttpClient();

function fetchPokemonPage (offset: number = 0, pageSize: number = 20) {
  const pokemonApiUrl = 'https://pokeapi.co/api/v2';
  return this.httpClient.get<PokemonPage>(`${pokemonApiUrl}/pokemon`, {
      params: {
        offset: offset,
        limit: pageSize,
      },
  });
}

// iffy
(async () => {
  const results = await fetchPokemonPage(0, 100);
  console.log(results);
})();
```

<h2 align="center">Configuring axios</h2>
<p align="center">
  Axios can be configured, all options are exposed in the constructor of HttpClient.
</p>

```typescript
import { HttpClient } from '@seriouslag/httpclient';
import { Agent } from 'https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const httpClient = new HttpClient({
  httpsAgent,
});
```

<h2 align="center">AbortController in older environments</h2>
<p align="center">
  Abort controller is native to node 15+ and modern browsers. If support is needed for older browsers/node versions then polyfills can be found. This polyfill is used in the jest test env for this repo: <a href="https://www.npmjs.com/package/abortcontroller-polyfill">abortcontroller-polyfill</a>

  ```typescript
  import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
  import { HttpClient } from '@seriouslag/httpclient';

  const httpClient = new HttpClient();
  ```
</p>
