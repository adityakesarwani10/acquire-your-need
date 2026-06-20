class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.message = message
        this.errors = errors
        this.data = null
        this.success = false
        this.statusCode = statusCode

        if(stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.stack)
        }
    }
}

export {ApiError}