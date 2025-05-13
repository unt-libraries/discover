import { onDomReady, togglePasswordVisibility } from './utils.js';
export class DisplayBasics {
  constructor(){
    // autorun
    onDomReady(() => {
      this.init();
    });
  }
  init(){
    togglePasswordVisibility();
  }
}
