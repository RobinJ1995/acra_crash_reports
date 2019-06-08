var config = {
	local: {
		port: 3000,
		db: {
			host: 'localhost',
			port: 27017,
			name: 'acra_crash_reports',
			username: 'acra_crash_reports',
			password: 'acra_crash_reports'
		},
		jwt: {
			login: {
				secret: 'dev',
				options: {
					expiresIn: '7d'
				}
			},
			verify: true
		},
		format: 'json',
		credentials: {
			users: {
				'test': 'test'
			}
		}
	},
	production: {}
};

module.exports = (mode) => {
	return config[mode || process.argv[2] || 'local'] || config.local;
};
