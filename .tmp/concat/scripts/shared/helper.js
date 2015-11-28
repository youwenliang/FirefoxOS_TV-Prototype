/*
 * global asyncStorage
 */
(function(exports) {
  'use strict';
  exports.SharedUtils = {
    nodeListToArray: function su_nodeListToArray(obj) {
      return [].map.call(obj, function(element) {
        return element;
      });
    },

    addMixin: function su_addMixin(obj, mixin) {
      for (var prop in mixin) {
        if (mixin.hasOwnProperty(prop)) {
          if (!obj.prototype.hasOwnProperty(prop)) {
            obj.prototype[prop] = mixin[prop];
          }
        }
      }
    },

    // Because the scoped css cannot be override by outer css, we have to create
    // a cloned function without scope from shared/component_utils.js
    injectComponentStyle: function su_injectComponentStyle(self, baseUrl) {
      var style = document.createElement('style');
      var url = baseUrl + 'style.css';

      style.innerHTML = '@import url(' + url + ');';
      self.appendChild(style);

      self.style.visibility = 'hidden';

      // Wait for the stylesheet to load before injecting
      // it into the shadow-dom. This is to work around
      // bug 1003294, let's review once landed.
      style.addEventListener('load', function() {

        // Put a clone of the stylesheet into the shadow-dom.
        // We have to use two <style> nodes, to work around
        // the lack of `:host` (bug 992245) and `:content`
        // (bug 992249) selectors. Once we have those we
        // can do all our styling from a single style-sheet
        // within the shadow-dom.
        if (self.shadowRoot) {
          self.shadowRoot.appendChild(style.cloneNode(true));
        }

        self.style.visibility = '';
      });
    },

    /**
     * Read color code from the specified image blob. Please note that the blob
     * should be downloaded from System XHR or within the same domain.
     * Otherwise, this function returns SecurityError
     *
     * @param {Blob} blob the image blob.
     * @param {float} x read color from position x (0~1). If the value is 0.5,
                        it reads the center.
     * @param {float} y read color from position y (0~1). If the value is 0.5,
                        it reads the center.
     * @param {Function} callback the callback function whose signature is:
     *   void callback(color in rgba array, error);
     * @memberof SharedUtils
    **/
    readColorCode: function su_readColorCode(blob, x, y, callback) {
      if (!callback) {
        // Callback is not optional. We don't have use case without callback.
        return;
      }
      var offscreenUrl = URL.createObjectURL(blob);
      var offscreenImg = new Image();
      offscreenImg.onload = function() {
        URL.revokeObjectURL(offscreenUrl);
        var canvas = document.createElement('canvas');
        // We only need one pixel.
        canvas.width = 1;
        canvas.height = 1;
        var ctx = canvas.getContext('2d');
        try {
          // Let's draw image x, y with 1x1 at canvas position(0, 0).
          ctx.drawImage(offscreenImg, offscreenImg.naturalWidth * x,
                        offscreenImg.naturalHeight * y, 1, 1, 0, 0, 1, 1);
          var data = ctx.getImageData(0, 0, 1, 1).data;
          // Note the data is in Uint8ClampedArray. We need to convert it to
          // array.
          callback([data[0], data[1], data[2], data[3]]);
        } catch(ex) {
          // drawImage may throw decoding error
          // getImageData may throw security error.
          callback(null, ex);
        }
      };

      offscreenImg.onerror = function() {
        URL.revokeObjectURL(offscreenUrl);
        console.error('read color code from ' + blob);
        callback(null, new Error('read color code from ' + blob));
      };
      // Let's load the image
      offscreenImg.src = offscreenUrl;
    },

    /**
     * Localize html element from payload, support l10n-id, l10n-args, or
     * plain string format. See http://mzl.la/1yoNtZ1 for l10n refernce.
     * @param  {HtmlElement} element target html element to be localized
     * @param  {Object} payload l10n payload
     * @memberof SharedUtils
     */
    localizeElement: function su_localizeElement(element, payload) {
      // payload could be:
      // 1. string -> l10nId
      // 2. object -> {id: l10nId, args: l10nArgs}
      // 3. object -> {raw: string}
      // It could be HTML fragment but currently we don't have it yet.
      if (typeof payload === 'string') {
        element.setAttribute('data-l10n-id', payload);
        return;
      }

      if (typeof payload === 'object') {
        if (payload.id) {
          navigator.mozL10n.setAttributes(element, payload.id, payload.args);
          return;
        } else if (payload.raw) {
          element.removeAttribute('data-l10n-id');
          element.textContent = payload.raw;
          return;
        }
      }
    }
  };

}(window));

/**
  Copyright 2012, Mozilla Foundation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';
(function(exports) {

/**
 * Creates an object used for refreshing the clock UI element. Handles all
 * related timer manipulation (start/stop/cancel).
 * @class  Clock
 */
function Clock() {
  /**
   * One-shot timer used to refresh the clock at a minute's turn
   * @memberOf Clock
   */
  this.timeoutID = null;

  /**
   * Timer used to refresh the clock every minute
   * @memberOf Clock
   */
  this.timerID = null;

  /**
   * Start the timer used to refresh the clock, will call the specified
   * callback at every timer tick to refresh the UI. The callback used to
   * refresh the UI will also be called immediately to ensure the UI is
   * consistent.
   *
   * @param {Function} refresh Function used to refresh the UI at every timer
   *        tick, should accept a date object as its only argument.
   * @memberOf Clock
   */
  this.start = function cl_start(refresh) {
    var date = new Date();
    var self = this;

    refresh(date);

    if (this.timeoutID == null) {
      this.timeoutID = window.setTimeout(function cl_setClockInterval() {
        refresh(new Date());

        if (self.timerID == null) {
          self.timerID = window.setInterval(function cl_clockInterval() {
            refresh(new Date());
          }, 60000);
        }
      }, (60 - date.getSeconds()) * 1000);
    }
  };

  /**
   * Stops the timer used to refresh the clock
   * @memberOf Clock
   */
  this.stop = function cl_stop() {
    if (this.timeoutID != null) {
      window.clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }

    if (this.timerID != null) {
      window.clearInterval(this.timerID);
      this.timerID = null;
    }
  };
}

/** @exports Clock */
exports.Clock = Clock;

})(window);

