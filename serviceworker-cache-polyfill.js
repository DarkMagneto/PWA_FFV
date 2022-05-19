/**
* Copyright 2015 Google Inc. Tous droits réservés.
 *
 * Sous licence Apache, version 2.0 (la "Licence");
 * vous ne pouvez pas utiliser ce fichier sauf en conformité avec la licence.
 * Vous pouvez obtenir une copie de la licence sur
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Sauf si requis par la loi applicable ou convenu par écrit, le logiciel
 * distribué sous licence est distribué sur une BASE "TEL QUEL",
 * SANS GARANTIE OU CONDITION D'AUCUNE SORTE, expresse ou implicite.
 * Voir la licence pour les autorisations et les autorisations spécifiques à la langue
 * limitations en vertu de la licence.
 *
 */

(function() {
  var nativeAddAll = Cache.prototype.addAll;
  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);


// A un bon comportement de `var` que tout le monde déteste
  if (userAgent) {
    var agent = userAgent[1];
    var version = parseInt(userAgent[2]);
  }

  if (
    nativeAddAll && (!userAgent ||
      (agent === 'Firefox' && version >= 46) ||
      (agent === 'Chrome'  && version >= 50)
    )
  ) {
    return;
  }

  Cache.prototype.addAll = function addAll(requests) {
    var cache = this;


// Puisque les DOMExceptions ne sont pas constructibles :
    function NetworkError(message) {
      this.name = 'NetworkError';
      this.code = 19;
      this.message = message;
    }

    NetworkError.prototype = Object.create(Error.prototype);

    return Promise.resolve().then(function() {
      if (arguments.length < 1) throw new TypeError();

      // Simulate sequence<(Request or USVString)> binding:
      var sequence = [];

      requests = requests.map(function(request) {
        if (request instanceof Request) {
          return request;
        }
        else {
          return String(request); // may throw TypeError
        }
      });

      return Promise.all(
        requests.map(function(request) {
          if (typeof request === 'string') {
            request = new Request(request);
          }

          var scheme = new URL(request.url).protocol;

          if (scheme !== 'http:' && scheme !== 'https:') {
            throw new NetworkError("Invalid scheme");
          }

          return fetch(request.clone());
        })
      );
    }).then(function(responses) {

// Si certaines des réponses n'ont pas le statut OK-eish,
      // alors toute l'opération devrait rejeter
      if (responses.some(function(response) {
        return !response.ok;
      })) {
        throw new NetworkError('Incorrect response status');
      }

// TODO : vérifier que les requêtes ne s'écrasent pas les unes les autres
      // (ne pensez pas que ce soit possible de polyfill en raison de réponses opaques)
      return Promise.all(
        responses.map(function(response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function() {
      return undefined;
    });
  };

  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}());