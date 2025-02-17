import { BaseSlideView } from './base-slide-view.js'

customElements.define('background-run-view', class extends BaseSlideView {
  constructor () {
    super()
    beaker.browser.updateSetupState({profileSetup: 1})
    var checkbox = this.shadowRoot.querySelector('input')
    checkbox.checked = false
    checkbox.addEventListener('change', e => {
      beaker.browser.setSetting('run_background', checkbox.checked ? 1 : 0)
    })
  }

  render () {
    return `
<style>
:host {
  opacity: 0;
  transition: opacity 1s;
}
:host([fadein]) {
  opacity: 1;
}
:host([fadeout]) {
  opacity: 0;
}
h1 strong {
  font-size: 32px;
}
p {
  font-size: 19px;
}
img {
  display: block;
  width: 40vw;
  margin: 70px auto;
}
label {
  -webkit-app-region: no-drag;
  margin: 0 10px;
}
</style>
<h1><strong>BrainBook uses a peer-to-peer network</strong>.</h1>
<p>To help keep your data online, BrainBook can run in the background even if it's not active.</p>
<p><img src="beaker://assets/img/onboarding/setup-tray-icon.png"></p>
<hr>
<p>
  <label>
    <input type="checkbox">
    Let BrainBook run in the background
  </label>
</p>
<hr>
<a>Next</a>
    `
  }
})