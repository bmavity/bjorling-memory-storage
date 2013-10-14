
function BjorlingMemoryStorage() {
	if(!(this instanceof BjorlingMemoryStorage)) {
		return new BjorlingMemoryStorage()
	}

}

function isUndefined(val) {
	return typeof(val) === 'undefined'
}

function BjorlingLevelProjectionStorage(db, projectionName, key) {
	this._db = levelQuery(db)
	this._db.query.use(engine())

	this._key = key
	this._projectionName = projectionName

	this._indexes = []
}

BjorlingLevelProjectionStorage.prototype.getKeyValue = function(obj) {
	var key = this._key
		, parts = Array.isArray(key) ? key.map(getVal) : [getVal(key)]

	function getVal(keyPart) {
		return obj[keyPart]
	}

	if(parts.some(isUndefined)) return null

	return parts.join('')
}

BjorlingLevelProjectionStorage.prototype.get = function(queryObj, cb) {
	var db = this._db
		, keyVal = this.getKeyValue(queryObj)

	function respond(err, result) {
		if(err) {
			if(err.notFound) return cb(null, null)
			return cb(err)
		}
		cb(null, result)
	}

	if(keyVal) {
		db.get(keyVal, respond)
		return
	}

	function getIndexVal(index) {
		var val = queryObj[index]
		//BLM: Don't look here
		if(!val && index === 'roundId') {
			val = queryObj['batchId']
		}
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
		return setImmediate(function() {
			cb(null, null)
		})
	}

	var q = {}

	function createQueryObj(map) {
		var qObj = {}
		qObj[map.name] = map.val
		return qObj
	}

	function performQuery() {
		var result = null
			, hasMultiple = false

console.log(q)
		db.query(q)
			.on('data', function(r) {
				hasMultiple = !!result
				result = r
			})
			.on('stats', function(stats) {
				console.log(stats)
			})
			.on('end', function() {
				if(hasMultiple) return cb(new Error('multiple results'))
				cb(null, result)
			})
			.on('error', cb)
	}

	if(indexVals.length === 1) {
		q = createQueryObj(indexVals[0])
	} else {
		q.$and = indexVals.map(createQueryObj)
	}

	return performQuery()
}

BjorlingLevelProjectionStorage.prototype.save = function(val, cb) {
	var keyVal = this.getKeyValue(val)
	//console.log('saving', this._projectionName, this._key, keyVal)
	this._db.put(keyVal, val, cb)
}

BjorlingLevelProjectionStorage.prototype.addIndex = function(index, cb) {
	this._indexes.push(index)
	this._db.ensureIndex(index)
	setImmediate(function() {
		cb && cb()
	})
}


function getArgs(arrayLike) {
	return Array.prototype.slice.call(arrayLike, 0)
}

module.exports = function(location, key) {
	var s = new LevelStorage(location, key)
		, __bjorling = s._db.sublevel('__bjorling')
		, a = function(projectionName, key, cb) {
				if(!projectionName) {
					var err = new errors.ProjectionInitializationError('Bjorling Level Projection Storage requires a projection name to be initialized.')
					if(cb) {
						return cb(err)
					}
					throw err
				}
				if(!key) {
					var err = new errors.ProjectionInitializationError('Bjorling Level Projection Storage requires a key to be initialized.')
					if(cb) {
						return cb(err)
					}
					throw err
				}

				var db = s._db.sublevel(projectionName)
					, p = new BjorlingLevelProjectionStorage(db, projectionName, key)
				__bjorling.put(projectionName, {}, function(err) {
					if(err &&  cb) return cb(err)
					cb && cb(null, p)
				})
				return p
			}
	a._db = s._db
	a._key = s._key
	a._indexes = s._indexes
	a.get = function() {
		return s.get.apply(s, getArgs(arguments))
	}
	a.save = function() {
		return s.save.apply(s, getArgs(arguments))
	}
	a.addIndex = function() {
		return s.addIndex.apply(s, getArgs(arguments))
	}
	return a
}