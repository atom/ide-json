const path = require('path');
const {AutoLanguageClient} = require('atom-languageclient');
const {filter} = require('fuzzaldrin-plus');
const cp = require('child_process');

/**
 * JSON LanguageClient for IDE-Atom
 * 
 * @method getGrammarScopes
 * @extends AutoLanguageClient
 * @return {class}         The JSONLanguageClient Class
 */
class JSONLanguageClient extends AutoLanguageClient {
	getGrammarScopes () { return ['source.json'] };
	getLanguageName () { return 'JSON' };
	getServerName () { return 'MBRW' };
	getConnectionType() { return 'stdio' }; // ipc, socket, stdio

	startServerProcess () {
		return super.spawnChildNode([ require.resolve('vscode-json-languageserver-bin/jsonServerMain'), '--stdio' ]); // --node-ipc, stdio, socket={number}
	};

	preInitialization (connection) {
		connection.onCustom('$/partialResult', () => {}); // Suppress partialResult until the language server honours 'streaming' detection
	}
}

module.exports = new JSONLanguageClient();