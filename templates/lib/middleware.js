module.exports = (logger) => {

  /**
   * initialize req.locals and add a pino logger that will kick out
   * the sip call-id as part of every log statement
   */
  const initLocals = (req, res, next) => {
    req.locals = req.locals || {};
    req.locals.logger = logger.child({
      callId: req.get('Call-ID')
    });
    req.once('cancel', () => req.canceled = true);

    next();
  };

  /* add additional middleware functions as needed */

  return {
    initLocals
  };
};
