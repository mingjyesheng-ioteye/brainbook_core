import { app, BrowserWindow, dialog, Menu } from 'electron'
import { createShellWindow, getActiveWindow, ICON_PATH } from './windows'
import { getEnvVar } from '../lib/env'
import * as tabManager from './tabs/manager'
import * as viewZoom from './tabs/zoom'
import * as shellMenus from './subwindows/shell-menus'
import { download } from './downloads'
import * as settingsDb from '../dbs/settings'
// globals
// =
const package_name = require(__dirname+'/package.json').name
var currentMenuTemplate
// exported APIs
// =

/**
 * Modules to control application life without exposing browser functions for non-developer users
*/
/* global __dirname, process */
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const URL = require('url');

export function setup () {
  setApplicationMenu({noWindows: true})

  // watch for changes to the currently active window
  app.on('browser-window-focus', async (e, win) => {
    try {
      setApplicationMenu()
    } catch (e) {
      // `pages` not set yet
    }
  })

  // watch for all windows to be closed
  app.on('custom-window-all-closed', () => {
    setApplicationMenu({noWindows: true})
  })

  // watch for any window to be opened
  app.on('browser-window-created', () => {
    setApplicationMenu()
  })
}

export function onSetCurrentLocation (win) {
  // check if this is the currently focused window
  if (win !== BrowserWindow.getFocusedWindow()) {
    return
  }
  setApplicationMenu()
}

export function setApplicationMenu (opts = {}) {
  currentMenuTemplate = buildWindowMenu(opts)
  Menu.setApplicationMenu(Menu.buildFromTemplate(currentMenuTemplate))
}