(function(exports) {
  'use strict';

  /**
   * The PipedPromise is a 'trait' or 'mixin' for other module to mix it in.
   * Under certain situation, when we implement method that returns a Promise
   * to callee, we don't want the method to be reentrant and instantiate another
   * promise. We would like the request to be 'piped' in the same promise.
   * This is the case where PipedPromise comes to our resque.
   *
   * @example
   * SomeModule.prototype = {
   *   ...
   *   willReturnPromise: function willReturnPromise() {
   *     return this._getPipedPromise('willReturnPromise',
   *       function(resolve, reject) {
   *         ...
   *       });
   *   },
   *   ...
   * };
   * addMixin(SomeModule, new PipedPromise());
   *
   */
  var PipedPromise = function() {
    this._piped_promises = {};

    this._removePipedPromise = function pp_removePipedPromise(key) {
      this._piped_promises[key] = undefined;
    };

    /**
     * Get Promise object of specific key. It will generate a new Promise
     * if Promise of the key is not existed yet.
     *
     * @param {String} key - key of the Promise
     * @param {Function} executor - the executor once the Promise resolved
     *                              or rejected
     * @returns {Promise} - A Promise
     *
     */
    this._getPipedPromise = function pp_getOrCreatePromise(key, executor) {
      var that = this;
      var promise = this._piped_promises[key];
      if (!promise) {
        promise = new Promise(executor);
        Promise.all([promise]).then(function onFulfill() {
          that._removePipedPromise(key);
        }, function onReject() {
          that._removePipedPromise(key);
        });
        that._piped_promises[key] = promise;
      }
      return promise;
    };
  };

  exports.PipedPromise = PipedPromise;

}(window));

/* global evt, PipedPromise, SharedUtils */

(function(exports) {
  'use strict';

  var CardStore = function(mode, manifestURL) {
    var that = this;
    this._mode = mode || 'readwrite';
    if (manifestURL) {
      this._manifestURL = manifestURL;
      this._getStore();
    } else {
      navigator.mozApps.getSelf().onsuccess = function(evt) {
        var app = evt.target.result;
        that._manifestURL = app.manifestURL;
        that._getStore();
      };
    }
  };

  CardStore.prototype = evt({
    STORE_NAME: 'home_cards',

    _dataStore: undefined,

    _appRevisionId: undefined,

    _manifestURL: undefined,

    // Only two modes available: readonly and readwrite (default)
    // 'readwrite' mode is for Smart-Home app only
    _mode: 'readwrite',

    isStarted: function cs_isStarted() {
      return !!this._manifestURL && !!this._dataStore;
    },

    canWrite: function cs_canWrite() {
      return this._mode === 'readwrite';
    },

    _onChange: function(evt) {
      this.fire('change', evt);
    },

    _getStore: function cs_getStore() {
      var that = this;
      return this._getPipedPromise('_getStore', function(resolve, reject) {
        if (that.isStarted()) {
          resolve(that._dataStore);
          return;
        }
        navigator.getDataStores(that.STORE_NAME).then(
        function(stores) {
          stores.forEach(function(store) {
            if (store.owner === that._manifestURL) {
              that._dataStore = store;
              that._dataStore.addEventListener('change',
                that._onChange.bind(that));
            }
          });
          if (that._dataStore) {
            resolve(that._dataStore);
          } else {
            reject();
          }
        });
      });
    },

    getData: function cs_getData(id) {
      var that = this;
      return new Promise(function(resolve, reject) {
        that._getStore().then(function onFulfill(store) {
          if (store) {
            store.get(id).then(resolve);
          } else {
            reject('no store available');
          }
        }, function onReject(reason) {
          reject(reason);
        });
      });
    },

    saveData: function cs_saveData(id, data) {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (that.canWrite()) {
          that._getStore().then(function onFulfill(store) {
            if (store) {
              store.put(data, id).then(resolve, function(error) {
                reject(error);
              });
            } else {
              reject('no store available');
            }
          }, function onReject(reason) {
            reject(reason);
          });
        } else {
          // resolve directly without actually writing anything,
          // because we are in readonly mode
          resolve();
        }
      });
    }
  });

  SharedUtils.addMixin(CardStore, new PipedPromise());

  exports.CardStore = CardStore;
}(window));

/* global evt */

(function(exports) {
  'use strict';

  var _counter = 0;

  // Card is the base class for Application, Deck, and Folder
  var Card = function Card() {
    this.generateCardId();
  };

  Card.deserialize = function c_deserialize(cardEntry) {
    // just to prevent undefined error
  };

  Card.prototype = evt({
    get cardId() {
      return this._id;
    },
    generateCardId: function c_generateCardId() {
      // XXX: use constructor.name + name + incremental counter
      // as cardId for now. Notice that cardId is only meaningful for
      // Smart-Home app. Because only Smart-Home app has 'write' privilege.
      var name = (this.nativeApp && this.nativeApp.manifest) ?
        this.nativeApp.manifest.name : 'card';
      this._id = this.constructor.name + '-' + name + '-' + (_counter);
      _counter += 1;
      return this._id;
    },
    serialize: function c_serialize() {
      // just to prevent undefined error
    },

    constructor: Card
  });

  exports.Card = Card;

}(window));

/* global Card */

(function(exports) {
  'use strict';

  var Application = function Application(options) {
    this.nativeApp = options.nativeApp;
    this.name = options.name;
    this.cachedIconBlob = undefined;
    this.thumbnail = options.thumbnail;
    this.launchURL = options.launchURL;
    this.group = options.group;
    Card.prototype.constructor.call(this);
  };

  Application.deserialize = function app_deserialize(cardEntry, installedApps) {
    var cardInstance;
    if (cardEntry && installedApps && cardEntry.type === 'Application') {
      cardInstance = new Application({
        nativeApp: installedApps[cardEntry.manifestURL],
        name: cardEntry.name,
        thumbnail: cardEntry.thumbnail,
        launchURL: cardEntry.launchURL,
        group: cardEntry.group
      });
    }
    return cardInstance;
  };

  Application.prototype = Object.create(Card.prototype);

  Application.prototype.constructor = Application;

  // expose getter of property of nativeApp
  var exposedPropertyNames = ['manifest', 'updateManifest'];
  exposedPropertyNames.forEach(function(propertyName) {
    Object.defineProperty(Application.prototype, propertyName, {
      get: function() {
        return this.nativeApp && this.nativeApp[propertyName];
      }
    });
  });

  Application.prototype.serialize = function app_serialize() {
    return {
      manifestURL: this.nativeApp.manifestURL,
      name: this.name,
      type: 'Application',
      thumbnail: this.thumbnail,
      launchURL: this.launchURL,
      group: this.group
    };
  };

  Application.prototype.launch = function app_launch(args) {
    if (this.nativeApp && this.nativeApp.launch && !this.launchURL) {
      this.nativeApp.launch(args);
    } else {
      if (!Application._iacPort) {
        console.error('no iacPort found, we cannot launch Application');
        return;
      }

      Application._iacPort.postMessage({
        'manifestURL': this.nativeApp.manifestURL,
        'timestamp': (new Date()).getTime(),
        'url': this.launchURL
      });
    }
  };

  window.addEventListener('load', function _retrieveIACPort() {
    window.removeEventListener('load', _retrieveIACPort);

    navigator.mozApps.getSelf().onsuccess = function(evt) {
      var app = evt.target.result;
      if (app) {
        app.connect('customlaunchpath').then(function onAccepted(ports) {
          Application._iacPort = ports[0];
        });
      }
    };
  });

  exports.Application = Application;
}(window));

