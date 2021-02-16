const Emitter = require('events');
{% if media %}
const {parseUri} = require('drachtio-srf');
{% else %}
const {parseUri, SipError} = require('drachtio-srf');
{% endif %}
class CallSession extends Emitter {
  constructor(req, res) {
    super();
    this.req = req;
    this.res = res;
    this.srf = req.srf;
    this.logger = req.locals.logger;
{% if media %}
    this.ms = this.srf.locals.ms;
{% endif %}
  }

  async connect() {
    const uri = parseUri(this.req.uri);
    this.logger.info({uri}, 'inbound call accepted for routing');

{% if media %}
    try {
      const {endpoint, dialog} = await this.ms.connectCaller(this.req, this.res);
      this.ep = endpoint;
      this.uas = dialog;

      this.uas.on('destroy', () => {
        this.logger.info('call ended');
        this.ep.destroy();
      });
    } catch (err) {
      this.logger.info({err}, 'Error connecting to freeswitch');
    }
{% else %}
    try {
      const {uas, uac} = await this.srf.createB2BUA(this.req, this.res, 'sip:172.32.0.60');
      this.logger.info('call connected successfully');
      [uas, uac].forEach((dlg) => dlg.on('destroy', () => {
        this.logger.info('call ended'); 
        dlg.other.destroy();
      }));
    } catch (err) {
      if (err instanceof SipError) {
        if (487 === err.status) this.logger.info('caller hungup');
        else this.logger.info(`call failed with status ${err.status}`);
      }
      else this.logger.info({err}, 'Error connecting call');
    }
{% endif %}
  }
}

module.exports = CallSession;
