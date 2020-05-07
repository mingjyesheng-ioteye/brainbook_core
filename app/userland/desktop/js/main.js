import { LitElement, html } from 'beaker://app-stdlib/vendor/lit-element/lit-element.js'
import { repeat } from 'beaker://app-stdlib/vendor/lit-element/lit-html/directives/repeat.js'
import * as contextMenu from 'beaker://app-stdlib/js/com/context-menu.js'
import { EditBookmarkPopup } from 'beaker://library/js/com/edit-bookmark-popup.js'
import { AddContactPopup } from 'beaker://library/js/com/add-contact-popup.js'
import { AddLinkPopup } from './com/add-link-popup.js'
import { AddPostPopup } from './com/add-post-popup.js'
import * as toast from 'beaker://app-stdlib/js/com/toast.js'
import { writeToClipboard } from 'beaker://app-stdlib/js/clipboard.js'
import { joinPath, pluralize } from 'beaker://app-stdlib/js/strings.js'
import * as desktop from './lib/desktop.js'
import * as addressBook from './lib/address-book.js'

import 'beaker://library/js/views/drives.js'
import 'beaker://library/js/views/bookmarks.js'
import 'beaker://library/js/views/address-book.js'
import css from '../css/main.css.js'

var cacheBuster = Date.now()

class DesktopApp extends LitElement {
  static get properties () {
    return {
      pins: {type: Array},
      profile: {type: Object},
      currentNav: {type: String},
      filter: {type: String},
      isIntroActive: {type: Boolean},
      legacyArchives: {type: Array}
    }
  }

  static get styles () {
    return css
  }

  constructor () {
    super()
    this.profile = undefined
    this.pins = []
    this.currentNav = 'drives'
    this.filter = ''
    this.isIntroActive = false
    this.legacyArchives = []
    this.load()
    
    if (!('isIntroHidden' in localStorage)) {
      this.isIntroActive = true
    }

    window.addEventListener('focus', e => {
      this.load()
    })
    this.addEventListener('update-pins', async (e) => {
      this.pins = await desktop.load()
    })
  }

  async load () {
    cacheBuster = Date.now()
    await this.requestUpdate()
    Array.from(this.shadowRoot.querySelectorAll('[loadable]'), el => el.load())
    ;[this.profile, this.pins] = await Promise.all([
      addressBook.loadProfile(),
      desktop.load()
    ])
    console.log(this.pins)
    this.legacyArchives = await beaker.datLegacy.list()
  }

  // rendering
  // =

  render () {
    const navItem = (id, label) => html`<a class=${id === this.currentNav ? 'active' : ''} @click=${e => {this.currentNav = id}}>${label}</a>`
    const hiddenCls = id => this.currentNav === id ? '' : 'hidden'
    return html`
      <link rel="stylesheet" href="beaker://assets/font-awesome.css">
      <div id="topleft">
        ${this.profile ? html`
          <a class="profile-ctrl" href=${this.profile.url}>
            <beaker-img-fallbacks>
              <img src="${this.profile.url}/thumb?cache_buster=${cacheBuster}" slot="img1">
              <img src="beaker://assets/default-user-thumb" slot="img2">
            </beaker-img-fallbacks>
            <span>${this.profile.title}</span>
          </a>
        ` : ''}
      </div>
      <div id="topright">
        <a href="beaker://settings/" title="Settings"><span class="fas fa-cog"></span></a>
      </div>
      ${this.renderFiles()}
      <nav>
        ${navItem('drives', 'My Drives')}
        ${navItem('bookmarks', 'Bookmarks')}
        ${navItem('address-book', 'Address Book')}
        <a @click=${this.onClickNavMore} title="More"><span class="fas fa-fw fa-ellipsis-h"></span></a>
        <span class="spacer"></span>
        ${this.currentNav !== 'feed' ? html`
          <div class="search-ctrl">
            <span class="fas fa-search"></span>
            <input @keyup=${e => {this.filter = e.currentTarget.value.toLowerCase()}}>
          </div>
        ` : ''}
        ${this.currentNav === 'feed' ? html`
          <a class="new-btn" @click=${this.onClickSyncFeed}><span class="fas fa-sync"></span> Sync Feed</a>
          <a class="new-btn" @click=${this.onClickNewPost}><span class="fas fa-plus"></span> New Post</a>
        ` : ''}
        ${this.currentNav === 'drives' ? html`
          <a class="new-btn" @click=${this.onClickNewDrive}><span class="fas fa-plus"></span> New Drive</a>
        ` : ''}
        ${this.currentNav === 'bookmarks' ? html`
          <a class="new-btn" @click=${e => this.onClickNewBookmark(e, false)}><span class="fas fa-plus"></span> New Bookmark</a>
        ` : ''}
        ${this.currentNav === 'address-book' ? html`
          <a class="new-btn" @click=${this.onClickNewContact}><span class="fas fa-plus"></span> New Contact</a>
        ` : ''}
      </nav>
      <drives-view class="top-border ${hiddenCls('drives')}" loadable ?hide-empty=${!!this.filter || this.isIntroActive} .filter=${this.filter}></drives-view>
      <bookmarks-view class="top-border ${hiddenCls('bookmarks')}" loadable ?hide-empty=${!!this.filter || this.isIntroActive} .filter=${this.filter}></bookmarks-view>
      <address-book-view class="top-border ${hiddenCls('address-book')}" loadable ?hide-empty=${!!this.filter || this.isIntroActive} other-only .filter=${this.filter}></address-book-view>
      ${this.renderIntro()}
      ${this.renderLegacyArchivesNotice()}
    `
  }

