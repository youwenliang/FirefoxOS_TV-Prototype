/* global evt, SpatialNavigator */

(function(exports) {
  'use strict';

  /**
   *The DOM hierarchy used in XScrollable looks like:
   * <frame>
   *   <list>
   *     <node>
   *       <item> (choosed by selector)
   *       <other elements>
   * Users need to specify <frame>, <list>, <node> elements through initialize
   * parameters.
   *
   * User can also omit <item> element, and specify <node>s as focus target.
   * In this case, <node> and <item> refer to the same dom structure.
   * To use scrollable.js, the minimal required css style is:
   * #frame {
   *   width: (any width you would like to set);
   *   height: (any height you would like to set);
   *   overflow: hidden;
   * }
   *
   * #list {
   *   width: 100%
   *   transition: transform 0.2s ease;
   *   transform-origin: 0 50%;
   *   position: relative;
   * }
   *
   * .node {
   *   margin-left: 0;
   *   margin-left: 0;
   *   margin-top: (any margin you would like to set);
   *   margin-bottom: (any margin you would like to set);
   *   left: 0;
   *   position: absolute;
   * }
   * The main reason for this is that scrollable.js uses transformX internally
   * to locate position of nodes (to achieve edit/arrange feature).
   *
   * Left margin should be set through scrollable.leftMargin.
   * (which is default to 2, and can be assigned through initialize params)
   */
  var DEFAULT_SPACING = 2;
  var DEFAULT_LEFT_MARGIN = 2;
  var REVERSE_LIST_BOUNDARY = 0.5;
  function XScrollable(param) {
    this.translateX = 0;
    this._colspanOnFocus = 0;

    this.frameElem = (typeof param.frameElem === 'string') ?
                    document.getElementById(param.frameElem) : param.frameElem;
    this.listElem = (typeof param.listElem === 'string') ?
                    document.getElementById(param.listElem) : param.listElem;
    this.nodes = Array.prototype.slice.call(this.listElem.children);

    this.spacing = param.spacing || DEFAULT_SPACING;
    this.leftMargin = param.leftMargin || DEFAULT_LEFT_MARGIN;

    this.itemClassName = param.itemClassName;
    var items = Array.prototype.slice.call(
                    this.listElem.getElementsByClassName(param.itemClassName));

    this.listElem.addEventListener('transitionend', this);

    var defaultItem = this.listElem.dataset.defaultItem;
    this.spatialNavigator = new SpatialNavigator(items);
    this.spatialNavigator.focus(
              items.length > defaultItem ? items[defaultItem] : null);
    this.spatialNavigator.on('focus', this.handleSelection.bind(this));
    this.spatialNavigator.on('unfocus', this.handleUnfocus.bind(this));

    this._setNodesPosition();

    this.setScale(param.scale || 1);

    this.isSliding = false;
    this.isHovering = false;
    this.hoveringItem = null;
    this.hoveredItem = null;
    this._isRevesed = false;

    if (param.referenceElement) {
      this.setReferenceElement(param.referenceElement);
    }
  }

  XScrollable.prototype = evt({
    CLASS_NAME: 'XScrollable',

    uninit: function(elem) {
      this.listElem.removeEventListener('transitionend', this);
    },

    getItemRect: function(elem) {
      var frameRect = this.frameElem.getBoundingClientRect();
      var node = this.getNodeFromItem(elem);
      var idx = parseInt(node.dataset.idx, 10);
      var tabstop = this._getTabstop(idx);
      var result = { left: (frameRect.left +
          (node.offsetWidth + this.spacing * 10) * tabstop) * this.scale +
          this.translateX,
        top: (frameRect.top + elem.offsetTop) * this.scale,
        width: (elem.offsetWidth) * this.scale,
        height: (elem.offsetHeight) * this.scale
      };
      return result;
    },

    getBoundingClientRect: function() {
      return this.frameElem.getBoundingClientRect();
    },

    endSlide: function() {
      // remove transition we added
      this.listElem.classList.add('no-transition');
      // if an user close home app when card-list is sliding, we have to force
      // close the sliding transition (transition-delay = 0 is not working)
      this.forceReflow(this.listElem);
      this.listElem.classList.remove('no-transition');
      this.listElem.style.transitionDuration = null;

      // set positions of other nodes to create moving effect
      if (!this.isHovering) {
        // If a card is hovering over a folder, the positions and focus will not
        // be set here.
        this._setOtherNodesPosition(this.newCardIndex);
        this.focus(this.newCardIndex);
      }
      this.fire('slideEnd');
      this.isSliding = false;
    },

    _slide: function(newItem, idx) {
      this.isSliding = true;
      this.newCardIndex = idx;

      // Start sliding animation of card list.
      // Also consider the case when the card-list does not need to scroll
      // or the document is not visibile.
      var prevTransform = this.listElem.style.transform;
      var distance = Math.abs(this._getScrollOffset(newItem) -
                              this.translateX);
      var duration = (distance < 960) ? 0.3 : distance / 2000;

      this.listElem.style.transitionDuration = duration + 's';
      this.scrollTo(newItem);
      if (!prevTransform ||
          prevTransform === this.listElem.style.transform ||
          this.refElem ||
          document.visibilityState !== 'visible') {
        this.endSlide();
      }
    },

    scrollTo: function(itemElem) {
      if (!itemElem) {
        return this.translateX;
      }
      this.translateX = this._getScrollOffset(itemElem);
      this._setScrollStyle();
    },

    resetScroll: function() {
      this.translateX = 0;
      this.scrollTo(this.getItem(0));
    },

    _setScrollStyle: function() {
      this.listElem.style.transform = 'translateX(' + this.translateX + 'px) ' +
                                      'scale(' + this.scale + ')';
    },

    setScale: function(scale) {
      scale = scale ? scale : 1;
      this.scale = scale;
      // We need to reset translateX and let getScrollOffset detect the
      // scroll amont again against new scale to focused element.
      this.translateX = 0;
      this.scrollTo(this.currentItem);
    },

    setReferenceElement: function(elem) {
      this.refElem = elem;
      if (!this.length || !this.refElem) {
        return false;
      }

      var refRect;
      if (this.refElem.CLASS_NAME === 'XScrollable') {
        refRect = this.refElem.getItemRect(this.refElem.currentItem);
      } else {
        refRect = this.refElem.getBoundingClientRect();
      }

      // If the reference element locates at right of the screen without enough
      // space, we need to show the list reversedly toward left of the screen.
      this._isReversed = refRect.left >
                       this.frameElem.offsetWidth * REVERSE_LIST_BOUNDARY;
      this.listElem.classList.toggle('reversed', this._isReversed);
      // Determine initial focus (depends on reversed or not)
      var initNode = this.getItemFromNode(
                     this.getNode(this._isReversed ? this.length - 1 : 0));
      this.spatialNavigator.focusSilently(initNode);

      // Calculate initial position with respect to reference element. The
      // initNode should get its center aligned with reference element
      // on x-axis.
      // this.refPoint saves the x-coordinate that makes initNode aligned.
      var unitLength = (initNode.offsetWidth + this.spacing * 10) * this.scale;

      this.refPoint =
        refRect.left + (refRect.width - initNode.offsetWidth * this.scale) / 2;
      if (this._isReversed) {
        this.translateX = this.refPoint - unitLength * (this.length - 1);
      } else {
        this.translateX = this.refPoint;
      }
      this._setScrollStyle();
      return true;
    },

    // Tabstop: real position of an index in multiple of item width.
    _getTabstop: function(idx) {
      if (this.isHovering) {
        var item = this.getItemFromNode(this.nodes[idx]);
        if (item === this.hoveringItem || item === this.hoveredItem) {
          var node1 = this.getNodeFromItem(this.hoveringItem);
          var node2 = this.getNodeFromItem(this.hoveredItem);
          return  (parseInt(node1.dataset.idx, 10) +
                   parseInt(node2.dataset.idx, 10)) / 2;
        }
      }
      if (idx < this.currentIndex) {
        return idx;
      } else if (idx === this.currentIndex) {
        return idx + (this._colspanOnFocus / 2);
      } else {
        return idx + this._colspanOnFocus;
      }
    },

    _getScrollOffset: function(itemElem) {
      if (this.refElem) {
        return this._getScrollOffsetByReferenceElement(itemElem);
      }

      var node = this.getNodeFromItem(itemElem);
      var idx = parseInt(node.dataset.idx, 10);
      var tabstop = this._getTabstop(idx);
      var tabcount = this.length + this._colspanOnFocus;
      var unitLength = (node.offsetWidth + this.spacing * 10) * this.scale;
      var frameWidth = this.frameElem.offsetWidth;

      // If elements don't overflow, align them in center.
      if (unitLength * tabcount + this.leftMargin * 10 < frameWidth) {
        return -(unitLength * tabcount - this.spacing * 10 - frameWidth) / 2;
      }

      if (unitLength * tabstop < this.leftMargin * 10 - this.translateX) {
        if (tabstop !== 0) {
          return -unitLength * (tabstop - 0.5);
        } else {
          return this.leftMargin * 10;
        }
      } else if (unitLength * (tabstop + 1) > frameWidth - this.translateX) {
        return frameWidth - unitLength * (tabstop + 1.5);
      } else {
        return this.translateX;
      }
    },

    // There's always a node center-aligned with the reference element.
    // (if exist)
    // TODO: Evaluate whether we can merge this function with _getScrollOffset.
    _getScrollOffsetByReferenceElement: function(itemElem) {
      var node = this.getNodeFromItem(itemElem);
      var idx = parseInt(node.dataset.idx, 10);
      var tabstop = this._getTabstop(idx);
      var unitLength = (node.offsetWidth + this.spacing * 10) * this.scale;
      var frameWidth = this.frameElem.offsetWidth;

      // Count maximum nodes that can be shown from the aligned node
      // to left/right viewport (aligned node itself is counted to right)
      var maxLeftNodes = Math.floor(this.refPoint / unitLength);
      var maxRightNodes = Math.floor((frameWidth - this.refPoint) / unitLength);

      // Calculate translate amount with respect to reference point.
      if (unitLength * tabstop < this.leftMargin * 10 - this.translateX) {
        return this.refPoint - (maxLeftNodes + tabstop) * unitLength;
      } else if (unitLength * (tabstop + 1) > (frameWidth - this.translateX)) {
        return this.refPoint - (tabstop - maxRightNodes + 1) * unitLength;
      } else {
        return this.translateX;
      }
    },

    getNodeFromItem: function(itemElem) {
      if (!itemElem) {
        return null;
      }
      var nodeElem = itemElem;
      while (nodeElem.parentElement !== this.listElem) {
        nodeElem = nodeElem.parentElement;
      }
      return nodeElem;
    },

    getItem: function(index) {
      var node;
      if (index < this.nodes.length) {
        node = this.nodes[index];
      }
      return node;
    },

    getItemFromNode: function(nodeElem) {
      if (!nodeElem) {
        return null;
      }
      if (nodeElem.classList.contains(this.itemClassName)) {
        return nodeElem;
      } else {
        return nodeElem.getElementsByClassName(this.itemClassName)[0];
      }
    },

    getNextItem: function(itemElem) {
      return this.getItemFromNode(this._getNextNode(itemElem));
    },

    getPrevItem: function(itemElem) {
      return this.getItemFromNode(this._getPrevNode(itemElem));
    },

    _getNextNode: function(itemElem) {
      var nodeElem = this.getNodeFromItem(itemElem);
      var idx = parseInt(nodeElem.dataset.idx, 10) + 1;
      if (idx < 0 || idx >= this.nodes.length) {
        return null;
      }
      return this.nodes[idx];
    },

    _getPrevNode: function(itemElem) {
      var nodeElem = this.getNodeFromItem(itemElem);
      var idx = parseInt(nodeElem.dataset.idx, 10) - 1;
      if (idx < 0 || idx >= this.nodes.length) {
        return null;
      }
      return this.nodes[idx];
    },

    handleSelection: function(itemElem) {
      this.scrollTo(itemElem);
      this.fire('focus', this, itemElem, this.getNodeFromItem(itemElem));
    },

    handleUnfocus: function(itemElem) {
      this.fire('unfocus', this, itemElem, this.getNodeFromItem(itemElem));
    },

    addNode: function(nodeElem) {
      var itemElem = this.getItemFromNode(nodeElem);
      if (!itemElem) {
        return false;
      }
      this.nodes.push(nodeElem);
      if (this.spatialNavigator.add(itemElem) &&
          !!this.listElem.appendChild(nodeElem)) {
        this._setNodePosition(this.nodes.length - 1);
        return true;
      }
      return false;
    },

    getNode: function(index) {
      return this.nodes[index];
    },

    removeNode: function(node) {
      if (typeof node === 'number') {
        node = this.nodes[node];
      }

      var itemElem = this.getItemFromNode(node);

      if(!itemElem) {
        return false;
      }

      var focus = this.spatialNavigator.getFocusedElement();

      // When the selected item is being removed, we set focus to next item.
      // If next item doesn't exist, we set focus to previous item.
      var newfocus = (focus == itemElem) ?
          this.getNextItem(focus) || this.getPrevItem(focus) :
          focus;
      this.spatialNavigator.remove(itemElem);
      this.listElem.removeChild(node);

      this.nodes.splice(parseInt(node.dataset.idx, 10), 1);
      this._setNodesPosition();

      this.spatialNavigator.focus(newfocus);
      return true;
    },

    removeNodes: function(indices) {
      // Find nearest nodes that is not removed as new focus.
      var focusIdx = this.nodes.indexOf(this.getNodeFromItem(this.currentItem));
      var newFocusIdx;
      var minDistance = Number.MAX_VALUE;

      var newNodes = this.nodes.filter(function(node, oldindex) {
        if(indices.indexOf(oldindex) !== -1) {
          var itemElem = this.getItemFromNode(node);
          this.spatialNavigator.remove(itemElem);
          this.listElem.removeChild(node);
          return false;
        }

        var distance = Math.abs(focusIdx - oldindex);
        if(distance < minDistance) {
          minDistance = distance;
          newFocusIdx = oldindex;
        }
        return true;
      }, this);

      var newFocus = this.getItemFromNode(this.nodes[newFocusIdx]);
      var isRemovingHoveringItem = this.isHovering &&
          indices.length === 1 &&
          this.hoveringItem === this.getItemFromNode(this.nodes[indices[0]]);
      this.nodes = newNodes;
      // XXX newFocus check is a workaround to check if there's no node
      //     in the scrollable, after discussion we leave it here temporarily.
      if (!this.isHovering && newFocus) {
        // When currently no node is hovering over a folder and the scrollable
        // is not empty after removing nodes,
        // reset node positions and the next focus item.
        this._setNodesPosition();
        this.spatialNavigator.focus(newFocus);
      } else if (isRemovingHoveringItem) {
        // In case of hovering, we only remove the hovering item.
        // When the removed node was hovering over a folder, after it's removed,
        // reset the idx of the remaining nodes, set the focus to the hovered
        // folder, fire the event to notify the remaining move to folder actions
        // and unhover silently without firing an event.
        var hoveringItem = this.hoveringItem;
        var hoveredItem = this.hoveredItem;
        this._colspanOnFocus = 1;
        this.spatialNavigator.focusSilently(this.hoveredItem);
        this.unhoverSilently();
        this._setNodesPosition();
        this.fire('hovering-node-removed', hoveringItem, hoveredItem);
      }
    },

    insertNodeBefore: function(newNode, startNode) {
      if (typeof startNode === 'number') {
        startNode = this.nodes[startNode];
      }

      var itemElem = this.getItemFromNode(newNode);
      if (!itemElem) {
        return false;
      }

      var newIdx = startNode ?
                      parseInt(startNode.dataset.idx, 10) : this.nodes.length;
      this.nodes.splice(newIdx, 0, newNode);
      this.listElem.appendChild(newNode);
      this._setNodePosition(newIdx);

      this.spatialNavigator.add(itemElem);
      if (this.refElem) {
        this.realignToReferenceElement();
        this._shiftNodesPosition(1, newIdx);
      }
      this._slide(this.getItemFromNode(newNode), newIdx);

      return true;
    },

    insertNodeOver: function(newNode, startNode) {
      if (typeof startNode === 'number') {
        startNode = this.nodes[startNode];
      }

      var itemElem = this.getItemFromNode(newNode);
      if (!itemElem) {
        return false;
      }

      this._colspanOnFocus = 0;
      var newIdx =  parseInt(startNode.dataset.idx, 10);

      this.nodes.splice(newIdx, 0, newNode);
      this.listElem.appendChild(newNode);
      this._setNodesPosition();

      this.spatialNavigator.add(itemElem);
      this.hover(itemElem, this.getItemFromNode(startNode));
      this.focus(newIdx);
      this._slide(this.getItemFromNode(startNode), newIdx + 1);
      this.fire('node-inserted-over-folder');

      return true;
    },

    get currentItem() {
      return this.spatialNavigator.getFocusedElement();
    },

    get currentIndex() {
      return this.nodes.indexOf(
        this.getNodeFromItem(this.spatialNavigator.getFocusedElement()));
    },

    get length() {
      return this.nodes.length;
    },

    get isReversed() {
      return this._isReversed;
    },

    get allItems() {
      var that = this;
      var items = [];
      this.nodes.forEach(function(node) {
        var item = that.getItemFromNode(node);
        if (item) {
          items.push(item);
        }
      });
      return items;
    },

    _setOtherNodesPosition: function(skipIdx) {
      this.nodes.forEach(function(node, idx) {
        if (idx != skipIdx) {
          this._setNodePosition(idx);
        }
      }, this);
    },

    _setNodesIdx: function() {
      this.nodes.forEach(function(node, idx) {
        this.nodes[idx].dataset.idx = idx;
      }, this);
    },

    _setNodesPosition: function() {
      this.nodes.forEach(function(node, idx) {
        this._setNodePosition(idx);
      }, this);
    },

    _setNodePosition: function(idx) {
      this.nodes[idx].dataset.idx = idx;
      var tabstop = this._getTabstop(idx);
      this.getNodeFromItem(this.nodes[idx]).style.transform =
        'translateX(calc((100% + ' + this.spacing + 'rem) * ' + tabstop + '))';
    },

    /**
     * Shift node positions without animations.
     * @param  {[type]} offset  The unit offset. Use positive integer to shift
     *                          right and negative integer to shift left.
     * @param  {[type]} skipIdx The index of the node that needs not be shifted.
     */
    _shiftNodesPosition: function(offset, skipIdx) {
      this.nodes.forEach(function(node, idx) {
        if (idx !== skipIdx) {
          node.style.transitionProperty = 'none';
          var tabstop = this._getTabstop(idx) + offset;
          this.getNodeFromItem(node).style.transform =
            'translateX(calc((100% + ' +
            this.spacing + 'rem) * ' + tabstop + '))';
        }
      }.bind(this));

      this.forceReflow(this.nodes[0]);

      this.nodes.forEach(function(node) {
        node.style.transitionProperty = '';
      });
    },

    swap: function(node1, node2) {
      if (typeof node1 === 'number') {
        node1 = this.nodes[node1];
      }
      if (typeof node2 === 'number') {
        node2 = this.nodes[node2];
      }
      if (!node1 || !node2) {
        return false;
      }

      var idx1 = parseInt(node1.dataset.idx, 10);
      var idx2 = parseInt(node2.dataset.idx, 10);
      this.nodes[idx1] = node2;
      this.nodes[idx2] = node1;
      this._setNodePosition(idx1);
      this._setNodePosition(idx2);
      this.focus();

      // TODO: handle cases that one of the swapped nodes is focused.
      // ... should we really need to handle this case?
      return true;
    },

    hover: function(item1, item2) {
      var node1 = this.getNodeFromItem(item1);
      var node2 = this.getNodeFromItem(item2);

      if (!node1 || !node2) {
        return false;
      }

      var idx1 = parseInt(node1.dataset.idx, 10);
      var idx2 = parseInt(node2.dataset.idx, 10);
      this.isHovering = true;
      this.hoveringItem = item1;
      this.hoveredItem = item2;
      item1.classList.add('hover');
      item2.classList.add('hovered');
      node1.classList.add('hover');
      node2.classList.add('hovered');
      this._setNodePosition(idx1);
      this._setNodePosition(idx2);
      this.fire('hover', this);
      return true;
    },

    unhover: function(shouldResetCardPositions) {
      var node1 = this.getNodeFromItem(this.hoveringItem);
      var node2 = this.getNodeFromItem(this.hoveredItem);

      this.fire('unhover', this);
      this.isHovering = false;

      if (shouldResetCardPositions) {
        this._setNodesPosition();
      }

      this.hoveringItem.classList.remove('hover');
      this.hoveredItem.classList.remove('hovered');
      node1.classList.remove('hover');
      node2.classList.remove('hovered');
      this.hoveringItem = null;
      this.hoveredItem = null;
    },

    unhoverSilently: function() {
      var node = this.getNodeFromItem(this.hoveredItem);

      this.isHovering = false;
      this.hoveredItem.classList.remove('hovered');
      node.classList.remove('hovered');
      this.hoveringItem = null;
      this.hoveredItem = null;
    },

    getTargetItem: function(direction) {
      if (direction === 'left') {
        return this.getPrevItem(this.currentItem);
      } else if (direction === 'right') {
        return this.getNextItem(this.currentItem);
      }
    },

    focus: function(item) {
      if (typeof item === 'number') {
        item = this.getItemFromNode(this.nodes[item]);
      } else if (typeof item === 'undefined') {
        item = this.currentItem || 0;
      }
      this.spatialNavigator.focus(item);
    },

    move: function(direction) {
      return this.spatialNavigator.move(direction);
    },

    clean: function() {
      this.spatialNavigator.setCollection();
      this.spatialNavigator.unfocus();
      this.listElem.innerHTML = '';
      this.nodes.length = 0;
    },

    isEmpty: function() {
      return !this.nodes.length;
    },

    handleEvent: function (evt) {
      if (evt.type === 'transitionend') {
        if (evt.target === this.listElem && evt.propertyName === 'transform') {
          if (this.isSliding) {
            this.endSlide();
          }
          this.fire('listTransformEnd', this.listElem);
        } else if (evt.target.classList.contains('card') &&
            evt.propertyName === 'transform') {
          this.fire('nodeTransformEnd', evt.target);
        }
      }
    },

    setColspanOnFocus: function(colspanOnFocus) {
      this._colspanOnFocus = colspanOnFocus;
      this._setNodesPosition();
      this.scrollTo(this.currentItem);
    },

    realignToReferenceElement: function() {
      if (this.refElem) {
        this.setReferenceElement(this.refElem);
      }
    },

    forceReflow: function(element) {
      getComputedStyle(element).width;
    }

  });
  exports.XScrollable = XScrollable;
})(window);