/* global Card */

(function(exports) {
  'use strict';

  var Deck = function Deck(options) {
    this.nativeApp = options.nativeApp;
    this.name = options.name;
    this.deckClass = options.deckClass;
    this.group = options.group;
    Card.prototype.constructor.call(this);
  };

  Deck.deserialize = function deck_deserialize(cardEntry, installedApps) {
    var cardInstance;
    if (cardEntry && installedApps && cardEntry.type === 'Deck') {
      cardInstance = new Deck({
        name: cardEntry.name,
        nativeApp: cardEntry.manifestURL &&
          installedApps[cardEntry.manifestURL],
        deckClass: cardEntry.deckClass,
        group: cardEntry.group
      });
    }
    return cardInstance;
  };

  Deck.prototype = Object.create(Card.prototype);

  Deck.prototype.constructor = Deck;

  // expose getter of property of nativeApp
  var exposedPropertyNames = ['manifest', 'updateManifest'];
  exposedPropertyNames.forEach(function(propertyName) {
    Object.defineProperty(Deck.prototype, propertyName, {
      get: function() {
        return this.nativeApp && this.nativeApp[propertyName];
      }
    });
  });

  Deck.prototype.launch = function deck_launch(args) {
    if (this.nativeApp && this.nativeApp.launch) {
      this.nativeApp.launch(args);
    }
  };

  Deck.prototype.serialize = function deck_serialize() {
    // A deck doesn't need background color because it is always full-sized
    // icon. If not, it is an issue from visual's image.
    return {
      name: this.name,
      deckClass: this.deckClass,
      manifestURL: this.nativeApp && this.nativeApp.manifestURL,
      type: 'Deck',
      group: this.group
    };
  };

  exports.Deck = Deck;
}(window));

/* global Card, uuid */

(function(exports) {
  'use strict';

  var Folder = function Folder(options) {
    this._cardsInFolder = options._cardsInFolder || [];
    this.name = options.name;
    // folderId is used in cardStore as key
    this.folderId = options.folderId || uuid.v4();
    this._state = options.state || Folder.STATES.NORMAL;
    Card.prototype.constructor.call(this);
  };

  Folder.STATES = Object.freeze({
    // when folder is in DESERIALIZING state, it means we are still in the
    // process of loading its content from datastore
    'DESERIALIZING': 'DESERIALIZING',
    'NORMAL': 'NORMAL',
    // DIRTY state means the folder is out of sync with data store
    'DIRTY': 'DIRTY',
    // DETACHED state means the folder itself is not saved (detached)
    // in card list
    'DETACHED': 'DETACHED'
  });

  Folder.deserialize = function folder_deserialize(cardEntry) {
    var cardInstance;
    if (cardEntry && cardEntry.type === 'Folder') {
      cardInstance = new Folder({
        name: cardEntry.name,
        folderId: cardEntry.folderId,
        // The content of folder is saved in datastore under key of folderId
        // thus we are not complete deserialize it yet, mark its state
        // as 'DESERIALIZING'. Caller needs to put content of the folder
        // back to its structure. Please refer to CardManager#_reloadCardList().
        state: Folder.STATES.DESERIALIZING
      });
    }
    return cardInstance;
  };

  Folder.prototype = Object.create(Card.prototype);

  Folder.prototype.constructor = Folder;

  Object.defineProperty(Folder.prototype, 'state', {
    get: function() {
      return this._state;
    },
    set: function(state) {
      this._state = state;
      this.fire('state-changed', this._state);
    }
  });

  Folder.prototype.getCardList = function folder_getCardList() {
    return this._cardsInFolder;
  };

  Folder.prototype.isEmpty = function folder_isEmpty() {
    return this._cardsInFolder.length === 0;
  };

  Folder.prototype.isNotEmpty = function folder_isNotEmpty() {
    return this._cardsInFolder.length > 0;
  };

  Folder.prototype.isDeserializing = function folder_isDeserializing() {
    return this._state === Folder.STATES.DESERIALIZING;
  };

  Folder.prototype.isDetached = function folder_isDetached() {
    return this._state === Folder.STATES.DETACHED;
  };

  Folder.prototype.loadCardsInFolder = function folder_loadCardsInFolder(opts) {
    var that = this;
    if (opts.from === 'config') {
      // load content of folder from config file (e.g. in 'cardEntry' form)
      this._cardsInFolder =
        opts.cardEntry._cardsInFolder.map(opts.deserializer);
      this.state = Folder.STATES.NORMAL;
    } else if (opts.from === 'datastore') {
      // load content of folder from data store
      opts.datastore.getData(this.folderId).then(function(innerCardList) {
        innerCardList.forEach(function(innerCardEntry) {
          that._cardsInFolder.push(opts.deserializer(innerCardEntry));
        });
        that.state = Folder.STATES.NORMAL;
      });
    }
  };

  // get index of card in folder
  Folder.prototype._indexOfCard = function folder_indexOfCard(query) {
    return this._cardsInFolder.indexOf(this.findCard(query));
  };

  // XXX: this method shares almost the same logic as
  // findCardFromCardList in CardManager. We should consolidate them. See
  // http://bugzil.la/1156726
  // There are three types of query:
  // 1. query by cardId
  // 2. query by manifestURL and optionally launchURL
  // 3. query by cardEntry (i.e. serialized card)
  Folder.prototype.findCard = function folder_findCard(query) {
    var found;
    this._cardsInFolder.some(function(card, index) {
      if (card.cardId === query.cardId) {
        found = card;
        return true;
      } else if (query.manifestURL && card.nativeApp &&
          card.nativeApp.manifestURL === query.manifestURL) {
        // if we specify launchURL in query, then we must compare
        // launchURL first
        if (query.launchURL) {
          if (card.launchURL === query.launchURL) {
            found = card;
            return true;
          }
        } else {
          found = card;
          return true;
        }
      } else if (query.cardEntry) {
        // XXX: this could be bad at performance because we serialize card
        // in every loop. We might need improvement on this query.
        if (JSON.stringify(card.serialize()) ===
            JSON.stringify(query.cardEntry)) {
          found = card;
          return true;
        }
      }
    });
    return found;
  };

  Folder.prototype._isInFolder = function folder_isInFolder(card) {
    if (card) {
      return this._indexOfCard(card) > -1;
    } else {
      return false;
    }
  };

  Folder.prototype._setDirty = function folder_setDirty() {
    if (this._state !== Folder.STATES.DETACHED) {
      this._state = Folder.STATES.DIRTY;
      this.fire('state-changed', this._state);
    }
    this.fire('folder-changed', this);
  };

  Folder.prototype.addCard = function folder_addCard(card, index) {
    // We don't support folder in folder
    if (!this._isInFolder(card) && !(card instanceof Folder)) {
      if (typeof index !== 'number') {
        index = this._cardsInFolder.length;
      }
      this._cardsInFolder.splice(index, 0, card);
      this._setDirty();
      this.fire('card-inserted', card, index);
    }
  };

  Folder.prototype.removeCard = function folder_removeCard(card) {
    var index = this._indexOfCard(card);
    if (index > -1) {
      this._cardsInFolder.splice(index, 1);
      this._setDirty();
      this.fire('card-removed', [index]);
    }
  };

  Folder.prototype.updateCard = function folder_updateCard(card, index) {
    // The card instance is directly reference to card in '_cardsInFolder'
    // So don't bother to update it again. But we DID need 'folder-changed'
    // event to notify CardManager to write changes to data store.
    this._setDirty();
    this.fire('card-updated', card, index);
  };

  Folder.prototype.swapCard = function folder_swapCard(card1, card2) {
    var index1 = (typeof card1 === 'number') ?
      index1 = card1 : this._indexOfCard(card1);
    var index2 = (typeof card2 === 'number') ?
      index2 = card2 : this._indexOfCard(card2);
    var temp = this._cardsInFolder[index1];
    this._cardsInFolder[index1] = this._cardsInFolder[index2];
    this._cardsInFolder[index2] = temp;
    this._setDirty();
    this.fire('card-swapped',
        this._cardsInFolder[index1], this._cardsInFolder[index2],
        index1, index2);
  };

  Folder.prototype.launch = function folder_launch() {
    // fire launch event to inform exterior module
    this.fire('launch', this);
  };

  Folder.prototype.serialize = function folder_serialize() {
    return {
      name: this.name,
      folderId: this.folderId,
      type: 'Folder'
    };
  };

  exports.Folder = Folder;
}(window));

