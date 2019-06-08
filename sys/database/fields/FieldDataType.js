module.exports = {
	'uuid': {
		name: 'uuid',
		type: 'string',
		solid: true,
		validators: ['string', 'uuid']
	},
	'string': {
		name: 'string',
		type: 'string',
		solid: true,
		validators: ['string']
	},
	'integer': {
		name: 'integer',
		type: 'int',
		solid: true,
		validators: ['integer']
	},
	'number': {
		name: 'number',
		type: 'double',
		solid: true,
		validators: ['number']
	},
	'boolean': {
		name: 'boolean',
		type: 'bool',
		solid: true,
		validators: ['boolean']
	},
	'crypt': {
		name: 'crypt',
		type: 'string',
		solid: true,
		validators: ['string']
	},
	'date': {
		name: 'date',
		type: 'date',
		solid: true,
		validators: ['date']
	},
	'object': {
		name: 'object',
		type: 'object',
		solid: true,
		validators: ['object']
	},
	'array': {
		name: 'array',
		type: 'array',
		solid: true,
		validators: ['array']
	}
};