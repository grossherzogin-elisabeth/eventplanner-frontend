# App context

This is the main app context. When starting with a new project, you can put all your components, views and services
here. As soon as you split your app into multiple independent bounded contexts, you should use the shared context for
all shared code and the app context as a primary context that contains components like navbar and footer, authorization,
etc.

## Folder structure

The basic folder structure of a context is as follows:

```
app/
├─ adapter/
├─ assets/
├─ components/
├─ locales/
├─ services/
├─ types/
├─ views/
├─ App.vue *
├─ Context.ts
├─ index.ts

* App context only
```

### The `adapter/` folder

The `adapter` folder contains your repository layer. Typically, you would want an interface defining your repository
functions and one or more implementations of this interface, to prevent coupling. If the implementations are known to
this context, you can also put them in the adapter folder. Each interface can have multiple implementations, e.g. a rest
implementation and a mock implementation for early development.

```
adapter/
├─ mock/
│  ├─ ExampleMockRepository.ts
├─ rest/
│  ├─ ExampleRestRepository.ts
├─ ExampleRepository.ts
```

If the implementation of a repository requires imports that would violate context bounds, you can provide only an
interface and inject an implementation from outside your context.

### The `assets/` folder

This folder contains assets like css files, images or fonts.

### The `components/` folder

The `components/` folder contains your vue components for this context. These components may only be imported by other
components and views from this context. If you need to use a component in multiple contexts, you can put it in the
`shared` context.

### The `locales/` folder

This folder contains all i18n resources for this context. Messages should be put in json files named after the locale
they represent. E.g. `de.json` for german and `en.json` english. The files are loaded automatically in the `Context.ts`
file during context initialization.

### The `services/` folder

Services are typescript classes that contain your business logic. From this point your code should be vue agnostic,
meaning you should have as few as possible imports or references to vue specific code. Also, you should move as much
code as possible from your vue components (<- representation layer) to your services. The business logic in your
services can be accessed by all vue components of your context using the `useContext()` composable:

```vue
<template>
    <div></div>
</template>
<script lang="ts" setup>
import { useContext } from '@/lib/composables';
import { Context } from './Context';

const ctx = useContext<Context>(Context);

function doStuff(): void {
    ctx.exampleService.doStuff();
}
</script>
```

In order for your services to be available like that you have to initialize them in `Context.ts`.

### The `types/` folder

This folder contains type definitions and enums.

### The `views/` folder

This folder contains your views. Each view `.vue` file should be next to `Route.ts` containing a default export with
the route config. Routes are automatically registered on the vue router during context initialization.

```
views/
├─ example/
│  ├─ ExampleView.ts
│  ├─ Route.ts
```

Routes should be defined like this:

```typescript
import type { RouteRecordRaw } from 'vue-router';
// enum containing typesafe route names
import { Routes } from '@/app/views/Routes';
// type definition for your route meta
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'i18n-key-of-your-route-title',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/example',
    name: Routes.InputComponents,
    component: () => import('./ExampleView.vue'),
    meta: routeMeta,
};

export default route;
```

### `App.vue`

This is your root vue component imported in the `main.ts`.

### `Context.ts`

The `Context.ts` file acts as a service holder object and also handles your context initialization and internal dependency
injection.

### `index.ts`

This file defines all public exports of your context. This should be the Context.ts exported with a unique name, your
custom types and adapters for external implementation.
