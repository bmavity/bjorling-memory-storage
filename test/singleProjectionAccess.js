var storage = require('../')
	, eb = require('./eb')

describe('bjorling memory projection storage, when the key is a single value and the get parameter contains a value for the key', function() {
	var originalValue = {
				theKey: '552230234'
			, aVal: 'hiya'
			}
		, retrievedVal

	before(function(done) {
		var projectionStorage

		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
	  	projectionStorage.get({
	  		theKey: '552230234'
	  	, anotherVal: 'part of the event'
	  	}, eb(done, completeGet))
		}

		function performSave(p) {
			projectionStorage = p
			projectionStorage.save(originalValue, eb(done, performGetValue))
		}
		
		var s = storage()
		s('spec 1', 'theKey', eb(done, performSave))
	})

  it('should retrieve the proper state', function() {
  	retrievedVal.should.eql(originalValue)
  })
})

describe('bjorling memory projection storage, when the key is an array and the get parameter contains a value for both elements of the key', function() {
	var originalValue = {
	  		keyPart1: '552230234'
	  	, keyPart2: 'ppuupp'
			, aVal: 'hiya'
			}
		, retrievedVal

	before(function(done) {
		var projectionStorage

		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
	  	projectionStorage.get({
	  		keyPart1: '552230234'
	  	, keyPart2: 'ppuupp'
	  	, anotherVal: 'part of the event'
	  	}, eb(done, completeGet))
		}

		function performSave(p) {
			projectionStorage = p
			projectionStorage.save(originalValue, eb(done, performGetValue))
		}
		
		var s = storage()
		s('spec 1', ['keyPart1', 'keyPart2'], eb(done, performSave))
	})

  it('should retrieve the proper state', function() {
  	retrievedVal.should.eql(originalValue)
  })
})

describe('bjorling memory projection storage, when the key is not found', function() {
	var db
		, originalValue = {
	  		aKey: 'keyval'
			, aVal: 'hiya'
			}
		, retrievedVal

	before(function(done) {
		var projectionStorage

		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
	  	projectionStorage.get({
	  		aKey: 'keyVal2'
	  	, anotherVal: 'part of the event'
	  	}, eb(done, completeGet))
		}

		function performSave(p) {
			projectionStorage = p
			projectionStorage.save(originalValue, eb(done, performGetValue))
		}
		
		var s = storage()
		s('spec 1', 'aKey', eb(done, performSave))
	})

  it('should result in a null value', function() {
  	(retrievedVal === null).should.be.true
  })
})

describe('bjorling memory projection storage, when there is an index and the get parameter does not contain a value for the key, but has a value which matches the index', function() {
	var val1 = {
				theKey: 'key1'
			, anIndex: 'val 1'
			}
		, retrievedVal

	before(function(done) {
		var projectionStorage

		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
			var evt1
	  	projectionStorage.get({
	  	  anotherVal: 'part of the event'
	  	, anIndex: 'val 1'
	  	}, eb(done, completeGet))
		}

		var s = storage()
		s('proj 2', 'theKey', eb(done, function(p) {
			projectionStorage = p
			projectionStorage.addIndex('anIndex', function() {
				projectionStorage.save(val1, eb(done, performGetValue))
			})
		}))
	})

  it('should retrieve the proper state', function() {
  	retrievedVal.should.eql(val1)
  })
})

describe('bjorling memory projection storage, when there are multiple indexes and the get parameter contains a value for both indexes, but not a value for the key', function() {
	var faker = {
				theKey: 'key1'
			, indexPart1: 'billy'
			, indexPart2: 'the punk'
			}
		, real = {
				theKey: 'key2'
			, indexPart1: 'billy'
			, indexPart2: 'the kid'
			}
		, retrievedVal


	before(function(done) {
		var projectionStorage

		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
			var evt1
	  	projectionStorage.get({
	  	  indexPart1: 'billy'
	  	, indexPart2: 'the kid'
	  	}, eb(done, completeGet))
		}

		var s = storage()
		s('proj 2', 'theKey', eb(done, function(p) {
			projectionStorage = p
			projectionStorage.addIndex('indexPart1', function() {
				projectionStorage.addIndex('indexPart2', function() {
					projectionStorage.save(real, eb(done, function() {
						projectionStorage.save(faker, eb(done, performGetValue))
					}))
				})
			})
		}))
	})

  it('should retrieve the proper state', function() {
  	retrievedVal.should.eql(real)
  })
})

describe('bjorling memory projection storage, when an index is an array and the get parameter does not contain a value for the key but contains a value matching an item in the array index', function() {
	var db
		, val1 = {
				theKey: 'key1'
			, aVal: ['val 1', 'val 3']
			}
		, retrievedVal

	before(function(done) {
		var projectionStorage
		
		function completeGet(val) {
			retrievedVal = val
			done()
		}

		function performGetValue() {
			var evt1
	  	projectionStorage.get({
	  	  anotherVal: 'part of the event'
	  	, aVal: 'val 3'
	  	}, eb(done, completeGet))
		}

		var s = storage()
		s('proj 2', 'theKey', eb(done, function(p) {
			projectionStorage = p
			projectionStorage.addIndex('aVal', function() {
				projectionStorage.save(val1, eb(done, performGetValue))
			})
		}))
	})

  it('should retrieve the proper state', function() {
  	retrievedVal.should.eql(val1)
  })
})
