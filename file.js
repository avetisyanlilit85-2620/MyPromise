class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;

      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback());
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;

      this.state = "rejected";
      this.reason = reason;

      this.onRejectedCallbacks.forEach((callback) => callback());
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function"
        ? onFulfilled
        : (value) => value;

    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = () => {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === "fulfilled") {
        setTimeout(handleFulfilled, 0);
      } else if (this.state === "rejected") {
        setTimeout(handleRejected, 0);
      } else {
        this.onFulfilledCallbacks.push(() =>
          setTimeout(handleFulfilled, 0)
        );

        this.onRejectedCallbacks.push(() =>
          setTimeout(handleRejected, 0)
        );
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}