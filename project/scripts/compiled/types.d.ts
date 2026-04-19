/**
 * TypeScript Type Definitions for LifePlants
 *
 * Este archivo define los tipos utilizados en la aplicación.
 * Para compilar TypeScript a JavaScript:
 *
 * 1. Instalar TypeScript: npm install -g typescript
 * 2. Compilar: tsc scripts/types.ts --outFile scripts/types.js
 */
/**
 * Representa una iniciativa de la organización
 */
export interface Initiative {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
}
/**
 * Tipo de icono disponible
 */
export type IconType = 'heart' | 'users' | 'handshake' | 'calendar';
/**
 * Representa una opción de participación
 */
export interface InvolvementOption {
    id: string;
    title: string;
    description: string;
    icon: IconType;
    buttonText: string;
    buttonUrl: string;
    isPrimary: boolean;
}
/**
 * Colección de iconos SVG
 */
export interface Icons {
    [key: string]: string;
}
/**
 * Configuración del menú móvil
 */
export interface MobileMenuConfig {
    isOpen: boolean;
    toggle: HTMLElement | null;
    nav: HTMLElement | null;
}
/**
 * Opciones para renderizado de componentes
 */
export interface RenderOptions {
    container: HTMLElement;
    data: Initiative[] | InvolvementOption[];
    template: (item: any) => string;
}
/**
 * Tipo para elementos del DOM que pueden ser null
 */
export type MaybeElement<T extends HTMLElement = HTMLElement> = T | null;
/**
 * Tipo para callbacks de eventos
 */
export type EventCallback = (event: Event) => void;
/**
 * Configuración de navegación
 */
export interface NavigationConfig {
    smooth: boolean;
    offset: number;
}
/**
 * Breakpoints responsive
 */
export declare const BREAKPOINTS: {
    readonly mobile: 768;
    readonly tablet: 1024;
    readonly desktop: 1200;
};
/**
 * Duración de transiciones
 */
export declare const TRANSITIONS: {
    readonly fast: 150;
    readonly base: 250;
    readonly slow: 350;
};
/**
 * Z-index layers
 */
export declare const Z_INDEX: {
    readonly dropdown: 1000;
    readonly sticky: 1020;
    readonly fixed: 1030;
    readonly modalBackdrop: 1040;
    readonly modal: 1050;
    readonly popover: 1060;
    readonly tooltip: 1070;
};
/**
 * Verifica si un elemento es un HTMLElement válido
 */
export declare function isHTMLElement(element: any): element is HTMLElement;
/**
 * Verifica si un objeto es una Initiative válida
 */
export declare function isInitiative(obj: any): obj is Initiative;
/**
 * Verifica si un objeto es una InvolvementOption válida
 */
export declare function isInvolvementOption(obj: any): obj is InvolvementOption;
/**
 * Hace que todas las propiedades sean opcionales recursivamente
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Hace que todas las propiedades sean readonly recursivamente
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
/**
 * Extrae los tipos de un array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
//# sourceMappingURL=types.d.ts.map