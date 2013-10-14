var createError = require('errno').create
	, BjorlingLevelStorageError = createError('BjorlingLevelStorageError')

module.exports = {
	BjorlingLevelStorageError: BjorlingLevelStorageError
, InitializationError: createError('InitializationError', BjorlingLevelStorageError)
, ProjectionInitializationError: createError('ProjectionInitializationError', BjorlingLevelStorageError)
}