  renderFiles () {
    var pins = this.pins || []
    return html`
      <div class="pins">
        <a class="add" @click=${e => this.onClickNewBookmark(e, true)}>
          <span class="fas fa-fw fa-plus"></span>
        </a>
        ${repeat(pins, pin => getHref(pin), pin => html`
          <a
            class="pin"
            href=${getHref(pin)}
            @contextmenu=${e => this.onContextmenuFile(e, pin)}
          >
            <div class="thumb-wrapper">
              <img src=${'asset:screenshot-180:' + getHref(pin)} class="thumb"/>
            </div>
            <div class="details">
              <div class="title">${getTitle(pin)}</div>
            </div>
          </a>
        `)}
      </div>
    `
  }

  renderIntro () {
    if (!this.isIntroActive) {
      return ''
    }
    return html`
      <div class="intro">
        <a class="close" @click=${this.onClickCloseIntro}><span class="fas fa-times"></span></a>
        <h3>Welcome to Beaker!</h3>
        <h5>Let's set up your network and get you familiar with Beaker.</h5>
        <div class="col3">
          <div>
            ${this.profile ? html`
              <a href=${this.profile.url} target="_blank">
                <beaker-img-fallbacks class="avatar">
                  <img src="${this.profile.url}/thumb?cache_buster=${cacheBuster}" slot="img1">
                  <img src="beaker://assets/default-user-thumb" slot="img2">
                </beaker-img-fallbacks>
              </a>
            ` : ''}
            <h4>1. Customize your profile</h4>
            <p class="help-link">
              <a href="https://beaker-browser.gitbook.io/docs/joining-the-social-network#customizing-your-profile-drive" target="_blank">
                <span class="fas fa-fw fa-info-circle"></span> Get help with this step
              </a>
            </p>
          </div>
          <div>
            <a class="icon" href="https://userlist.beakerbrowser.com" target="_blank">
              <span class="fas fa-user-plus"></span>
            </a>
            <h4>2. Add yourself to the directory</h4>
            <p class="help-link">
              <a href="https://beaker-browser.gitbook.io/docs/joining-the-social-network#finding-other-users" target="_blank">
                <span class="fas fa-fw fa-info-circle"></span> Get help with this step
              </a>
            </p>
          </div>
          <div>
            <a class="icon" href="https://beaker.dev/docs/templates/microblog-feed/" target="_blank">
              <span class="fas fa-stream"></span>
            </a>
            <h4>3. Set up your feed app</h4>
            <p class="help-link">
              <a href="https://beaker-browser.gitbook.io/docs/joining-the-social-network#set-up-your-feed-app" target="_blank">
                <span class="fas fa-fw fa-info-circle"></span> Get help with this step
              </a>
            </p>
          </div>
        </div>
        <div class="col1">
          <a class="icon" href="https://beaker-browser.gitbook.io/docs/getting-started-with-beaker" target="_blank">
            <span class="fas fa-book"></span>
          </a>
          <h4>4. Read the <a href="https://beaker-browser.gitbook.io/docs/getting-started-with-beaker" target="_blank">Getting Started Guide</a>.</h4>
        </div>
      </div>
    `
  }