/* global evt, SharedUtils, Promise, PipedPromise, Application, CardStore,
        Deck, Folder, AsyncSemaphore */

(function(exports) {
  'use strict';

  var CardManager = function() {
  };

  CardManager.STATES = Object.freeze({
    'READY': 'READY',
    'SYNCING': 'SYNCING'
  });

  CardManager.prototype = evt({
    HIDDEN_ROLES: ['system', 'homescreen', 'addon', 'langpack'],

    // Only two modes available: readonly and readwrite (default)
    // 'readwrite' mode is for Smart-Home app only
    // This '_mode' variable only affects CardStore.
    _mode: 'readwrite',

    _manifestURLOfCardStore: undefined,

    _cardStore: undefined,

    _cardList: [],

    installedApps: {},

    _asyncSemaphore: undefined,

    _isHiddenApp: function cm_isHiddenApp(role) {
      if (!role) {
        return false;
      }
      return (this.HIDDEN_ROLES.indexOf(role) !== -1);
    },

    _isCardListLoaded: function cm_isCardListLoaded() {
      return this._cardList && this._cardList.length > 0;
    },

    _serializeCard: function cm_serializeCard(card) {
      return card && card.serialize();
    },

    _deserializeCardEntry: function cm_deserializeCardEntry(cardEntry) {
      var cardInstance;
      switch (cardEntry.type) {
        case 'AppBookmark':
        case 'Application':
          cardInstance = Application.deserialize(cardEntry, this.installedApps);
          break;
        case 'Deck':
          cardInstance = Deck.deserialize(cardEntry, this.installedApps);
          break;
        case 'Folder':
          cardInstance = Folder.deserialize(cardEntry);
          // Save the folder into card store whenever we receives
          // folder-changed event
          cardInstance.on('folder-changed', this._onFolderChange.bind(this));
          break;
      }
      return cardInstance;
    },

    writeFolderInCardStore: function cm_writeFolderInCardStore(folder) {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (folder instanceof Folder) {
          that._asyncSemaphore.v();
          var cardEntriesInFolder =
            folder.getCardList().map(that._serializeCard.bind(that));
          that._cardStore.saveData(folder.folderId,
            cardEntriesInFolder).then(function() {
              folder.state = Folder.STATES.NORMAL;
            }).then(function() {
              that._asyncSemaphore.p();
              resolve();
            }, reject);
        } else {
          reject();
        }
      });
    },

    // XXX: Call this function when you need to write cardList back to datastore
    // Because when we write cardList to datastore, we need to seperate
    // first level cards and cards under folder into sperated records in
    // datastore. A better way whould pull out logic related to cardList
    // into a standalone module. We will do this later.
    writeCardlistInCardStore: function cm_writeCardlistInCardStore(options) {
      var that = this;
      var emptyFolderIndices = [];
      return new Promise(function(resolve, reject) {
        var saveDataPromises = [];
        var newCardList;
        that._asyncSemaphore.v();
        // The cards inside of folder are not saved nested in cardList
        // but we explicit save them under key of folderId.
        // Here we save content of each folder one by one
        newCardList = that._cardList.filter(function(card, index) {
          if (card instanceof Folder) {
            if (card.getCardList().length > 0) {
              saveDataPromises.push(that.writeFolderInCardStore(card));
            } else {
              emptyFolderIndices.push(index);
              return false;
            }
          }
          return true;
        });
        if (options && options.cleanEmptyFolder) {
          that._cardList = newCardList;
        }
        Promise.all(saveDataPromises).then(function() {
          resolve();
        });
      }).then(function() {
         var cardEntries =
           that._cardList.map(that._serializeCard.bind(that));
        return that._cardStore.saveData('cardList', cardEntries);
      }).then(function() {
        that._asyncSemaphore.p();
        if (options && options.cleanEmptyFolder) {
          that.fire('card-removed', emptyFolderIndices);
        }
      }).catch(function() {
        that._asyncSemaphore.p();
      });
    },

    _loadDefaultCardList: function cm_loadDefaultCardList() {
      var that = this;
      return this._getPipedPromise('_loadDefaultCardList',
        function(resolve, reject) {
          var defaultCardListFile = 'shared/resources/default-cards.json';
          that._asyncSemaphore.v();
          that._loadFile({
            url: defaultCardListFile,
            responseType: 'json'
          }).then(function onFulfill(config) {
            that._cardList =
              config.card_list.map(function(cardEntry) {
                var card = that._deserializeCardEntry(cardEntry);
                if (card instanceof Folder && card.isDeserializing()) {
                  card.loadCardsInFolder({
                    from: 'config',
                    cardEntry: cardEntry,
                    deserializer: that._deserializeCardEntry.bind(that)
                  });
                }
                return card;
              });
            // write cardList into data store for the first time
            that.writeCardlistInCardStore().then(resolve, reject);
          }).then(function() {
            that._asyncSemaphore.p();
          }).catch(function onReject(error) {
            var reason ='request ' + defaultCardListFile +
              ' got reject ' + error;
            that._asyncSemaphore.p();
            reject(reason);
          });
        });
    },

    _onCardStoreChange: function cm_onCardStoreChange(evt) {
      var that = this;
      if (evt.operation === 'updated') {
        that._asyncSemaphore.v();
        // When we receives 'cardlist-changed' in readonly mode, it means
        // Smart-Home app has change cardList. We'd better re-fetch cardList
        // as a whole.
        if (this._mode === 'readonly') {
          this._cardList = [];
        }
        this._reloadCardList().then(function() {
          that._asyncSemaphore.p();
          that.fire('cardlist-changed');
        });
      }
    },

    _onFolderChange: function cm_onFolderChange(folder) {
      if (folder.isDetached()) {
        this.writeCardlistInCardStore();
      } else {
        this.writeFolderInCardStore(folder);
        if (folder.isEmpty()) {
          this.writeCardlistInCardStore();
        }
      }
    },

    _initCardStoreIfNeeded: function cm_initCardStore() {
      if (!this._cardStore) {
        this._cardStore =
          new CardStore(this._mode, this._manifestURLOfCardStore);
        this._cardStore.on('change', this._onCardStoreChange.bind(this));
      }
    },

    // XXX: DO NOT call this directly except for _reloadCardList.
    // Because it is not protected by AsyncSemaphore. We should change it as
    // returning a `Promise`
    _loadCardListFromCardStore:
      function cm_loadCardListFromCardStore(cardListFromCardStore) {
        var that = this;
        cardListFromCardStore.forEach(function(cardEntry) {
          var found = that.findCardFromCardList({cardEntry: cardEntry});
          if (!found) {
            var card = that._deserializeCardEntry(cardEntry);
            // The cards inside of folder are not saved nested in
            // datastore 'cardList'. But we explicit save them under key
            // of folderId. So we need to retrieve them by their folderId
            // and put them back to folders where they belong.
            if (card instanceof Folder && card.isDeserializing()) {
              card.loadCardsInFolder({
                from: 'datastore',
                datastore: that._cardStore,
                deserializer: that._deserializeCardEntry.bind(that)
              });
            }
            that._cardList.push(card);
          }
        });
      },

    _reloadCardList: function cm_loadCardList() {
      var that = this;
      return this._getPipedPromise('_reloadCardList',
        function(resolve, reject) {
          that._asyncSemaphore.v();
          that._initCardStoreIfNeeded();
          resolve(that._cardStore.getData('cardList'));
        }).then(function(cardListFromCardStore) {
          if (cardListFromCardStore) {
            // XXX: Change _loadCardListFromCardStore as returning a `Promise`
            that._loadCardListFromCardStore(cardListFromCardStore);
          } else {
            // no cardList in datastore, load default from config file
            return Promise.resolve(that._loadDefaultCardList());
          }
        }).then(function() {
          that._asyncSemaphore.p();
        }).catch(function(reason) {
          console.warn('Unable to reload cardList due to ' + reason);
          that._asyncSemaphore.p();
        });
    },

    _loadFile: function cm_loadIcon(request) {
      // _loadFile could accept reentrance, so it should return
      // new Promise on each invokation
      return new Promise(function(resolve, reject) {
        var url = request.url;
        var responseType = request.responseType || 'text';
        if (typeof url === 'string') {
          try {
            var xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
            xhr.open('GET', url, true);
            xhr.responseType = responseType;
            xhr.onload = function onload(evt) {
              if (xhr.status !== 0 && xhr.status !== 200) {
                reject(xhr.statusText);
              } else {
                resolve(xhr.response);
              }
            };
            xhr.ontimeout = xhr.onerror = function onErrorOrTimeout() {
              reject();
            };
            xhr.send();
          } catch (e) {
            reject(e.message);
          }
        } else {
          reject('invalid request');
        }
      });
    },

    _bestMatchingIcon:
      function cm_bestMatchingIcon(app, manifest, preferredSize) {
      var max = 0;
      var closestSize = 0;
      preferredSize = preferredSize || Number.MAX_VALUE;

      for (var size in manifest.icons) {
        size = parseInt(size, 10);
        if (size > max) {
          max = size;
        }
        if (!closestSize && size >= preferredSize) {
          closestSize = size;
        }
      }

      if (!closestSize) {
        closestSize = max;
      }

      var url = manifest.icons[closestSize];
      if (!url) {
        return;
      }
      if (url.indexOf('data:') === 0 ||
          url.indexOf('app://') === 0 ||
          url.indexOf('http://') === 0 ||
          url.indexOf('https://') === 0) {
        return url;
      }
      if (url.charAt(0) != '/') {
        console.warn('`' + manifest.name + '` app icon is invalid. ' +
                     'Manifest `icons` attribute should contain URLs -or- ' +
                     'absolute paths from the origin field.');
        return '';
      }

      if (app.origin.slice(-1) === '/') {
        return app.origin.slice(0, -1) + url;
      }

      return [app.origin + url, closestSize];
    },

    _onAppInstall: function cm_onAppInstall(evt) {
      var app = evt.application;
      var manifest = app.manifest || app.updateManifest;
      if (!app.launch || !manifest || !manifest.icons ||
          this._isHiddenApp(manifest.role)) {
        return;
      }

      var message =
        this.installedApps[app.manifestURL] ? 'update' : 'install';
      this.installedApps[app.manifestURL] = app;
      this.fire(message, this.getAppEntries(app.manifestURL));
    },

    _onAppUninstall: function cm_onAppUninstall(evt) {
      var app = evt.application;
      if (this.installedApps[app.manifestURL]) {
        delete this.installedApps[app.manifestURL];
        this.fire('uninstall', this.getAppEntries(app.manifestURL));
      }
    },

    insertNewFolder: function cm_insertFolder(name, index) {
      var newFolder = new Folder({
        name: name,
        state: Folder.STATES.DETACHED
      });

      this._asyncSemaphore.wait(function() {
        if (typeof index !== 'number') {
          index = this._cardList.length;
        }
        this._cardList.splice(index, 0, newFolder);
        // Notice that we are not saving card list yet
        // Because newFolder is empty, it is meaningless to save it
        // But we need to hook `folder-changed` event handler in case
        // we need to save it when its content changed
        newFolder.on('folder-changed', this._onFolderChange.bind(this));
        this.fire('card-inserted', newFolder, index);
      }, this);

      return newFolder;
    },

    insertCard: function cm_insertCard(options) {
      var that = this;
      this._asyncSemaphore.wait(function() {
        var newCard;
        var position;

        if (options.cardEntry) {
          newCard = this._deserializeCardEntry(options.cardEntry);
        } else {
          newCard = options.card;
        }

        // prevent same card from being inserted twice
        if (newCard && newCard.nativeApp) {
          var sameCardExisting = that.findCardFromCardList({
            manifestURL: newCard.nativeApp.manifestURL,
            launchURL: newCard.launchURL
          });
          if (sameCardExisting) {
            return;
          }
        }

        if (typeof options.index === 'number') {
          position = options.index;
        } else if (!newCard.group) {
          position = this._cardList.length;
        } else {
          // If the given card belongs to a deck (has type), we assume the deck
          // spans a group with all its bookmarks following deck icon itself,
          // and the given card should be put at the end of the group.
          position = -1;
          for(var idx = 0; idx < this._cardList.length; idx++) {
            var card = this._cardList[idx];
            if(position === -1 && !(card instanceof Deck)) {
              // Only Decks are admitted as the start of the group.
              continue;
            } else if (position !== -1 && card.group !== newCard.group) {
              // We've exceeded the end of the group.
              break;
            } else if (card.group === newCard.group) {
              // We're still inside the group.
              position = idx;
            }
          }
          position += 1;
          // No corresponding deck found; insert at bottom.
          if (position === 0) {
            position = this._cardList.length;
          }
        }

        this._cardList.splice(position, 0, newCard);
        this.writeCardlistInCardStore().then(function() {
          that.fire('card-inserted', newCard, position, options.overFolder);
        });
      }, this);
    },

    removeCard: function cm_removeCard(item) {
      this._asyncSemaphore.wait(function() {
        var that = this;
        var index =
          (typeof item === 'number') ? item : this._cardList.indexOf(item);

        if (index >= 0) {
          this._cardList.splice(index, 1);
          this.writeCardlistInCardStore().then(function() {
            that.fire('card-removed', [index]);
          });
        } else {
          // the card is not in _cardList, then it could probably be in folder
          this._cardList.forEach(function(card) {
            if (card instanceof Folder) {
              // don't bother to fire card-removed event because the folder
              // itself will fire this event
              card.removeCard(item);
            }
          });
        }
      }, this);
    },

    updateCard: function cm_updateCard(item, index) {
      var that = this;
      this._asyncSemaphore.wait(function() {
        if (typeof index === 'undefined') {
          index = this._cardList.findIndex(function(elem) {
            return elem.cardId === item.cardId;
          });
        }
        if (index >= 0) {
          // Most of the time, 'item' is directly reference to card in _cardList
          // and by the time we reach here, the card ('item') is already
          // updated. So don't bother to update it again.
          if (this._cardList[index] !== item) {
            this._cardList[index] = item;
          }
          this.writeCardlistInCardStore().then(function() {
            that.fire('card-updated', that._cardList[index], index);
          });
        }
      }, this);
    },

    // XXX: Note that if you put card index as parameters for item1 and item2
    // Please make sure they are "index of _cardList"
    swapCard: function cm_switchCard(item1, item2) {
      this._asyncSemaphore.wait(function() {
        var that = this;
        var idx1, idx2;
        idx1 = (typeof item1 === 'number') ?
          idx1 = item1 :
          this._cardList.indexOf(item1);
        idx2 = (typeof item2 === 'number') ?
          idx2 = item2 :
          this._cardList.indexOf(item2);
        var tmp = this._cardList[idx1];
        this._cardList[idx1] = this._cardList[idx2];
        this._cardList[idx2] = tmp;

        this.writeCardlistInCardStore().then(function() {
          that.fire('card-swapped',
                        that._cardList[idx1], that._cardList[idx2], idx1, idx2);
        });
      }, this);
    },

    init: function cm_init(mode) {
      var that = this;
      var appMgmt = navigator.mozApps.mgmt;

      this._asyncSemaphore = new AsyncSemaphore();
      // protect from async access to cardList
      this._asyncSemaphore.v();

      this._mode = mode || 'readwrite';
      // If we are running in readonly mode, we need to tell card store what
      // manifestURL of the datastore we are going to use, because we are not
      // using card store of current app.
      if (this._mode === 'readonly') {
        this._manifestURLOfCardStore =
         'app://smart-home.gaiamobile.org/manifest.webapp';
      }

      return this._getPipedPromise('init', function(resolve, reject) {
        var request = appMgmt.getAll();
        request.onsuccess = function onsuccess(event) {
          event.target.result.forEach(function eachApp(app) {
            var manifest = app.manifest;
            if (!app.launch || !manifest || !manifest.icons ||
                that._isHiddenApp(manifest.role)) {
              return;
            }
            that.installedApps[app.manifestURL] = app;
          });

          resolve(that._reloadCardList());
        };
        request.onerror = function() {
          reject();
          that._asyncSemaphore.p();
        };
        appMgmt.addEventListener('install', that);
        appMgmt.addEventListener('uninstall', that);
      }).then(function() {
        that._asyncSemaphore.p();
      });
    },

    uninit: function cm_uninit() {
      var appMgmt = navigator.mozApps.mgmt;
      appMgmt.removeEventListener('install', this);
      appMgmt.removeEventListener('uninstall', this);

      this._cardList = [];
      this._cardStore.off('change');
      this._cardStore = undefined;
      this.installedApps = {};
    },

    getAppEntries: function cm_getAppEntries(manifestURL) {
      if (!manifestURL || !this.installedApps[manifestURL]) {
        return [];
      }

      var manifest = this.installedApps[manifestURL].manifest ||
        this.installedApps[manifestURL].updateManifest;
      var entryPoints = manifest.entry_points;
      var entries = [];
      var removable = this.installedApps[manifestURL].removable;

      if (!entryPoints || manifest.type !== 'certified') {
        entries.push({
          manifestURL: manifestURL,
          entryPoint: '',
          name: manifest.name,
          removable: removable,
          type: 'Application'
        });
      } else {
        for (var entryPoint in entryPoints) {
          if (entryPoints[entryPoint].icons) {
            entries.push({
              manifestURL: manifestURL,
              entryPoint: entryPoint,
              name: entryPoints[entryPoint].name,
              removable: removable,
              type: 'Application'
            });
          }
        }
      }
      return entries;
    },

    getEntryManifest: function cm_getEntryManifest(manifestURL, entryPoint) {
      if (!manifestURL || !this.installedApps[manifestURL]) {
        return null;
      }

      var manifest = this.installedApps[manifestURL].manifest ||
        this.installedApps[manifestURL].updateManifest;

      if (entryPoint) {
        var entry_manifest = manifest.entry_points[entryPoint];
        return entry_manifest || null;
      }

      return manifest;
    },

    getIconBlob: function cm_getIconBlob(options) {
      var manifestURL = options.manifestURL;
      var entryPoint = options.entryPoint;
      var preferredSize = options.preferredSize;
      var that = this;
      return new Promise(function(resolve, reject) {
        var entry_manifest = that.getEntryManifest(manifestURL, entryPoint);
        if (!entry_manifest) {
          reject('No manifest');
        }

        var iconData = that._bestMatchingIcon(
          that.installedApps[manifestURL], entry_manifest, preferredSize);
        if (!iconData) {
          reject('No url');
          return;
        }

        that._loadFile({
          url: iconData[0],
          responseType: 'blob'
        }).then(function onFulfill(blob) {
          resolve([blob, iconData[1]]);
        }, function onReject(error) {
          reject('Error on loading blob of ' + manifestURL);
        });
      });
    },

    _getLocalizedName: function cm_getLocalizedName(manifestURL, lang) {
      if (!manifestURL || !lang) {
        return;
      }

      var manifest = this.getEntryManifest(manifestURL);
      var locales = manifest.locales;
      var localizedName = locales && locales[lang] &&
        (locales[lang].short_name || locales[lang].name);
      return localizedName || manifest.short_name || manifest.name;
    },

    // Resolve to one of the following forms:
    // 1. {raw: 'localized name'}
    // 2. {id: 'l10nid'}
    // 3. undefined
    resolveCardName: function cm_resolveCardName(card, lang) {
      var name;
      if (!card || !lang) {
        return name;
      }

      // Priority is:
      // 1. user given name
      // 2. l10nId if any
      // 3. localized application/deck name if it is an application/deck
      if (card.name && card.name.raw) {
        name = {
          raw: card.name.raw
        };
      } else if (card.name && card.name.id) {
        name = card.name;
      } else if (card.nativeApp &&
          (card instanceof Application || card instanceof Deck)) {
        name = {
          raw: this._getLocalizedName(card.nativeApp.manifestURL, lang)
        };
      }
      return name;
    },

    getCardList: function cm_getCardList() {
      var that = this;
      return this._getPipedPromise('getCardList', function(resolve, reject) {
        that._asyncSemaphore.wait(function() {
          resolve(that._reloadCardList());
        }, that);
      }).then(function() {
        return Promise.resolve(that._cardList);
      });
    },

    getFilteredCardList: function cm_getFilteredCardList(filterName) {
      return this.getCardList().then(function(allCards) {
        var filteredCards = [];
        if (filterName === 'all') {
          filteredCards = allCards;
        } else if (filterName) {
          allCards.forEach(function(card) {
            if (card.group === filterName) {
              filteredCards.push(card);
            }
          });
        }
        return Promise.resolve(filteredCards);
      });
    },

    // TODO: need to be protected by semaphore
    // There are three types of query:
    // 1. query by cardId
    // 2. query by manifestURL and optionally launchURL
    // 3. query by cardEntry (i.e. serialized card)
    findCardFromCardList: function cm_findCardFromCardList(query) {
      var found;
      this._cardList.some(function(card) {
        if (card instanceof Folder) {
          // XXX: findCard() shares almost the same logic as
          // findCardFromCardList. We should consolidate them. See
          // http://bugzil.la/1156726
          found = card.findCard(query);
          if (found) {
            return true;
          }
        }

        if (card.cardId === query.cardId) {
          found = card;
          return true;
        } else if (query.manifestURL && card.nativeApp &&
            card.nativeApp.manifestURL === query.manifestURL) {

          // if we specify launchURL in query, then we must compare
          // launchURL first
          if (query.launchURL) {
            if (card.launchURL === query.launchURL) {
              found = card;
              return true;
            }
          } else {
            found = card;
            return true;
          }
        } else if (query.cardEntry) {
          // XXX: this could be bad at performance because we serialize card
          // in every loop. We might need improvement on this query.
          if (JSON.stringify(card.serialize()) ===
              JSON.stringify(query.cardEntry)) {
            found = card;
            return true;
          }
        }
      });
      return found;
    },

    findContainingFolder: function cm_findContainingFolder(query) {
      var folder;
      this._cardList.some(function(card) {
        if (card instanceof Folder) {
          if (card.findCard(query)) {
            folder = card;
          }
        }
      });
      return folder;
    },

    isPinned: function cm_isPinned(options) {
      var that = this;
      return this._getPipedPromise('isPinned', function(resolve, reject) {
        that._asyncSemaphore.wait(function() {
          resolve(that._reloadCardList());
        }, that);
      }).then(function() {
        return Promise.resolve(!!that.findCardFromCardList(options));
      });
    },

    handleEvent: function cr_handleEvent(evt) {
      switch(evt.type) {
        case 'install':
          this._onAppInstall(evt);
          break;
        case 'uninstall':
          this._onAppUninstall(evt);
          break;
      }
    }
  });

  SharedUtils.addMixin(CardManager, new PipedPromise());

  exports.CardManager = CardManager;
}(window));

