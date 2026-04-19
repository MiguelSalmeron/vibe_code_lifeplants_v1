/**
 * TypeScript Type Definitions for LifePlants
 * 
 * Este archivo define los tipos utilizados en la aplicación.
 * Para compilar TypeScript a JavaScript:
 * 
 * 1. Instalar TypeScript: npm install -g typescript
 * 2. Compilar: tsc scripts/types.ts --outFile scripts/types.js
 */

// ========== Interfaces ==========

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

// ========== Tipos de Utilidad ==========

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

// ========== Constantes ==========

/**
 * Breakpoints responsive
 */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const;

/**
 * Duración de transiciones
 */
export const TRANSITIONS = {
  fast: 150,
  base: 250,
  slow: 350
} as const;

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
} as const;

// ========== Funciones de Tipo Guard ==========

/**
 * Verifica si un elemento es un HTMLElement válido
 */
export function isHTMLElement(element: any): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Verifica si un objeto es una Initiative válida
 */
export function isInitiative(obj: any): obj is Initiative {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.imageUrl === 'string' &&
    typeof obj.linkUrl === 'string'
  );
}

/**
 * Verifica si un objeto es una InvolvementOption válida
 */
export function isInvolvementOption(obj: any): obj is InvolvementOption {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.buttonText === 'string' &&
    typeof obj.buttonUrl === 'string' &&
    typeof obj.isPrimary === 'boolean'
  );
}

// ========== Utilidades de Tipo ==========

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
