var storage = require('../')
	, errors = require('../errors')
	, eb = require('./eb')

describe('bjorling memory projection storage, when properly initialized', function() {
	var db
		, projectionStorage = null

	before(function(done) {
		var s = storage(dbPath)
		s('aProjection', 'aKey', eb(done, function(p) {
			projectionStorage = p
			done()
		}))
	})

	it('should create a Projection instance', function() {
		projectionStorage.should.not.be.null
	})
})

describe('bjorling memory projection storage, when initialized without a projection name', function() {
	var thrownError

	before(function(done) {
		s = storage(dbPath)
		s(null, 'key', function(err, p) {
			thrownError = err
			done()
		})
	})

	it('should cause an ProjectionInitializationError', function() {
		thrownError.should.be.instanceOf(errors.ProjectionInitializationError)
	})

	it('should cause an error message indicating the problem', function() {
		thrownError.message.should.include('projection name')
	})
})

describe('bjorling memory projection storage, when initialized without a key', function() {
	var thrownError

	before(function(done) {
		s = storage(dbPath)
		s('projection', null, function(err, p) {
			thrownError = err
			done()
		})
	})

	it('should cause an ProjectionInitializationError', function() {
		thrownError.should.be.instanceOf(errors.ProjectionInitializationError)
	})

	it('should cause an error message indicating the problem', function() {
		thrownError.message.should.include('key')
	})
})
