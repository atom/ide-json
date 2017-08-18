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
	private _serverManager;
	
	getGrammarScopes () { return ['source.json'] };
	getLanguageName () { return 'JSON' };
	getServerName () { return 'MBRW' };
	getConnectionType() { return 'stdio' }; // ipc, socket, stdio

	startServerProcess () {
		// return cp.spawn('node', [require.resolve('vscode-json-languageserver-bin/jsonServerMain')]);
		return super.spawnChildNode([ require.resolve('vscode-json-languageserver-bin/jsonServerMain'), '--stdio' ]); // --node-ipc, stdio, socket={number}
	};

	preInitialization (connection) {
		connection.onCustom('$/partialResult', () => {}); // Suppress partialResult until the language server honours 'streaming' detection
	}

	async getSuggestions (request) {
		const prefix = request.prefix.trim();
		const server = await this._serverManager.getServer(request.editor);

		if (prefix === '' && !request.activatedManually) {
			server.currentSuggestions = [];
			return Promise.resolve([]);
		}

		if (prefix.length > 0 && prefix != '.'  && server.currentSuggestions && server.currentSuggestions.length > 0) {
			// fuzzy filter on this.currentSuggestions
			return new Promise((resolve) => {
				const filtered = filter(server.currentSuggestions, prefix, {key: 'text'})
					.map(s => Object.assign({}, s, {replacementPrefix: prefix}));
				resolve(filtered);
			});
		}

		if (request.activatedManually === true || request.prefix.startsWith('.')) {
			return this.requestAndCleanSuggestions(request)
				.then(suggestions => server.currentSuggestions = suggestions);
			} else {
				server.currentSuggestions = [];
				return Promise.resolve([]);
			}
		}
		

	requestAndCleanSuggestions (request) {
		return super.getSuggestions(request).then(results => {
			if (results != null) {
			for (const result of results) {
				if (result.leftLabel) {
					const index = result.leftLabel.lastIndexOf(':');
						if (index > 0) {
							result.leftLabel = result.leftLabel.substr(index + 1).trim();
						}
					}
				}
			}
			
			return results
		});
	}
}

module.exports = new JSONLanguageClient();