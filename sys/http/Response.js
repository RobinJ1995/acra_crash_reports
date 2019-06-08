module.exports = class Response {
	ok(data, message) {
		return this.respond(200, data, message);
	}

	created(data, message) {
		return this.respond(201, data, message);
	}
	
	noData(data, message) {
		return this.respond(204, data, message);
	}
	
	badRequest(data, message) {
		return this.respond(400, data, message);
	}
	
	unauthorized(data, message) {
		return this.respond(401, data, message);
	}
	
	forbidden(data, message) {
		return this.respond(403, data, message);
	}
	
	notFound(data, message) {
		return this.respond(404, data, message);
	}
	
	conflict(data, message) {
		return this.respond(409, data, message);
	}
	
	error(data, message) {
		var statusCode = (data ? data.status : void 0) || 500; // data.status or 500 //
		var dataAppend = void 0;
		if (data instanceof Error) {
			dataAppend = {
				type: data.constructor.name
			};
			
			if (data.data)
				dataAppend = Object.assign(dataAppend, data.data);
			
			if (data.stack)
				dataAppend.stack_trace = data.stack.split('\n');
		}
		
		return this.respond(statusCode, data, message, dataAppend, 'error');
	}
	
	notImplemented(data, message) {
		return this.respond(501, data, message);
	}
	
	respond(statusCode, data, message, dataAppend, messageField) {
		/*
		* HTTP response with given status code. Status messages are automatically handled by Express.
		* If the message got passed along into the data parameter instead of the message parameter, this will
		* automatically be corrected and wrapped into an object for the convenience of the developers.
		*/
		
		messageField = messageField || 'message';
		
		if (data === void 0) {
			data = {};
		}
		else if ((typeof data == 'string' || data instanceof String || data instanceof Error) && message === void 0) {
			/*
       * In case you're wondering why I use two different ways to check if it's a string...
       *
       * [robin@pingwing ~]$ node
       * > var x = new String ('NOOT NOOT');
       * undefined
       * > var y = 'NOOT NOOT';
       * undefined
       * > typeof x
       * 'object'
       * > typeof y
       * 'string'
       * > x instanceof String
       * true
       * > y instanceof String
       * false
       */
			
			message = data;
			data = (process.env.DEBUG && data instanceof Error ? {stackTrace: data.stack.split('\n')} : {});
		}
		
		if (message !== void 0)
			data[messageField] = String(message);
		
		if (dataAppend !== void 0) {
			for (var key in dataAppend)
				data[key] = dataAppend[key];
		}
		
		if (this.responseFormat == 'html')
			return this.status(statusCode).render('status/' + statusCode, data);
		
		return setTimeout(() => this.status(statusCode).json(data), 100 + Math.random() * 800); // Beetje delay door network traffic emuleren //
	}
	
	cache(seconds) {
		const ms = seconds * 1000;

		this.setHeader('Cache-Control', `public, max-age=${ms}`);
		this.setHeader('Expires', new Date(Date.now() + ms).toUTCString());

		return this;
	}
};