var errors = require('./errors')

function isUndefined(val) {
	return typeof(val) === 'undefined'
}

function BjorlingMemoryStorage() {
	if(!(this instanceof BjorlingMemoryStorage)) {
		return new BjorlingMemoryStorage()
	}
}

function BjorlingMemoryProjectionStorage(projectionName, key) {
	if(!projectionName) {
		throw new errors.ProjectionInitializationError('Bjorling Memory Projection Storage requires a projection name to be initialized.')
	}
	if(!key) {
		throw new errors.ProjectionInitializationError('Bjorling Memory Projection Storage requires a key to be initialized.')
	}

	this._key = key
	this._items = {}
	this._indexes = []
	this._indexMaps = {}
}

BjorlingMemoryProjectionStorage.prototype.addIndex = function(index, cb) {
	this._indexes.push(index)
	this._indexMaps[index] = {}
	setImmediate(function() {
		cb && cb()
	})
}

BjorlingMemoryProjectionStorage.prototype.get = function(queryObj, cb) {
	var keyVal = this.getKeyValue(queryObj)
		, items = this._items
		, item = items[keyVal]
		, indexes = this._indexes
		, maps = this._indexMaps

	function respond(result) {
		setImmediate(function() {
			cb(null, result)
		})
	}

	if(keyVal) {
		return respond(item || null)
	}

	function getIndexVal(index) {
		var val = queryObj[index]
		return {
			name: index
		, val: val
		}
	}

	function hasIndexVal(map) {
		return typeof(map.val) !== 'undefined'
	}

	var indexVals = this._indexes
				.map(getIndexVal)
				.filter(hasIndexVal)

	if(!indexVals.length) {
		return respond(null)
	}

	var matchingMaps = indexVals.map(function(indexVal) {
		var map = maps[indexVal.name]
		if(!map) return []
		return map[indexVal.val] || []
	})
	var mappedKeys = matchingMaps.shift().reduce(function(res, v) {
    if(res.indexOf(v) === -1 && matchingMaps.every(function(a) {
      return a.indexOf(v) !== -1
    })) res.push(v)
    return res
	}, [])

	if(mappedKeys.length === 1) {
		var mappedKey = mappedKeys[0]
		return respond(items[mappedKey])
	}

	respond(null)
}

BjorlingMemoryProjectionStorage.prototype.getKeyValue = function(obj) {
	var key = this._key
		, parts = Array.isArray(key) ? key.map(getVal) : [getVal(key)]

	function getVal(keyPart) {
		return obj[keyPart]
	}

	if(parts.some(isUndefined)) return null

	return parts.join('')
}

BjorlingMemoryProjectionStorage.prototype.save = function(state, cb) {
	var keyVal = this.getKeyValue(state)
	this._items[keyVal] = state

	this._addIndexValues(keyVal, state)

	setImmediate(cb)
}

BjorlingMemoryProjectionStorage.prototype._addIndexValues = function(keyVal, state) {
	var indexes = this._indexes
		, indexMaps = this._indexMaps
	indexes.forEach(function(index) {
		var indexMap = indexMaps[index]
			, indexVal = state[index]

		if(!indexVal) return

		function addValueToMap(val) {
			var map = indexMap[val] = indexMap[val] || []
			if(map.indexOf(keyVal) === -1) {
				map.push(keyVal)
			}
		}

		if(Array.isArray(indexVal)) {
			indexVal.forEach(addValueToMap)
		} else {
			addValueToMap(indexVal)
		}
	})
}

module.exports = function() {
	var s = new BjorlingMemoryStorage()
	function createProjection(projectionName, key, cb) {
		var err = null
			, result
		try {
			result = new BjorlingMemoryProjectionStorage(projectionName, key)
		}
		catch(ex) {
			err = ex
		}

		setImmediate(function() {
			cb && cb(err, result)
		})

		return result
	}
	return createProjection
}
