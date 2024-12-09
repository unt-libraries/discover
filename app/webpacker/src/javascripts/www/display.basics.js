import { togglePasswordVisibility } from './utils.js';
export class DisplayBasics {
  constructor(){
    // autorun
    if (document.readyState !== 'loading') {
      this.init();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.init();
      });
    }
  }
  init(){
    togglePasswordVisibility();
  }
}