(function(exports) {
  'use strict';

  exports.Animations = {

    createCircleAnimation: function ani_createCircleAnimation(
                                      container, backgroundColor) {

      var circleElem = document.createElement('div');
      circleElem.className = 'animation-circle';
      if (backgroundColor) {
        circleElem.style.backgroundColor = backgroundColor;
      }

      var animationType;
      var animationCallback;
      var isPlaying = false;
      circleElem.addEventListener('animationend', function(evt) {
        if (evt.target === circleElem) {
          if (animationCallback) {
            animationCallback();
          }
          circleElem.classList.remove(animationType);
          container.removeChild(circleElem);
          isPlaying = false;
        }
      });

      var play = function (type, callback) {
        isPlaying = true;
        animationType = type || 'grow';
        animationCallback = callback;
        circleElem.classList.add(animationType);
        container.appendChild(circleElem);
      };

      return {
        play: play,
        isPlaying: function() {
          return isPlaying;
        }
      };
    },

    _findChildInViewport: function(container, selector) {
      // find the elements in viewport
      var child;
      var childRect;
      var children = container.querySelectorAll(selector);
      var childrenInViewport = [];
      var i;

      for(i = 0; i < children.length; i++) {
        child = children[i];
        childRect = child.getBoundingClientRect();
        if (childRect.right >= 0 &&
          childRect.left <= window.innerWidth) {
          childrenInViewport.push({
            left: childRect.left,
            child: child
          });
        }
      }

      // sort child indexes. Card position may not be the same as index
      // after a new child is pinned to home
      childrenInViewport.sort(function(childObj1, childObj2) {
        if (childObj1.left > childObj2.left) {
          return 1;
        }
        if (childObj1.left < childObj2.left) {
          return -1;
        }
        return 0;
      });

      return childrenInViewport;
    },

    /**
     * Perform bubbling animation on the children elements 'relative to' the
     * container.
     * @param  {HTMLElement} container       Container for bubble animation.
     * @param  {Object}      querySelector   Representation for querySelector
     * @param  {Number}      bubbleInterval  Time interval between two bubbles.
     * @param  {Function}    callback        The function that will be called
     *                                       once all the children finish
     *                                       bubbling animation.
     */
    doBubbleAnimation: function(container, querySelector, bubbleInterval,
                                callback) {

      // only do the animation on elements in viewport
      var childrenInViewport = this._findChildInViewport(
                                            container, querySelector);

      var endBubble = function() {
        for(i = 0; i < childrenInViewport.length; i++) {
          child = childrenInViewport[i].child;
          child.classList.remove('animation-bubble-start');
          child.removeEventListener('animationend', onBubbleEnd);
        }
        if (callback) {
          callback();
        }
      }.bind(this);

      // Need to wait until the last element has finished bubbling.
      // Note: The class also overrides transform properties on the child,
      // so we should not remove it until all the animations end.
      var childTransitionEndCount = 0;
      var onBubbleEnd = function(evt) {
        childTransitionEndCount++;
        if (childTransitionEndCount === childrenInViewport.length) {
          endBubble();
        }
      };

      // start adding bubble animation class on every child
      var child;
      var i;
      for(i = 0; i < childrenInViewport.length; i++) {
        child = childrenInViewport[i].child;
        child.classList.add('animation-bubble-start');
        child.style.animationDelay = ((i + 1) * bubbleInterval / 1000) + 's';
        child.addEventListener('animationend', onBubbleEnd);
      }

      return endBubble;
    }
  };
})(window);

