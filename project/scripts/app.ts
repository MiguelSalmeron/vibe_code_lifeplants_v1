/**
 * LifePlants Main Application (TypeScript)
 * 
 * Para compilar a JavaScript:
 * tsc scripts/app.ts --outFile scripts/app-compiled.js --target ES2015
 */

import type {
  Initiative,
  InvolvementOption,
  MaybeElement,
  MobileMenuConfig
} from './types';

// ========== Configuración ==========

const config = {
  selectors: {
    mobileToggle: '.header__mobile-toggle',
    nav: '.header__nav',
    heroScroll: '.hero__scroll-indicator',
    introSection: '.intro',
    initiativesGrid: '#initiativesGrid',
    involvementGrid: '#involvementGrid'
  },
  classes: {
    navOpen: 'header__nav--open',
    toggleOpen: 'header__mobile-toggle--open'
  },
  scrollBehavior: 'smooth' as ScrollBehavior
};

// ========== Estado de la Aplicación ==========

class AppState {
  private static instance: AppState;
  private _mobileMenuOpen: boolean = false;

  private constructor() {}

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  get mobileMenuOpen(): boolean {
    return this._mobileMenuOpen;
  }

  set mobileMenuOpen(value: boolean) {
    this._mobileMenuOpen = value;
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    const event = new CustomEvent('appStateChange', {
      detail: { mobileMenuOpen: this._mobileMenuOpen }
    });
    document.dispatchEvent(event);
  }
}

// ========== Utilidades DOM ==========

class DOMUtils {
  /**
   * Selecciona un elemento del DOM de forma segura
   */
  static querySelector<T extends HTMLElement>(
    selector: string,
    parent: Document | HTMLElement = document
  ): MaybeElement<T> {
    return parent.querySelector<T>(selector);
  }

  /**
   * Selecciona múltiples elementos del DOM
   */
  static querySelectorAll<T extends HTMLElement>(
    selector: string,
    parent: Document | HTMLElement = document
  ): NodeListOf<T> {
    return parent.querySelectorAll<T>(selector);
  }

  /**
   * Agrega un event listener con type safety
   */
  static addEventListener(
    element: Document | HTMLElement,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(type, listener, options);
  }

  /**
   * Toggle de clase con verificación
   */
  static toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className);
  }

  /**
   * Scroll suave a un elemento
   */
  static scrollToElement(
    element: HTMLElement,
    behavior: ScrollBehavior = 'smooth'
  ): void {
    element.scrollIntoView({ behavior });
  }
}

// ========== Componentes ==========

class MobileMenu {
  private config: MobileMenuConfig;
  private state: AppState;

  constructor() {
    this.state = AppState.getInstance();
    this.config = {
      isOpen: false,
      toggle: DOMUtils.querySelector(config.selectors.mobileToggle),
      nav: DOMUtils.querySelector(config.selectors.nav)
    };
    this.init();
  }

  private init(): void {
    if (!this.config.toggle || !this.config.nav) return;

    DOMUtils.addEventListener(this.config.toggle, 'click', () => {
      this.toggle();
    });

    DOMUtils.addEventListener(document, 'click', (event: Event) => {
      this.handleOutsideClick(event as MouseEvent);
    });
  }

  private toggle(): void {
    if (!this.config.toggle || !this.config.nav) return;

    this.config.isOpen = !this.config.isOpen;
    this.state.mobileMenuOpen = this.config.isOpen;

    DOMUtils.toggleClass(this.config.nav, config.classes.navOpen);
    DOMUtils.toggleClass(this.config.toggle, config.classes.toggleOpen);
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (!this.config.toggle || !this.config.nav || !this.config.isOpen) return;

    const target = event.target as HTMLElement;
    if (
      !this.config.toggle.contains(target) &&
      !this.config.nav.contains(target)
    ) {
      this.close();
    }
  }

  private close(): void {
    if (!this.config.toggle || !this.config.nav) return;

    this.config.isOpen = false;
    this.state.mobileMenuOpen = false;

    this.config.nav.classList.remove(config.classes.navOpen);
    this.config.toggle.classList.remove(config.classes.toggleOpen);
  }
}

