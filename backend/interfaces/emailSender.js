class IEmailSender {
    constructor() {
        if(this.constructor == IEmailSender) {
            throw new Error("IEmailSender is an interface. must be implemented.");
        }
    }

    sendEmail(from, to, subject, body) {
        throw new Error("sendEmail() is not implemented");
    }
}

module.exports = { IEmailSender };