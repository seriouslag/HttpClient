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
  This package's API is still developing and will not follow SEMVER until release 1.0.0.

  HttpClient helps standardarize making HTTP calls and handling when errors are thrown. HttpClient works both in the browser and node environments. Exposes an easy interface to abort HTTP calls using <a href="https://developer.mozilla.org/en-US/docs/Web/API/AbortController">AbortController</a>. See below about using [AbortController](#using-abortcontroller) in older environments. Exposes an interface to control how requests and responses are handled. See below about using [HttpClient's Request Strategies](#using-request-strategies)
</p>

<h2>Installation</h2>

```bash
npm install @seriouslag/httpclient
```

<h2>Example</h2>

<p>To see additional examples look in the `src/examples/` directory.</p>

Basic example:
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

<h2>Configuring axios</h2>
<p>
  Axios can be configured, axios options can be passed into the constructor of HttpClient.
</p>

```typescript
import { HttpClient } from '@seriouslag/httpclient';
import { Agent } from 'https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const httpClient = new HttpClient({
  axiosOptions: {
    httpsAgent,
  },
});
```

<h2>Using AbortController</h2>
<p>Each of the HTTP methods of the HttpClient accept an instance of a AbortController. This allows HTTP requests to be cancelled if not already resolved.


```typescript
import { HttpClient } from '@seriouslag/httpclient';

interface PokemonPage {
  count: number;
  next: string|null;
  previous: string|null;
  results: NamedLink[];
}

const pokemonApiUrl = 'https://pokeapi.co/api/v2';
const httpClient = new HttpClient();
const cancelToken = new AbortController();

const request = httpClient.get<PokemonPage>(`${pokemonApiUrl}/pokemon`, cancelToken);

cancelToken.abort();

try {
  const result = await request;
  console.log('Expect to not get here because request was aborted.', result)
} catch (e) {
  console.log('Expect to reach here because request was aborted.')
}
```
</p>

<h3>AbortController in older environments</h3>
<p>
  Abort controller is native to node 15+ and modern browsers. If support is needed for older browsers/node versions then polyfills can be found. This polyfill is used in the Jest test environment for this repository: <a href="https://www.npmjs.com/package/abortcontroller-polyfill">abortcontroller-polyfill</a>

  ```typescript
  import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
  import { HttpClient } from '@seriouslag/httpclient';

  const httpClient = new HttpClient();
  ```
</p>

<h2>Using Request Strategies</h2>
<p>
A request strategy is middleware to handle how requests are made and how responses are handled. This is exposed to the consumer using the `HttpRequestStrategy` interface. A request strategy can be passed into the HttpClient (it will be defaulted if not) or it can be passed into each request (if not provided then the strategy provided by the HttpClient will be used). A custom strategy can be provided to the HttpClient's constructor.
<p>

<h3>Using Request Strategy in the constructor</h3>

<p>The following code creates an instance of the HttpClient with a custom HttpRequestStrategy, all requests will now use this strategy by default.</p>
  
```typescript
import { HttpClient, HttpRequestStrategy } from '@seriouslag/httpclient';

class CreatedHttpRequestStrategy implements HttpRequestStrategy {

  /** Passthrough request to axios and check response is created status */
  public async request<T = unknown> (client: AxiosInstance, axiosConfig: AxiosRequestConfig) {
    const response = await client.request<T>(axiosConfig);
    this.checkResponseStatus<T>(response);
    return response;
  }

  /** Validates the HTTP response is successful created status or throws an error */
  private checkResponseStatus<T = unknown> (response: HttpResponse<T>): HttpResponse<T> {
    const isCreatedResponse = response.status === 201;
    if (isCreatedResponse) {
     return response;
    }
    throw response;
  }
}

const httpRequestStrategy = new CreatedHttpRequestStrategy();

// all requests will now throw unless they return an HTTP response with a status of 201
const httpClient = new HttpClient({
  httpRequestStrategy,
});
```

<h3>Using Request Strategy in a request</h3>

<p>The following code creates an instance of the HttpClient with a provided HttpRequestStrategy (MaxRetryHttpRequestStrategy), then starts a request and passes a different strategy (DefaultHttpRequestStrategy) to the request. The request will now used the strategy provided instead of the HttpClients strategy.</p>

 ```typescript
import { HttpClient, DefaultHttpRequestStrategy, MaxRetryHttpRequestStrategy } from '@seriouslag/httpclient';

// all requests will now throw unless they return an HTTP response with a status of 201
const httpClient = new HttpClient({
  httpRequestStrategy: new MaxRetryHttpRequestStrategy(10),
});

const response = httpClient.get('/endpoint', {
  httpRequestStrategy: new DefaultHttpRequestStrategy(),
})
```

</p>
  
<h2>Logging</h2>
<p>An interface is exposed to the HttpClient constructor to allow a logging instance to be provided.
  
```typescript
const logger: Logger = {
  info: (message: string, ...args: unknown[]) => console.log(message, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => console.error(message, ...args),
  debug: (message: string, ...args: unknown[]) => console.debug(message, ...args),
};
  
const httpClient = new HttpClient({
  logger,
});
```

</p>

<h2>Contributing</h2>

[Contributing](./CONTRIBUTING.md)
