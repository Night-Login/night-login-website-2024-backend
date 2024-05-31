const midtransClient = require("midtrans-client");

/*
TODO: FIXING ENV NOT WORKING
*/
exports.midtransCoreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: "",
  clientKey: "",
});