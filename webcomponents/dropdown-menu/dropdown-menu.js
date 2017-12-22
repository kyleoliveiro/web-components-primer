// Wrap our script in an IIFE for scoping
(function() {

  // When a script block of an imported document is executed,
  // `document` refers to the importing document,not the imported document.
  // In our case though, we want to get the template in the imported document
  // (ourself). We do that by using `document.currentScript.ownerDocument`.
  const importedDocument = document.currentScript.ownerDocument;

  // Keycodes for keyboard interaction
  const KEYCODES = {
    ESC   : 27,
    LEFT  : 37,
    UP    : 38,
    RIGHT : 39,
    DOWN  : 40
  };

  class DropdownMenu extends HTMLElement {
    
    // When the element's `button-text` or `disabled` attributes 
    // change, `attributeChangedCallback()` is called.
    static get observedAttributes() {
      return ['button-text', 'disabled'];
    }
    
    ///
    // Define getters and setters for each attribute
    ///
    get buttonText() {
      return this.getAttribute('button-text') || 'Menu';
    }
    
    set buttonText(val) {
      this.setAttribute('button-text', val);
    }
    
    get disabled() {
      return this.hasAttribute('disabled');
    }
    
    set disabled(val) {
      // Reflect the value of the disabled property as a HTML attribute.
      if (val) {
        this.setAttribute('disabled', '');
      } else {
        this.removeAttribute('disabled');
      }
    }
    
    // `constructor()` is called when
    // the element is created.
    constructor() {

      // Always call `super()` in the `constructor()`.
      super();

      // Create and attach the Shadow DOM
      const shadow = this.attachShadow({mode: 'open'});

      // Clone and append the `<template>` contents into the Shadow DOM
      const template = importedDocument.querySelector('template');
      const clone = template.content.cloneNode(true)
      shadow.appendChild(clone);

      // Initialise the Custom Element state
      this.state = {
        isMenuOpen: false
      };
      
      // Cache references to ShadowDOM children
      this.$button = shadow.getElementById('button');
      this.$menu   = shadow.getElementById('menu');

      // Attach the click event for the toggle button
      this.$button.addEventListener('click', () => {
        this._toggleMenu();
      });

      // Add initial aria attributes
      if (!this.hasAttribute('aria-expanded')) this.setAttribute('aria-expanded', false);
    }
    
    // `connectedCallback()` is called when
    // the element is added to the DOM.
    connectedCallback() {
      this._renderButton();
    }
    
    // `attributeChangedCallback()` is called when 
    // one of the element's `observedAttributes` changes.
    attributeChangedCallback(name, oldVal, newVal) {

      // Use a `switch` statement to do different things
      // based on the attribute that changed.
      switch(name) {
        case 'button-text':
          this._renderButton();
          break;
        case 'disabled':
          if(this.disabled) this._closeMenu();
          this._renderButton();
          break;
      }
      
    }
    
    // `disconnectedCallback()` is called when
    // the element is removed from the DOM.
    disconnectedCallback() {
    }
    
    ///
    // In addition to the lifecycle callbacks, 
    // we can also define our own internal methods:
    ///
    _renderButton() {
      // Update the button text
      this.$button.textContent = this.buttonText;

      // Set the button state
      if(this.disabled) {
        this.$button.disabled = true;
      } else {
        this.$button.disabled = false;
      }
    }

    _toggleMenu() {
      // Toggle the menu based on current state
      if(this.state.isMenuOpen) {
        this._closeMenu();
      } else {
        this._openMenu();
      }
    }

    _openMenu() {
      // Update aria attributes
      this.setAttribute('aria-expanded', true);
      this.$button.setAttribute('aria-pressed', true);

      // Unhide the menu
      this.$menu.hidden = false;

      // Bind keydown events to make menu keyboard accessible
      this.addEventListener('keydown', this._handleMenuKeydown.bind(this));

      // Close the menu if a click event is receive anywhere outside of the Custom Element
      document.addEventListener('click', this._handleClickOutsideMenu.bind(this));

      // Update state
      this.state.isMenuOpen = true;
    }

    _closeMenu() {
      // Update aria attributes
      this.setAttribute('aria-expanded', false);
      this.$button.setAttribute('aria-pressed', false);

      // Unhide the menu
      this.$menu.hidden = true;

      // Remove previously assigned event listeners
      this.removeEventListener('keydown', this._handleMenuKeydown);
      this.removeEventListener('click', this._handleClickOutsideMenu);

      // Update state
      this.state.isMenuOpen = false;
    }

    _handleMenuKeydown(event) {
      switch(event.keyCode) {
        case KEYCODES.ESC :
          this._closeMenu();
          break;
      }
    }

    _handleClickOutsideMenu(event) {
      if(event.target !== this) this._closeMenu();
    }

  }

  // Finally, register the Custom Element with `customElements.define()`
  // so we can use the custom `<popout-menu>` element in our HTML.
  customElements.define('dropdown-menu', DropdownMenu);
})();