'use strict';
/* global evt */

(function(exports) {
  /**
   * SpatialNavigator simulates four-direction navigation in Javascript level.
   *
   * Navigation is the ability to navigate between focusable elements
   * within a structured document or user interface according to the spatial
   * location. Users are assumed navigating among elements on a 2D plane by
   * arrow keys (up/down/left/right).
   *
   * SpatialNavigator keeps a 'focused' element by itself. When navigating,
   * focus/unfocus events are triggered automatically. Notice the focus is just
   * an internal state rather than actual focus of DOM Element. User should
   * add event listeners of those events, and design required behaviors.
   *
   * @class SpatialNavigator
   * @param {Array.<SpatialNavigatorElement>} [collection=[]]
   *        An initial set of traversable elements.
   * @param {Object} [config]
   *        An initial set of configurations.
   */
  /**
   * SpatialNavigatorElement is a navigable element which can be traversed
   * by {@link SpatialNavigator}. Valid types are as follows:
   *
   *  1. a standard HTMLElement.
   *  2. an Object contains at least 4 properties: left, top, width, and height.
   *  3. an Object implementing getBoundingRect() which returns an object of 2.
   *
   * @typedef {Object} SpatialNavigatorElement
   */
  /**
   * Fired when an element is focused.
   * @event SpatialNavigator#focus
   * @property {SpatialNavigatorElement} elem    The element which got focus.
   */
  /**
   * Fired when an element is unfocused.
   * @event SpatialNavigator#unfocus
   * @property {SpatialNavigatorElement} elem    The element which lost focus.
   */
  function SpatialNavigator(collection, config) {
    this._focus = null;
    this._previous = null;

    this.setCollection(collection);

    if (config) {
      for (var key in config) {
        this[key] = config[key];
      }
    }
  }

  SpatialNavigator.prototype = evt({
    /**
     * Limit the navigating direction to vertical and horizontal only. Targets
     * in oblique (left-top, right-top, left-bottom, and right-bottom)
     * directions are always ignored.
     * @type {Boolean}
     * @default false
     * @memberof SpatialNavigator.prototype
     */
    straightOnly: false,

    /**
     * This threshold is used to determine whether an element is considered in
     * straight (vertical or horizontal) directions. Valid number is between 0
     * to 1.0. Setting it to 0.3 means an element is counted in the straight
     * directions if it overlaps the straight area at least 0.3x of width of the
     * area.
     * @type {Number}
     * @default 0.5
     * @memberof SpatialNavigator.prototype
     */
    straightOverlapThreshold: 0.5,

    /**
     * Ignore elements with "display: none", "visibility: hidden" or
     * "aria-hidden=true".
     * @type {Boolean}
     * @default false
     * @memberof SpatialNavigator.prototype
     */
    ignoreHiddenElement: false,

    /**
     * The previous focused element has high priority to be chosen as the next
     * candidate.
     * @type {Boolean}
     * @default false
     * @memberof SpatialNavigator.prototype
     */
    rememberSource: false,

    /**
     * A callback function that accepcts an element as the first argument will
     * be triggered everytime when SpatialNavigator tries to traverse every
     * single candidate. You can ignore arbitrary elements by returning "false"
     * in this function.
     * @type {Function}
     * @default null
     * @memberof SpatialNavigator.prototype
     */
    navigableFilter: null,

    /**
     * Rect represents position and dimension of a 2D object.
     * @typedef {Object} Rect
     * @property {Integer} left     Left position
     * @property {Integer} top      Top position
     * @property {Integer} right    Right position
     * @property {Integer} bottom   Bottom position
     * @property {Integer} width    Width dimension
     * @property {Integer} height   Height dimension
     * @property {Rect}    [center] Center position
     * @property {Integer} [x]      same as left
     * @property {Integer} [y]      same as top
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    /**
     * Get {@link Rect} of a {@link SpatialNavigatorElement}.
     *
     * @param {SpatialNavigatorElement} elem
     *
     * @return {Rect} dimension of elem.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    _getRect: function snGetRect(elem) {
      var rect = null;

      if (!this._isNavigable(elem)) {
        return null;
      }

      if (elem.getBoundingClientRect) {
        var cr = elem.getBoundingClientRect();
        rect = {
          left: cr.left,
          top: cr.top,
          width: cr.width,
          height: cr.height
        };
      } else if (elem.left !== undefined) {
        rect = {
          left: parseInt(elem.left || 0, 10),
          top: parseInt(elem.top || 0, 10),
          width: parseInt(elem.width || 0, 10),
          height: parseInt(elem.height || 0, 10)
        };
      } else {
        return null;
      }

      rect.element = elem;
      rect.right = rect.left + rect.width;
      rect.bottom = rect.top + rect.height;
      rect.center = {
        x: rect.left + Math.floor(rect.width / 2),
        y: rect.top + Math.floor(rect.height / 2)
      };
      rect.center.left = rect.center.right = rect.center.x;
      rect.center.top = rect.center.bottom = rect.center.y;

      return rect;
    },

    /**
     * Get all {@link Rect} objects from the collection.
     *
     * @param {SpatialNavigatorElement} [excludedElem]
     *        You can pass excludedElem here to ignore it from calculating.
     *        (most likely, the currently focused element is passed).
     *
     * @return {Array.<Rect>} {@link Rect} objects of all traversable elements.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    _getAllRects: function snGetAllRects(excludedElem) {
      var rects = [];

      this._collection.forEach(function(elem) {
        if (!excludedElem || excludedElem !== elem) {
          var rect = this._getRect(elem);
          if (rect) {
            rects.push(rect);
          }
        }
      }, this);

      return rects;
    },

    /**
     * Check whether a {@link SpatialNavigatorElement} is navigable.
     *
     * @param {SpatialNavigatorElement} elem
     *
     * @return {Boolean} true if it's navigable.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    _isNavigable: function snIsNavigable(elem) {
      if (this.ignoreHiddenElement && elem instanceof HTMLElement) {
        var computedStyle = window.getComputedStyle(elem);
        if ((elem.offsetWidth <= 0 && elem.offsetHeight <= 0) ||
            computedStyle.getPropertyValue('visibility') == 'hidden' ||
            computedStyle.getPropertyValue('display') == 'none' ||
            elem.hasAttribute('aria-hidden')) {
          return false;
        }
      }
      if (this.navigableFilter && !this.navigableFilter(elem)) {
        return false;
      }
      return true;
    },

    /**
     * Given a set of {@link Rect} array, divide them into 9 groups with
     * respect to the position of targetRect. Rects centered inside targetRect
     * are grouped as 4th group; straight left as 3rd group; straight right as
     * 5th group; ..... and so on. See below for the corresponding group number:
     *
     * <pre>
     *  |---+---+---|
     *  | 0 | 1 | 2 |
     *  |---+---+---|
     *  | 3 | 4 | 5 |
     *  |---+---+---|
     *  | 6 | 7 | 8 |
     *  |---+---+---|
     * </pre>
     *
     * @param {Array.<Rect>} rects
     *        {@link RectS} to be divided.
     * @param {Rect} targetRect
     *         Reference position for groups.
     *
     * @return {Array.Array.<SpatialNavigatorElement>}
     *         A 9-elements array of array, where rects are categorized into
     *         these 9 arrays by their group number.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     *
     */
    _partition: function snDemarcate(rects, targetRect) {
      var groups = [[], [], [], [], [], [], [], [], []];

      var threshold = this.straightOverlapThreshold;
      if (threshold > 1 || threshold < 0) {
        // Fallback to default value
        threshold = 0.5;
      }

      rects.forEach(function(rect) {
        var center = rect.center;
        var x, y, groupId;

        if (center.x < targetRect.left) {
          x = 0;
        } else if (center.x <= targetRect.right) {
          x = 1;
        } else {
          x = 2;
        }

        if (center.y < targetRect.top) {
          y = 0;
        } else if (center.y <= targetRect.bottom) {
          y = 1;
        } else {
          y = 2;
        }

        groupId = y * 3 + x;
        groups[groupId].push(rect);

        // Although a rect is in the oblique directions, we categorize it in
        // the straight area as well if it overlaps the straight directions more
        // than a specified threshold (0.5 by default).
        if ([0, 2, 6, 8].indexOf(groupId) !== -1) {
          if (rect.left <= targetRect.right - targetRect.width * threshold) {
            if (groupId === 2) {
              groups[1].push(rect);
            } else if (groupId === 8) {
              groups[7].push(rect);
            }
          }

          if (rect.right >= targetRect.left + targetRect.width * threshold) {
            if (groupId === 0) {
              groups[1].push(rect);
            } else if (groupId === 6) {
              groups[7].push(rect);
            }
          }

          if (rect.top <= targetRect.bottom - targetRect.height * threshold) {
            if (groupId === 6) {
              groups[3].push(rect);
            } else if (groupId === 8) {
              groups[5].push(rect);
            }
          }

          if (rect.bottom >= targetRect.top + targetRect.height * threshold) {
            if (groupId === 0) {
              groups[3].push(rect);
            } else if (groupId === 2) {
              groups[5].push(rect);
            }
          }
        }
      });

      return groups;
    },

    /**
     * Bind targetRect to a set of distance functions for ranking. These
     * functions work with another {@link Rect} object passed to get a ranking
     * value relative to targetRect.
     *
     * @param {Rect} targetRect
     *
     * @return {Object.<function>}
     *         An object containing a bunch of functions bound with targetRect.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    _getDistanceFunction: function snGetDistanceFunction(targetRect) {
      return {
        /* Plumb Line: a vertical line through the center of the
           targetRect. */
        nearPlumbLineIsBetter: function(rect) {
          var d;
          if (rect.center.x < targetRect.center.x) {
            d = targetRect.center.x - rect.right;
          } else {
            d = rect.left - targetRect.center.x;
          }
          return d < 0 ? 0 : d;
        },

        /* Horizon: a horizontal line through the center of the
           "targetRect". */
        nearHorizonIsBetter: function(rect) {
          var d;
          if (rect.center.y < targetRect.center.y) {
            d = targetRect.center.y - rect.bottom;
          } else {
            d = rect.top - targetRect.center.y;
          }
          return d < 0 ? 0 : d;
        },

        /* Target Left: a coincident line of the left edge of the
           "targetRect". */
        nearTargetLeftIsBetter: function(rect) {
          var d;
          if (rect.center.x < targetRect.center.x) {
            d = targetRect.left - rect.right;
          } else {
            d = rect.left - targetRect.left;
          }
          return d < 0 ? 0 : d;
        },

        /* Target Top: a coincident line of the top edge of the
           "targetRect". */
        nearTargetTopIsBetter: function(rect) {
          var d;
          if (rect.center.y < targetRect.center.y) {
            d = targetRect.top - rect.bottom;
          } else {
            d = rect.top - targetRect.top;
          }
          return d < 0 ? 0 : d;
        },

        /* top, bottom, left, and right: Just ranking by absolute coordinate
           without respect to targetRect. Usually they are used as fallback
           rules when ranks above are draw. */
        topIsBetter: function(rect) {
          return rect.top;
        },
        bottomIsBetter: function(rect) {
          return -1 * rect.bottom;
        },
        leftIsBetter: function(rect) {
          return rect.left;
        },
        rightIsBetter: function(rect) {
          return -1 * rect.right;
        }
      };
    },

    /**
     * PrioritySet contains a set of elements with distance functions that
     * should be used to rank them (obtained from {@link
     * SpatialNavigator#_getDistanceFunction}).
     *
     * @typedef PrioritySet
     * @property {Array.<Rects>} group
     *           {@link Rects} of elements that need to be prioritized.
     * @property {Array.<function>} distance
     *           Distance functions. Primary ranking rule should be put in index
     *           0; secondary in index 1 (fallback rule when primary rule draws
     *           ); and so on.
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    /**
     * Pick a {@link Rect} with highest priority.
     *
     * @param {Array.<PrioritySet>} priorities
     *        An array of {@link PrioritySet} that need to be prioritized. The
     *        set with lowest index containing non-empty {PrioritySet.group}
     *        would be prioritized.
     * @param {SpatialNavigatorElement} target
     *        The origin of coordinates for traversal.
     * @param {String} direction
     *        It should be "left", "right", "up" or "down".
     *
     * @return {Rect} the {@link Rect} of highest priority.
     *
     * @access private
     * @memberof SpatialNavigator.prototype
     */
    _prioritize: function snPrioritize(priorities, target, direction) {
      var destPriority = priorities.find(function(p) {
        return !!p.group.length;
      });

      if (!destPriority) {
        return null;
      }

      if (this.rememberSource &&
          this._previous &&
          target == this._previous.destination &&
          direction == this._previous.reverse) {

        var source = this._previous.source;
        var found = destPriority.group.find(function(dest) {
          return dest.element == source;
        });
        if (found) {
          return found;
        }
      }

      destPriority.group.sort(function(a, b) {
        return destPriority.distance.reduce(function(answer, distance) {
          return answer || (distance(a) - distance(b));
        }, 0);
      });

      return destPriority.group[0];
    },

    /**
     * Replace the set of traversable elements.
     *
     * @param  {Array.<SpatialNavigatorElement>} [collection=[]]
               elements to be replaced. The array is deep-copied and never
               be changed directly by SpatialNavigator.
     *
     * @fires SpatialNavigator#unfocus
     * @memberof SpatialNavigator.prototype
     */
    setCollection: function snSetCollection(collection) {
      this.unfocus();
      this._collection = [];
      if (collection) {
        this.multiAdd(collection);
      }
    },

    /**
     * Add an element to traversable set.
     *
     * @param  {SpatialNavigatorElement} elem
     * @return {Boolean} true if succeed.
     *
     * @memberof SpatialNavigator.prototype
     */
    add: function snAdd(elem) {
      var index = this._collection.indexOf(elem);
      if (index >= 0) {
        return false;
      }
      this._collection.push(elem);
      return true;
    },

    /**
     * Add a bunch of elements to traversable set.
     *
     * @param  {Array.<SpatialNavigatorElement>} elements
     * @return {Boolean} true if all elements are added successfully.
     *
     * @memberof SpatialNavigator.prototype
     */
    multiAdd: function snMultiAdd(elements) {
      return Array.from(elements).every(this.add, this);
    },

    /**
     * Remove an element from traversable set.
     *
     * @param {SpatialNavigatorElement} elem
     * @return {Boolean} true if succeed. false if elem does not exist.
     *
     * @fires SpatialNavigator#unfocus
     * @memberof SpatialNavigator.prototype
     */
    remove: function snRemove(elem) {
      var index = this._collection.indexOf(elem);
      if (index < 0) {
        return false;
      }

      if (this._focus === elem) {
        this.unfocus();
      }

      this._collection.splice(index, 1);
      return true;
    },

    /**
     * Remove a bunch of elements to traversable set.
     *
     * @param  {Array.<SpatialNavigatorElement>} elements
     * @return {Boolean} true if all elements are removed successfully.
     *
     * @memberof SpatialNavigator.prototype
     */
    multiRemove: function snMultiRemove(elements) {
      return Array.from(elements).every(this.remove, this);
    },

    /**
     * Move focus to an existing element.
     *
     * @param  {SpatialNavigatorElement} [elem]
     *         when omitted, it focuses the last focused element or the first
     *         navigable element if no previously-focused element is found.
     *
     * @return {Boolean} true if succeed. false if element doesn't exist.
     *
     * @fires SpatialNavigator#focus
     * @fires SpatialNavigator#unfocus
     * @memberof SpatialNavigator.prototype
     */
    focus: function snFocus(elem) {
      if (!elem && this._focus && this._isNavigable(this._focus)) {
        elem = this._focus;
      }

      if (this.focusSilently(elem)) {
        this.fire('focus', this._focus);
        return true;
      } else {
        return false;
      }
    },

    /**
     * Move focus to an existing element but without firing any events. Can be
     * used on initializing.
     *
     * @param  {SpatialNavigatorElement} [elem]
     *         when omitted, it focuses the first navigable element.
     *
     * @return {Boolean} true if succeed. false if element doesn't exist.
     *
     * @memberof SpatialNavigator.prototype
     */
    focusSilently: function snFocusSliently(elem) {
      if (!this._collection) {
        return false;
      }

      if (!elem) {
        var navigableElems = this._collection.filter(this._isNavigable, this);
        if (!navigableElems.length) {
          return false;
        }
        elem = navigableElems[0];
      } else if (this._collection.indexOf(elem) < 0 ||
                 !this._isNavigable(elem)) {
        return false;
      }

      this.unfocus();
      this._focus = elem;
      return true;
    },

    /**
     * Remove focus if any.
     *
     * It will trigger "unfocus" event.
     *
     * @return {Boolean} succeed or not.
     *
     * @fires SpatialNavigator#unfocus
     * @memberof SpatialNavigator.prototype
     */
    unfocus: function snUnfocus() {
      if (this._focus) {
        var elem = this._focus;
        this._focus = null;
        this.fire('unfocus', elem);
      }
      return true;
    },

    /**
     * Get the currently focused element.
     *
     * @return {SpatialNavigatorElement} or null if nothing focused.
     *
     * @memberof SpatialNavigator.prototype
     */
    getFocusedElement: function snGetFocusedElement() {
      return this._focus;
    },

    /**
     * Given a direction, find the element nearest to the focus element in that
     * direction. This is equivalent to {@link SpatialNavigator#navigate} with
     * focused element passed as target.
     *
     * @param {String} direction
     *        It should be "left", "right", "up" or "down".
     *
     * @return {Boolean} true if succeed, false if nothing can be focused.
     *
     * @memberof SpatialNavigator.prototype
     */
    move: function snMove(direction) {
      var reverse = {
          'left': 'right',
          'up': 'down',
          'right': 'left',
          'down': 'up'
      };

      if (!this._focus) {
        this._previous = null;
        this.focus();
      } else {
        var elem = this.navigate(this._focus, direction);
        if (!elem) {
          return false;
        }
        if (this.rememberSource) {
          this._previous = {
            source: this._focus,
            destination: elem,
            reverse: reverse[direction.toLowerCase()]
          };
        }
        this.unfocus();
        this.focus(elem);
      }
      return true;
    },

    /**
     * Given a direction, find an element nearest to the target element in that
     * direction.
     *
     * @param {SpatialNavigatorElement} target
     *        The origin of coordinates for traversal.
     * @param {String} direction
     *        It should be "left", "right", "up" or "down".
     *
     * @return {SpatialNavigatorElement}
     *         The destination of the element which has the highest priority.
     *
     * @memberof SpatialNavigator.prototype
     */
    navigate: function snNavigate(target, direction) {
      if (!target || !direction || !this._collection) {
        return null;
      }

      direction = direction.toLowerCase();

      var rects = this._getAllRects(target);
      var targetRect = this._getRect(target);
      if (!targetRect || !rects.length) {
        return null;
      }

      /* Get distance functions for ranking priorities relative to targetRect */
      var distanceFunction = this._getDistanceFunction(targetRect);

      /* Candidate {@link Rect}s are divided into nine regions based on its
         position with respect to targetRect. */
      var groups = this._partition(rects, targetRect);

      /* {@link Rect}s in group 4 overlaps with targetRect. We distribute them
         further into 9 regions based on its position with respect to the
         center point of targetRect. */
      var internalGroups = this._partition(groups[4], targetRect.center);

      /* priorities: This big array carrys candidate elements with related
       * distance functions by appropriate priority we want. Depenging on the
       * direction, 3 kinds of elements are added separately in the following
       * order:
       *
       *   - 1st: candidates centered inside targetRect (group 4)
       *          (so we pick up corresponding internalGroups).
       *   - 2nd: in groups of straight direction (group 1, 3, 5, 7).
       *   - 3rd: in groups of oblique direction (group 0, 2, 6, 8).
       *
       * For each kind of element above, ranking is performed by the following
       * rules (distance functions) in order:
       *
       *   - 1st: distance between candidate and target.
       *   - 2nd: absolute coordinate of candidates.
       *   - 3rd: distance of left or top coordinate between candidate and
       *          target (for oblique direction only)
       *
       * The switch...case block below is just to construct this array.
       * We just pick the required order into array here, then call
       * {SpatialNavigator#_prioritize} to do the trick.
       */
      var priorities;

      switch (direction) {
        case 'left':
          priorities = [
            {
              group: internalGroups[0].concat(internalGroups[3])
                                       .concat(internalGroups[6]),
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.topIsBetter
              ]
            },
            {
              group: groups[3],
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.topIsBetter
              ]
            },
            {
              group: groups[0].concat(groups[6]),
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.rightIsBetter,
                distanceFunction.nearTargetTopIsBetter
              ]
            }
          ];
          break;
        case 'right':
          priorities = [
            {
              group: internalGroups[2].concat(internalGroups[5])
                                       .concat(internalGroups[8]),
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.topIsBetter
              ]
            },
            {
              group: groups[5],
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.topIsBetter
              ]
            },
            {
              group: groups[2].concat(groups[8]),
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.leftIsBetter,
                distanceFunction.nearTargetTopIsBetter
              ]
            }
          ];
          break;
        case 'up':
          priorities = [
            {
              group: internalGroups[0].concat(internalGroups[1])
                                       .concat(internalGroups[2]),
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.leftIsBetter
              ]
            },
            {
              group: groups[1],
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.leftIsBetter
              ]
            },
            {
              group: groups[0].concat(groups[2]),
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.bottomIsBetter,
                distanceFunction.nearTargetLeftIsBetter
              ]
            }
          ];
          break;
        case 'down':
          priorities = [
            {
              group: internalGroups[6].concat(internalGroups[7])
                                       .concat(internalGroups[8]),
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.leftIsBetter
              ]
            },
            {
              group: groups[7],
              distance: [
                distanceFunction.nearHorizonIsBetter,
                distanceFunction.leftIsBetter
              ]
            },
            {
              group: groups[6].concat(groups[8]),
              distance: [
                distanceFunction.nearPlumbLineIsBetter,
                distanceFunction.topIsBetter,
                distanceFunction.nearTargetLeftIsBetter
              ]
            }
          ];
          break;
        default:
          return null;
      }

      if (this.straightOnly) {
        // Ignore candidates in oblique direction.
        priorities.pop();
      }

      var dest = this._prioritize(priorities, target, direction);
      if (!dest) {
        return null;
      }

      return dest.element;
    }
  });

  exports.SpatialNavigator = SpatialNavigator;
})(window);

