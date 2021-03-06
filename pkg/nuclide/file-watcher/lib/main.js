'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

let subscriptions: ?CompositeDisposable = null;
let watchers: ?Map = null;

module.exports = {

  activate(state: ?Object): void {
    const {CompositeDisposable} = require('atom');

    subscriptions = new CompositeDisposable();
    watchers = new Map();

    subscriptions.add(atom.workspace.observeTextEditors(editor => {
      if (watchers.has(editor)) {
        return;
      }

      const FileWatcher = require('./FileWatcher');
      const fileWatcher = new FileWatcher(editor);
      watchers.set(editor, fileWatcher);

      subscriptions.add(editor.onDidDestroy(() => {
        fileWatcher.destroy();
        watchers.delete(editor);
      }));
    }));

    // Disable the file-watcher package from showing the promot, if installed.
    atom.config.set('file-watcher.promptWhenFileHasChangedOnDisk', false);
  },

  deactivate(): void {
    if (!subscriptions) {
      return;
    }
    for (const fileWatcher of watchers.values()) {
      fileWatcher.destroy();
    }
    subscriptions.dispose();
    subscriptions = null;
  },
};
