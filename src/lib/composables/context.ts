import { inject } from 'vue';

export interface ContextDefinition {
    contextName: string;
}

export function useContext<T>(contextDefinition: ContextDefinition): T {
    if (!contextDefinition.contextName) {
        throw new Error('Invalid context definition!');
    }
    const ctx = inject<T>(contextDefinition.contextName);
    if (!ctx) {
        throw new Error(`Context "${contextDefinition.contextName}" is not initialized correctly!`);
    }
    return ctx;
}