  renderLegacyArchivesNotice () {
    if (this.legacyArchives.length === 0) {
      return ''
    }
    console.log(this.legacyArchives)
    return html`
      <div class="legacy-archives-notice">
        <details>
          <summary>You have ${this.legacyArchives.length} legacy Dat ${pluralize(this.legacyArchives.length, 'archive')} which can be converted to Hyperdrive.</summary>
          <div class="archives">
          ${this.legacyArchives.map(archive => html`
            <div class="archive">
              <a href="dat://${archive.key}" title=${archive.title} target="_blank">${archive.title || archive.key}</a>
              <button @click=${e => this.onClickRemoveLegacyArchive(e, archive)}>Remove</button>
            </div>
          `)}
          </div>
        </details>
      </div>
    `
  }

  // events
  // =

  onClickCloseIntro (e) {
    this.isIntroActive = false
    localStorage.isIntroHidden = 1
  }

  onClickNavMore (e) {
    var rect = e.currentTarget.getClientRects()[0]
    e.preventDefault()
    e.stopPropagation()
    const items = [
      {icon: 'fas fa-share-alt', label: 'Hosting', click: () => { window.location = `beaker://library/hosting` }}
    ]
    contextMenu.create({x: rect.left, y: rect.bottom, noBorders: true, roomy: true, items, fontAwesomeCSSUrl: 'beaker://assets/font-awesome.css'})
  }

  async onClickSyncFeed (e) {
    toast.create('Syncing...')
    await this.shadowRoot.querySelector('feed-view').forceLoad()
    toast.destroy()
    toast.create('Feed Synced', '', 2e3)
  }

  async onClickNewPost (e) {
    try {
      let post = await AddPostPopup.create()
      post.filename = post.filename || `${Date.now()}.md`
      if (/\.(md|txt|htm|html)$/i.test(post.filename) === false) post.filename += '.md'
      await beaker.hyperdrive.drive(this.profile.url).writeFile(joinPath('microblog', post.filename), post.body)
      toast.create('Post published', '', 3e3)
    } catch (e) {
      // ignore, user probably cancelled
      console.log(e)
      return
    }
    await this.shadowRoot.querySelector('feed-view').forceLoad()
  }

  async onClickNewDrive (e) {
    var drive = await beaker.hyperdrive.createDrive()
    window.location = drive.url
  }

  async onClickNewBookmark (e, pinned) {
    try {
      await desktop.createLink(await AddLinkPopup.create(), pinned)
      toast.create('Link added', '', 10e3)
    } catch (e) {
      // ignore, user probably cancelled
      console.log(e)
      return
    }
    this.load()
  }

  async onClickNewContact (e) {
    try {
      await AddContactPopup.create()
      toast.create('Contact added', '', 10e3)
    } catch (e) {
      // ignore
      console.log(e)
    }
    this.load()
  }

  async onContextmenuFile (e, file) {
    e.preventDefault()
    const items = [
      {icon: 'fa fa-external-link-alt', label: 'Open Link in New Tab', click: () => window.open(getHref(file))},
      {icon: 'fa fa-link', label: 'Copy Link Address', click: () => writeToClipboard(getHref(file))},
      (file.isFixed) ? undefined : '-',
      (file.isFixed) ? undefined : {icon: 'fa fa-pencil-alt', label: 'Edit', click: () => this.onClickEdit(file)},
      (file.isFixed) ? undefined : {icon: 'fa fa-times', label: 'Unpin', click: () => this.onClickRemove(file)}
    ].filter(Boolean)
    await contextMenu.create({x: e.clientX, y: e.clientY, noBorders: true, roomy: true, items, fontAwesomeCSSUrl: 'beaker://assets/font-awesome.css'})
  }

  async onClickEdit (file) {
    try {
      await EditBookmarkPopup.create(file)
      this.load()
    } catch (e) {
      // ignore
      console.log(e)
    }
  }

  async onClickRemove (file) {
    await beaker.hyperdrive.deleteMetadata(`hyper://system/bookmarks/${file.name}`, 'pinned')
    toast.create('Bookmark unpinned', '', 10e3)
    this.load()
  }

  async onClickRemoveLegacyArchive (e, archive) {
    e.preventDefault()
    await beaker.datLegacy.remove(archive.key)
    this.legacyArchives.splice(this.legacyArchives.indexOf(archive), 1)
    toast.create('Archive removed')
    this.requestUpdate()
  }
}

customElements.define('desktop-app', DesktopApp)

// internal
// =

function getHref (file) {
  if (file.name.endsWith('.goto')) return file.stat.metadata.href
  return `hyper://system/bookmarks/${file.name}`
}

function getTitle (file) {
  return file.stat.metadata.title || file.name
}