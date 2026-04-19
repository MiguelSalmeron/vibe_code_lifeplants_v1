/**
 * TypeScript Type Definitions for LifePlants
 *
 * Este archivo define los tipos utilizados en la aplicación.
 * Para compilar TypeScript a JavaScript:
 *
 * 1. Instalar TypeScript: npm install -g typescript
 * 2. Compilar: tsc scripts/types.ts --outFile scripts/types.js
 */
// ========== Constantes ==========
/**
 * Breakpoints responsive
 */
export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
};
/**
 * Duración de transiciones
 */
export const TRANSITIONS = {
    fast: 150,
    base: 250,
    slow: 350
};
/**
 * Z-index layers
 */
export const Z_INDEX = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
};
// ========== Funciones de Tipo Guard ==========
/**
 * Verifica si un elemento es un HTMLElement válido
 */
export function isHTMLElement(element) {
    return element instanceof HTMLElement;
}
/**
 * Verifica si un objeto es una Initiative válida
 */
export function isInitiative(obj) {
    return (typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        typeof obj.imageUrl === 'string' &&
        typeof obj.linkUrl === 'string');
}
/**
 * Verifica si un objeto es una InvolvementOption válida
 */
export function isInvolvementOption(obj) {
    return (typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        typeof obj.icon === 'string' &&
        typeof obj.buttonText === 'string' &&
        typeof obj.buttonUrl === 'string' &&
        typeof obj.isPrimary === 'boolean');
}
//# sourceMappingURL=types.js.map