class HeroScroll {
  private scrollBtn: MaybeElement;
  private targetSection: MaybeElement;

  constructor() {
    this.scrollBtn = DOMUtils.querySelector(config.selectors.heroScroll);
    this.targetSection = DOMUtils.querySelector(config.selectors.introSection);
    this.init();
  }

  private init(): void {
    if (!this.scrollBtn || !this.targetSection) return;

    DOMUtils.addEventListener(this.scrollBtn, 'click', () => {
      this.scroll();
    });
  }

  private scroll(): void {
    if (!this.targetSection) return;
    DOMUtils.scrollToElement(this.targetSection, config.scrollBehavior);
  }
}

class InitiativesRenderer {
  private container: MaybeElement;

  constructor(private data: Initiative[]) {
    this.container = DOMUtils.querySelector(config.selectors.initiativesGrid);
    this.render();
  }

  private createCard(initiative: Initiative): string {
    return `
      <article class="initiative-card">
        <div class="initiative-card__image-wrapper">
          <img src="${initiative.imageUrl}" 
               alt="${initiative.title}" 
               class="initiative-card__image"
               loading="lazy">
        </div>
        <div class="initiative-card__content">
          <h3 class="initiative-card__title">${initiative.title}</h3>
          <p class="initiative-card__description">${initiative.description}</p>
          <a href="${initiative.linkUrl}" class="initiative-card__link">
            Más información
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </a>
        </div>
      </article>
    `;
  }

  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = this.data.map(item => this.createCard(item)).join('');
  }
}

class InvolvementRenderer {
  private container: MaybeElement;
  private icons: { [key: string]: string };

  constructor(private data: InvolvementOption[]) {
    this.container = DOMUtils.querySelector(config.selectors.involvementGrid);
    this.icons = this.loadIcons();
    this.render();
  }

  private loadIcons(): { [key: string]: string } {
    return {
      heart: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
      users: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      handshake: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"></path><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path><path d="m21 3 1 11h-2"></path><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path><path d="M3 4h8"></path></svg>',
      calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>'
    };
  }

  private createCard(option: InvolvementOption): string {
    const primaryClass = option.isPrimary ? ' involvement-card--primary' : '';
    return `
      <article class="involvement-card${primaryClass}">
        <div class="involvement-card__icon">
          ${this.icons[option.icon] || ''}
        </div>
        <h3 class="involvement-card__title">${option.title}</h3>
        <p class="involvement-card__description">${option.description}</p>
        <a href="${option.buttonUrl}" class="involvement-card__button">
          ${option.buttonText}
        </a>
      </article>
    `;
  }

  private render(): void {
    if (!this.container) return;
    this.container.innerHTML = this.data.map(item => this.createCard(item)).join('');
  }
}

// ========== Aplicación Principal ==========

class App {
  private static instance: App;

  private constructor() {
    this.init();
  }

  static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  private init(): void {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      DOMUtils.addEventListener(document, 'DOMContentLoaded', () => {
        this.initializeComponents();
      });
    } else {
      this.initializeComponents();
    }
  }

  private initializeComponents(): void {
    // Inicializar componentes globales
    new MobileMenu();
    new HeroScroll();

    // Renderizar componentes si existen en la página
    this.renderPageComponents();
  }

  private renderPageComponents(): void {
    // Nota: En un proyecto real, estos datos vendrían de una API
    // Aquí asumimos que están disponibles globalmente desde data.js
    if (typeof (window as any).initiatives !== 'undefined') {
      new InitiativesRenderer((window as any).initiatives);
    }

    if (typeof (window as any).involvementOptions !== 'undefined') {
      new InvolvementRenderer((window as any).involvementOptions);
    }
  }
}

// ========== Iniciar Aplicación ==========

// Singleton pattern - solo una instancia de la app
App.getInstance();

// Export para uso en otros módulos si es necesario
export { App, MobileMenu, HeroScroll, InitiativesRenderer, InvolvementRenderer };
