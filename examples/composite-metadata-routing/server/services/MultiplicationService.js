const {Single} = require('rsocket-flowable');

const statuses = {
  PENDING: "pending",
  CANCELLED: "cancelled"
};

class MultiplicationService {
  multiply(args) {
    console.log(`MultiplicationService.multiply`, args);

    const {lhs, rhs} = args;

    let status = statuses.PENDING;

    return new Single((subscriber) => {

      /**
       * In the event that the client cancels the request before
       * the server can respond, we will change our status to cancelled
       * and avoid calling `onComplete` on the `subscriber` instance in the
       * `setTimeout` callback.
       */
      function handleCancellation() {
        status = statuses.CANCELLED;
      }

      subscriber.onSubscribe(() => handleCancellation());

      /**
       * If the client cancelled the request before we got to this point,
       * we can return early and avoid doing any of the work below.
       */
      if (status === statuses.CANCELLED) {
        return;
      }

      const product = lhs * rhs;

      console.log(`requestResponse response`, product);

      subscriber.onComplete({
        data: Buffer.from(JSON.stringify(product)),
        metadata: null, // or new Buffer(...)
      });
    });
  }
}

module.exports = MultiplicationService;