/* global KeyEvent, evt */
(function(exports) {
  'use strict';
  // KeyNavigationAdapter files event with '-keyup' as postfix. All behaviors
  // which no need to have multple events while holding the key should use
  // keyup.
  // If we choose to listen to mozbrowser key events, before- and after- prefix
  // will be attached on filed events.
  function KeyNavigationAdapter() {
  }

  KeyNavigationAdapter.prototype = evt({
    KEY_EVENTS: Object.freeze([
      'keydown',
      'keyup'
    ]),

    MOZ_BROWSER_KEY_EVENTS: [
      'mozbrowserbeforekeydown',
      'mozbrowserbeforekeyup',
      'mozbrowserafterkeydown',
      'mozbrowserafterkeyup'
    ],

    init: function kna_init(targetElement, options) {
      this._targetElement = targetElement || window;
      options = options || {};

      // Pick required event listeners and add them
      this._evtNames = [].concat(this.KEY_EVENTS);
      if (options.useMozBrowserKeyEvents) {
        this._evtNames = this._evtNames.concat(this.MOZ_BROWSER_KEY_EVENTS);
      }
      // this._evtNames.forEach(
      //                 name => this._targetElement.addEventListener(name, this));

    },
    uninit: function kna_uninit() {
      // this._evtNames.foreach(
      //              name => this._targetElement.removeEventListener(name, this));
    },

    handleEvent: function kna_handleEvent(evt) {
      if(this._evtNames.indexOf(evt.type) !== -1) {
        this.handleKeyEvent(this.convertKeyToString(evt.keyCode), evt.type);
      }
    },

    handleKeyEvent: function kna_handleKeyEvent(key, eventType) {
      // XXX : It's better to use KeyEvent.Key and use "ArrowUp", "ArrowDown",
      // "ArrowLeft", "ArrowRight" for switching after Gecko synced with W3C
      // KeyboardEvent.Key standard. Here we still use KeyCode and customized
      // string of "up", "down", "left", "right" for the moment.
      var evtPostfix = 'keyup' === eventType ? '-keyup' : '';

      var prefixMatch = /mozbrowser(before|after)/.exec(eventType);
      var evtPrefix = prefixMatch ? prefixMatch[1] + '-' : '';

      switch (key) {
        case 'up':
        case 'down':
        case 'left':
        case 'right':
          this.fire(evtPrefix + 'move' + evtPostfix, key);
          break;
        case 'enter':
          this.fire(evtPrefix + 'enter' + evtPostfix);
          break;
        case 'esc':
          this.fire(evtPrefix + 'esc' + evtPostfix);
          break;
      }
    },

    convertKeyToString: function kna_convertKeyToString(keyCode) {
      switch (keyCode) {
        case KeyEvent.DOM_VK_UP:
          return 'up';
        case KeyEvent.DOM_VK_RIGHT:
          return 'right';
        case KeyEvent.DOM_VK_DOWN:
          return 'down';
        case KeyEvent.DOM_VK_LEFT:
          return 'left';
        case KeyEvent.DOM_VK_RETURN:
          return 'enter';
        case KeyEvent.DOM_VK_ESCAPE:
          return 'esc';
        case KeyEvent.DOM_VK_BACK_SPACE:
          return 'esc';
        default:// we don't consume other keys.
          return null;
      }
    }
  });
  exports.KeyNavigationAdapter = KeyNavigationAdapter;

}(window));

