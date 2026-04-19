/**
 * LifePlants Main Application (TypeScript)
 *
 * Para compilar a JavaScript:
 * tsc scripts/app.ts --outFile scripts/app-compiled.js --target ES2015
 */
import type { Initiative, InvolvementOption } from './types';
declare class MobileMenu {
    private config;
    private state;
    constructor();
    private init;
    private toggle;
    private handleOutsideClick;
    private close;
}
declare class HeroScroll {
    private scrollBtn;
    private targetSection;
    constructor();
    private init;
    private scroll;
}
declare class InitiativesRenderer {
    private data;
    private container;
    constructor(data: Initiative[]);
    private createCard;
    private render;
}
declare class InvolvementRenderer {
    private data;
    private container;
    private icons;
    constructor(data: InvolvementOption[]);
    private loadIcons;
    private createCard;
    private render;
}
declare class App {
    private static instance;
    private constructor();
    static getInstance(): App;
    private init;
    private initializeComponents;
    private renderPageComponents;
}
export { App, MobileMenu, HeroScroll, InitiativesRenderer, InvolvementRenderer };
//# sourceMappingURL=app.d.ts.map