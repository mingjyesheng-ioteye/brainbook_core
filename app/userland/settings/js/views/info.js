import { LitElement, html } from 'lit'
import viewCSS from '../../css/views/general.css.js'

class InfoSettingsView extends LitElement {
  static get properties () {
    return {
      isVersionsExpanded: {type: Boolean}
    }
  }

  static get styles () {
    return viewCSS
  }

  constructor () {
    super()
    this.browserInfo = undefined
    this.daemonStatus = undefined
    this.isVersionsExpanded = false
  }

  async load () {
    this.browserInfo = await beaker.browser.getInfo()
    this.daemonStatus = false
    console.log('loaded', {
      browserInfo: this.browserInfo,
      daemonStatus: this.daemonStatus
    })
    this.requestUpdate()
  }

  // rendering
  // =

  render () {
    if (!this.browserInfo) return html``
    return html`
      <link rel="stylesheet" href="beaker://assets/font-awesome.css">
      <div class="section">
        <h2 id="information" class="subtitle-heading">About BrainBook</h2>
        <p>
          <strong>Version</strong>:
          ${this.browserInfo.version}
          <button class="transparent" @click=${e => {this.isVersionsExpanded = !this.isVersionsExpanded}} style="padding: 4px 4px 3px">
            <span class="far fa-${this.isVersionsExpanded ? 'minus' : 'plus'}-square"></span>
          </button>
        </p>
        ${this.isVersionsExpanded ? html`
          <ul class="versions">
            <li><strong>Electron:</strong> ${this.browserInfo.electronVersion}</li>
            <li><strong>Chromium:</strong> ${this.browserInfo.chromiumVersion}</li>
            <li><strong>Node:</strong> ${this.browserInfo.nodeVersion}</li>
          </ul>
        ` : ''}
        <p><strong>User data</strong>: ${this.browserInfo.paths.userData}</p>
      </div>
    `
  }
}
customElements.define('info-settings-view', InfoSettingsView)