'use strict';
/* global evt */

(function(exports) {
  /**
   * This class monitors incoming messages from [IAC](http://mzl.la/1TKR6zw) and
   * fires event corresponding with incoming messages. ConnectionManager fires
   * only `unpin` event for now.
   *
   * @class  ConnectionManager
   * @fires ConnectionManager#unpin
   */
  var ConnectionManager = function() {};

  ConnectionManager.prototype = evt({
    _channels: undefined,

    init: function cm_init(channels) {
      var that = this;
      this._channels = channels;
      this._channels.forEach(function(channel) {
        window.addEventListener(channel, that);
      });
    },

    uninit: function cm_uninit() {
      var that = this;
      this._channels.forEach(function(channel) {
        window.removeEventListener(channel, that);
      });
    },

    // all messages should contain `type` and `data`, like this:
    // {
    //   type: 'unpin',
    //   data: {
    //     name: 'Music',
    //     manifestURL: 'app://music.gaiamobile.org/manifest.webapp',
    //     launchURL: 'app://music.gaiamobile.org/'
    //   }
    // }
    handleEvent: function cm_handleEvent(evt) {
      var message = evt.detail;
      if (message && message.type) {
        /**
         * @event ConnectionManager#unpin
         * @type {Object}
         * @property {String} name - name of unpinned app
         * @property {String} manifestURL - manifestURL of unpinned app
         * @property {String} launchURL - launchURL of unpinned app
         */
        this.fire(message.type, message.data);
      }
    }
  });

  exports.ConnectionManager = ConnectionManager;
}(window));