export function buildWindowMenu (opts = {}) {
  var win = opts.noWindows ? undefined : opts.win ? opts.win : getActiveWindow()
  if (win && win.isDestroyed()) win = undefined
  const noWindows = !win
  const tab = !noWindows && win ? tabManager.getActive(win) : undefined
  const url = tab?.url || tab?.loadingURL || ''

  var darwinMenu = {
    label: 'BrainBook',
    submenu: [
      {
        label: 'Preferences',
        accelerator: 'Cmd+,',
        click (item) {
          if (win) tabManager.create(win, 'beaker://settings', {setActive: true})
          else createShellWindow({ pages: ['beaker://settings'] })
        }
      },
      { type: 'separator' },
      { label: 'Services', role: 'services', submenu: [] },
      { type: 'separator' },
      { label: 'Hide BrainBook', accelerator: 'Cmd+H', role: 'hide' },
      { label: 'Hide Others', accelerator: 'Cmd+Alt+H', role: 'hideothers' },
      { label: 'Show All', role: 'unhide' },
      { type: 'separator' },
      {
        id: 'quit',
        label: 'Quit',
        accelerator: 'Cmd+Q',
        async click () {
          var runBackground = await settingsDb.get('run_background')
          if (runBackground == 1) {
            for (let win of BrowserWindow.getAllWindows()) {
              win.close()
            }
          } else {
            app.quit()
          }
        },
        reserved: true
      }
    ]
  }

  var editMenu = {
    label: 'Edit',
    submenu: [
      { id: 'undo', label: 'Undo', enabled: !noWindows, accelerator: 'CmdOrCtrl+Z', selector: 'undo:', reserved: true },
      { id: 'redo', label: 'Redo', enabled: !noWindows, accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:', reserved: true },
      { type: 'separator' },
      { id: 'cut', label: 'Cut', enabled: !noWindows, accelerator: 'CmdOrCtrl+X', selector: 'cut:', reserved: true },
      { id: 'copy', label: 'Copy', enabled: !noWindows, accelerator: 'CmdOrCtrl+C', selector: 'copy:', reserved: true },
      { id: 'paste', label: 'Paste', enabled: !noWindows, accelerator: 'CmdOrCtrl+V', selector: 'paste:', reserved: true },
      { id: 'selectAll', label: 'Select All', enabled: !noWindows, accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
      { type: 'separator' },
      {
        id: 'findInPage',
        label: 'Find in Page',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+F',
        click: function (item) {
          if (tab) tab.showInpageFind()
        }
      },
      {
        id: 'findNext',
        label: 'Find Next',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+G',
        click: function (item) {
          if (tab) tab.moveInpageFind(1)
        }
      },
      {
        id: 'findPrevious',
        label: 'Find Previous',
        enabled: !noWindows,
        accelerator: 'Shift+CmdOrCtrl+G',
        click: function (item) {
          if (tab) tab.moveInpageFind(-1)
        }
      }
    ]
  }

  var viewMenu = {
    label: 'View',
    submenu: [
      {
        id: 'reload',
        label: 'Reload',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+R',
        click: function (item) {
          if (tab) tab.webContents.reload()
        },
        reserved: true
      },
      {
        id: 'hardReload',
        label: 'Hard Reload (Clear Cache)',
        accelerator: 'CmdOrCtrl+Shift+R',
        enabled: !noWindows,
        click: function (item) {
          if (tab) tab.webContents.reloadIgnoringCache()
        },
        reserved: true
      },
      {type: 'separator'},
      {
        id: 'zoomIn',
        label: 'Zoom In',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Plus',
        reserved: true,
        click: function (item) {
          if (tab) viewZoom.zoomIn(tab)
        }
      },
      {
        id: 'zoomOut',
        label: 'Zoom Out',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+-',
        reserved: true,
        click: function (item) {
          if (tab) viewZoom.zoomOut(tab)
        }
      },
      {
        id: 'actualSize',
        label: 'Actual Size',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+0',
        click: function (item) {
          if (tab) viewZoom.zoomReset(tab)
        }
      },
      {type: 'separator'},
      {
        id: 'splitPaneVertical',
        label: 'Split Pane Vertically',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+E',
        click () {
          if (tab && tab.activePane) {
            tab.splitPane(tab.activePane, 'vert')
          }
        }
      },
      {
        id: 'splitPaneHorizontal',
        label: 'Split Pane Horizontally',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Shift+E',
        click () {
          if (tab && tab.activePane) {
            tab.splitPane(tab.activePane, 'horz')
          }
        }
      },
      {type: 'separator'},
      {
        id: 'selectPaneUp',
        label: 'Select Pane Up',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Up`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('up')
          }
        }
      },
      {
        id: 'selectPaneDown',
        label: 'Select Pane Down',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Down`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('down')
          }
        }
      },
      {
        id: 'selectPaneLeft',
        label: 'Select Pane Left',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Left`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('left')
          }
        }
      },
      {
        id: 'selectPaneRight',
        label: 'Select Pane Right',
        enabled: !noWindows,
        accelerator: `${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Right`,
        click () {
          if (tab && tab.activePane) {
            tab.activateAdjacentPane('right')
          }
        }
      },
      {type: 'separator'},
      {
        id: 'movePaneUp',
        label: 'Move Pane Up',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Up`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'up')
          }
        }
      },
      {
        id: 'movePaneDown',
        label: 'Move Pane Down',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Down`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'down')
          }
        }
      },
      {
        id: 'movePaneLeft',
        label: 'Move Pane Left',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Left`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'left')
          }
        }
      },
      {
        id: 'movePaneRight',
        label: 'Move Pane Right',
        enabled: !noWindows,
        accelerator: `Shift+${(process.platform !== 'darwin') ? 'Ctrl+Alt' : 'Ctrl+Cmd'}+Right`,
        click () {
          if (tab && tab.activePane) {
            tab.movePane(tab.activePane, 'right')
          }
        }
      }
    ]
  }

  var showHistoryAccelerator = 'Ctrl+H'

  if (process.platform === 'darwin') {
    showHistoryAccelerator = 'Cmd+Y'
  }

  var historyMenu = {
    label: 'History',
    role: 'history',
    submenu: [
      {
        id: 'back',
        label: 'Back',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Left',
        click: function (item) {
          if (tab) tab.webContents.goBack()
        }
      },
      {
        id: 'forward',
        label: 'Forward',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+Right',
        click: function (item) {
          if (tab) tab.webContents.goForward()
        }
      },
      {
        id: 'showFullHistory',
        label: 'Show Full History',
        accelerator: showHistoryAccelerator,
        click: function (item) {
          if (win) tabManager.create(win, 'beaker://history', {setActive: true})
          else createShellWindow({ pages: ['beaker://history'] })
        }
      },
      { type: 'separator' },
      {
        id: 'bookmarkThisPage',
        label: 'Bookmark this Page',
        enabled: !noWindows,
        accelerator: 'CmdOrCtrl+D',
        click: function (item) {
          if (win) win.webContents.send('command', 'create-bookmark')
        }
      }
    ]
  }

  const gotoTabShortcut = index => ({
    label: `Tab ${index}`,
    enabled: !noWindows,
    accelerator: `CmdOrCtrl+${index}`,
    click: function (item) {
      if (win) {
        shellMenus.hide(win) // HACK: closes the background tray if it's open
        tabManager.setActive(win, index - 1)
      }
    }
  })

  var windowMenu = {
    label: 'Window',
    role: 'window',
    submenu: [
      // {
      //   id: 'newTab',
      //   label: 'New Tab',
      //   accelerator: 'CmdOrCtrl+T',
      //   click: function (item) {
      //     if (win) {
      //       tabManager.create(win, undefined, {setActive: true, focusLocationBar: true})
      //     } else {
      //       createShellWindow()
      //     }
      //   },
      //   reserved: true
      // },
      {
        id: 'newWindow',
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: function () { createShellWindow() },
        reserved: true
      }
      // {
      //   id: 'reopenClosedTab',
      //   label: 'Reopen Closed Tab',
      //   accelerator: 'CmdOrCtrl+Shift+T',
      //   click: function (item) {
      //     createWindowIfNone(win, (win) => {
      //       tabManager.reopenLastRemoved(win)
      //     })
      //   },
      //   reserved: true
      // }
      // {
      //   id: 'reopenClosedTab',
      //   label: 'Reopen Closed Tab',
      //   accelerator: 'CmdOrCtrl+Shift+T',
      //   click: function (item) {
      //     createWindowIfNone(win, (win) => {
      //       tabManager.reopenLastRemoved(win)
      //     })
      //   },
      //   reserved: true
      // },
      // {
      //   id: 'closeTab',
      //   label: 'Close Tab',
      //   enabled: !noWindows,
      //   accelerator: 'CmdOrCtrl+W',
      //   click: function (item) {
      //     if (win) {
      //       // a regular browser window
      //       let active = tabManager.getActive(win)
      //       if (active) active.removePane(active.activePane)
      //     } else {
      //       // devtools
      //       let wc = getFocusedDevToolsHost()
      //       if (wc) {
      //         wc.closeDevTools()
      //       }
      //     }
      //   },
      //   reserved: true
      // },
      // {
      //   id: 'closeWindow',
      //   label: 'Close Window',
      //   enabled: !noWindows,
      //   accelerator: 'CmdOrCtrl+Shift+W',
      //   click: function (item) {
      //     if (win) win.close()
      //   },
      //   reserved: true
      // },
      // {type: 'separator'},
      // {
      //   id: 'nextTab',
      //   label: 'Next Tab',
      //   enabled: !noWindows,
      //   accelerator: (process.platform === 'darwin') ? 'Alt+CmdOrCtrl+Right' : 'CmdOrCtrl+PageDown',
      //   click: function (item) {
      //     if (win) tabManager.changeActiveBy(win, 1)
      //   }
      // },
      // {
      //   id: 'previousTab',
      //   label: 'Previous Tab',
      //   enabled: !noWindows,
      //   accelerator: (process.platform === 'darwin') ? 'Alt+CmdOrCtrl+Left' : 'CmdOrCtrl+PageUp',
      //   click: function (item) {
      //     if (win) tabManager.changeActiveBy(win, -1)
      //   }
      // },
      // {
      //   label: 'Tab Shortcuts',
      //   type: 'submenu',
      //   submenu: [
      //     gotoTabShortcut(1),
      //     gotoTabShortcut(2),
      //     gotoTabShortcut(3),
      //     gotoTabShortcut(4),
      //     gotoTabShortcut(5),
      //     gotoTabShortcut(6),
      //     gotoTabShortcut(7),
      //     gotoTabShortcut(8),
      //     {
      //       label: `Last Tab`,
      //       enabled: !noWindows,
      //       accelerator: `CmdOrCtrl+9`,
      //       click: function (item) {
      //         if (win) tabManager.setActive(win, tabManager.getAll(win).slice(-1)[0])
      //       }
      //     }
      //   ]
      // },
      // {
      //   id: 'popOutTab',
      //   label: 'Pop Out Tab',
      //   enabled: !noWindows,
      //   accelerator: 'Shift+CmdOrCtrl+P',
      //   click: function (item) {
      //     if (tab) tabManager.popOutTab(tab)
      //   }
      // },
      // { type: 'separator' },
      // {
      //   id: 'toggleAlwaysOnTop',
      //   type: 'checkbox',
      //   label: 'Always on Top',
      //   checked: (win ? win.isAlwaysOnTop() : false),
      //   click: function () {
      //     if (win) win.setAlwaysOnTop(!win.isAlwaysOnTop())
      //   }
      // },
      // {
      //   label: 'Minimize',
      //   accelerator: 'CmdOrCtrl+M',
      //   role: 'minimize'
      // },
      // {
      //   id: 'toggleFullScreen',
      //   label: 'Full Screen',
      //   enabled: !noWindows,
      //   accelerator: (process.platform === 'darwin') ? 'Ctrl+Cmd+F' : 'F11',
      //   role: 'toggleFullScreen',
      //   click: function () {
      //     if (win) {
      //       win.setFullScreen(!win.isFullScreen())
      //     }
      //   }
      // },
      // {
      //   id: 'toggleBrowserUi',
      //   label: 'Toggle Browser UI',
      //   enabled: !noWindows,
      //   accelerator: 'CmdOrCtrl+Shift+H',
      //   click: function (item) {
      //     if (win) toggleShellInterface(win)
      //   }
      // },
      // {
      //   id: 'focusLocationBar',
      //   label: 'Focus Location Bar',
      //   accelerator: 'CmdOrCtrl+L',
      //   click: function (item) {
      //     createWindowIfNone(win, (win) => {
      //       win.webContents.send('command', 'focus-location')
      //     })
      //   }
      // }
    ]
  }
  if (process.platform == 'darwin') {
    windowMenu.submenu.push({
      type: 'separator'
    })
    windowMenu.submenu.push({
      label: 'Bring All to Front',
      role: 'front'
    })
  }

  var helpMenu = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        id: 'beakerHelp',
        label: 'BrainBook Help',
        accelerator: 'F1',
        click: function (item) {
          if (win) {
            tabManager.create(win, "https://brainbook.space/docs/", {setActive: true, focusLocationBar: true})
          } else {
            createShellWindow({ pages: ["https://brainbook.space/docs/"] })
          }
        },
      }
    ]
  }
  if (process.platform !== 'darwin') {
    helpMenu.submenu.push({ type: 'separator' })
    helpMenu.submenu.push({
      label: 'About',
      role: 'about',
      click: function (item) {
        if (win) tabManager.create(win, 'beaker://settings', {setActive: true})
      }
    })
  }

  // assemble final menu
  var menus
    menus = [editMenu, viewMenu, historyMenu, windowMenu, helpMenu]
    if (process.platform === 'darwin') menus.unshift(darwinMenu)

  return menus
}

export function triggerMenuItemById (menuLabel, id) {
  if (!currentMenuTemplate) return
  var items = currentMenuTemplate.find(menu => menu.label === menuLabel).submenu
  if (!items) return
  var item = items.find(item => item.id === id)
  return item.click()
}

// internal helpers
// =

function createWindowIfNone (win, onShow) {
  if (win) return onShow(win)
  win = createShellWindow()
  win.once('show', onShow.bind(null, win))
}
