## Usage

### Installation:

```bash
npm i @smock/vue-cli-plugin-sproxy
```

### Modify your packages.json


```json
{
  // ...
  "scripts": {
    "sproxy": "vue-cli-service sproxy --port 5000"
  }
  // ...
}

```

Then you can run command to start the interceptor service.

```
npm run sproxy
```

Configuration Documents:

[See here:(https://www.npmjs.com/package/@smock/interceptor)](https://www.npmjs.com/package/@smock/interceptor)