/* global evt, KeyEvent */
(function(exports) {
  'use strict';
  /**
   * SimpleKeyNavigation handles left/right or top/bottom keys to move the
   * focus. It is a very simple version of key navigation. It only moves the
   * focus among an array.
   *
   * Please note that this module listens key event and changes focus while we
   * start it. If we don't need it, we should stop it.
  **/
  function SimpleKeyNavigation() {
  }

  var proto = SimpleKeyNavigation.prototype = new evt();

  SimpleKeyNavigation.DIRECTION = Object.freeze({
    'HORIZONTAL': 'horizontal',
    'VERTICAL': 'vertical'
  });

  proto.start = function skn_start(list, direction, options) {
    this.direction = direction;
    this.updateList(list);
    this.isChild = options ? !!options.isChild : false;
    this.target = (options && options.target) || window;
    if (!this.isChild) {
      this.target.addEventListener('keydown', this);
    }
  };

  proto.stop = function skn_stop() {
    this.target.removeEventListener('keydown', this);
  };

  proto.updateList = function skn_updateList(list) {
    this._List = list;
    this._focusedIndex = -1;
    if (list.length > 0) {
      this._focusedIndex = 0;
      this.focus();
    }
  };

  proto.focus = function skn_focus() {
    var elem = this._List[this._focusedIndex];
    if (elem.focus && (typeof elem.focus) === 'function') {
      elem.focus();
    }
    // Fon nested case, we need to propagate child navigator event to parent.
    if (elem instanceof SimpleKeyNavigation) {
      elem = elem._List[elem._focusedIndex];
    }
    this.fire('focusChanged', elem);
  };

  proto.blur = function skn_blur() {
    var elem = this._List[this._focusedIndex];
    elem.blur && (typeof elem.blur === 'function') && elem.blur();

    // Fon nested case, we need to propagate child navigator event to parent.
    if (elem instanceof SimpleKeyNavigation) {
      elem = elem._List[elem._focusedIndex];
    }
    this.fire('focusBlurred', elem);
  };

  proto.focusOn = function skn_focusOn(elem) {
    var index = this._List.indexOf(elem);
    if (index >= 0) {
      this._focusedIndex = index;
      this._List[this._focusedIndex].focus();
      this.fire('focusChanged', this._List[this._focusedIndex]);
    }
  };

  proto.movePrevious = function skn_movePrevious() {
    if (this._focusedIndex < 1) {
      return;
    }

    this._focusedIndex--;
    this.focus();
  };

  proto.moveNext = function skn_moveNext() {
    if (this._focusedIndex > this._List.length - 2) {
      return;
    }
    this._focusedIndex++;
    this.focus();
  };

  proto.handleKeyMove = function skn_handleKeyMove(e, pre, next) {
    if (e.keyCode === pre) {
      this.movePrevious();
    } else if (e.keyCode === next) {
      this.moveNext();
    }
  };

  proto.propagateKeyMove = function skn_propagateKeyMove(e, pre, next) {
    if (this._List[this._focusedIndex] instanceof SimpleKeyNavigation &&
      (e.keyCode === pre || e.keyCode === next)) {
      this._List[this._focusedIndex].handleEvent(e);
    }
  };

  proto.handleEvent = function skn_handleEvent(e) {
    if (this.direction === SimpleKeyNavigation.DIRECTION.HORIZONTAL) {
      this.handleKeyMove(e, KeyEvent.DOM_VK_LEFT, KeyEvent.DOM_VK_RIGHT);
      this.propagateKeyMove(e, KeyEvent.DOM_VK_UP, KeyEvent.DOM_VK_DOWN);
    } else {
      this.handleKeyMove(e, KeyEvent.DOM_VK_UP, KeyEvent.DOM_VK_DOWN);
      this.propagateKeyMove(e, KeyEvent.DOM_VK_LEFT, KeyEvent.DOM_VK_RIGHT);
    }
  };

  exports.SimpleKeyNavigation = SimpleKeyNavigation;

})(window);
