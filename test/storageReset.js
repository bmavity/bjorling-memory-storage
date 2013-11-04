var storage = require('../')
	, eb = require('./eb')

function count(obj) {
	return Object.keys(obj).length
}

describe('bjorling memory projection storage, when reset', function() {
	var val1 = {
				theKey: 'key1'
			, anIndex: 'val 1'
			}
		, projectionStorage

	before(function(done) {
		function getKeyCount() {
			retrievedCount = Object.keys(projectionStorage._items).length
			done()
		}

		function resetStorage() {
			projectionStorage.reset(getKeyCount)
		}

		var s = storage()
		s('proj 2', 'theKey', eb(done, function(p) {
			projectionStorage = p
			projectionStorage.addIndex('anIndex', function() {
				projectionStorage.save(val1, eb(done, resetStorage))
			})
		}))
	})

  it('should remove all items', function() {
  	count(projectionStorage._items).should.eql(0)
  })

  it('should remove all indexes', function() {
  	count(projectionStorage._indexes).should.eql(0)
  })

  it('should remove all index maps', function() {
  	count(projectionStorage._indexMaps).should.eql(0)
  })
})
