'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ScriptBufferedProcessStore} from 'nuclide-atom-helpers';

var {CompositeDisposable, TextBuffer} = require('atom');
var AtomTextEditor = require('nuclide-ui-atom-text-editor');
var React = require('react-for-atom');

var PROCESS_OUTPUT_PATH = 'nuclide-process-output.ansi';

class ProcessOutputView extends React.Component {
  _processOutputStore: ScriptBufferedProcessStore;
  _textBuffer: atom$TextBuffer;
  _disposables: atom$CompositeDisposable;

  constructor(props: {[key: string]: mixed}) {
    super(props);
    this._processOutputStore = props.processOutputStore;
    this._textBuffer = new TextBuffer({
      load: false,
      text: '',
    });
    this._disposables = new CompositeDisposable();
  }

  componentDidMount() {
    this._disposables.add(
      this._processOutputStore.observeStdout(data => this._updateTextBuffer(data))
    );
    this._disposables.add(
      this._processOutputStore.observeStderr(data => this._updateTextBuffer(data))
    );
  }

  _updateTextBuffer(newText: string) {
    this._textBuffer.append(newText);
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): ReactElement {
    return (
      <AtomTextEditor
        ref="process-output-editor"
        textBuffer={this._textBuffer}
        gutterHidden={true}
        readOnly={true}
        path={PROCESS_OUTPUT_PATH}
      />
    );
  }
}

ProcessOutputView.propTypes = {
  processOutputStore: React.PropTypes.object.isRequired,
};

module.exports = ProcessOutputView;