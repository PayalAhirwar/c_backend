const backendURL = " https://f6ff-2409-40e3-20de-4efa-382b-ddac-a311-b187.ngrok-free.app/"
//const backendURL = "http://localhost:4000/";

const express = require("express");
const checksum_lib = require("../paytm/checksum");
const https = require("https");
const qs = require("querystring");
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const config = require("../config");
require("dotenv").config();

const app = express();
const router = express.Router();
const ctrl = require("../controllers");
const { Donation } = require("../models");

router.post("/:id/payment", [parseUrl, parseJson], async (req, res) => {
  try {
    //console.log("Request body:", req.body);

    const donation = new Donation({
      amount: req.body.amount,
      campaign: req.params.id,
    });

    console.log("Donation object:", donation);

    // Save the donation in the database
    await donation.save();

    const paymentDetails = {
      amount: req.body.amount,
    };

    // Check for valid payment details
    if (!paymentDetails.amount) {
      return res.status(400).json({ message: "Please enter a valid amount!" });
    }

    // Prepare parameters for checksum generation
    const params = {
      MID: config.PaytmConfig.mid,
      WEBSITE: config.PaytmConfig.website,
      CHANNEL_ID: "WEB",
      INDUSTRY_TYPE_ID: "Retail",
      ORDER_ID: donation._id.toString(),
      CUST_ID: "CUST_" + donation._id.toString().slice(-6),
      TXN_AMOUNT: paymentDetails.amount.toString(),
      CALLBACK_URL: backendURL + "api/donate/success",
    };

   // console.log("Params for checksum generation:", params);

    // Generate checksum for the payment request
    checksum_lib.genchecksum(params, config.PaytmConfig.key, (err, checksum) => {
      if (err) {
        console.error("Checksum generation failed:", err);
        return res.status(500).json({ message: "Checksum generation failed", error: err });
      }

      // Prepare the form fields for the transaction
      let form_fields = "";
      for (let x in params) {
        form_fields += `<input type='hidden' name='${x}' value='${params[x]}' >`;
      }
      form_fields += `<input type='hidden' name='CHECKSUMHASH' value='${checksum}' >`;

      const txn_url = "https://securegw-stage.paytm.in/theia/processTransaction";

      //console.log("Redirecting to Paytm with form fields:", form_fields);

      // Delay response (to simulate processing time or to wait for user action)
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(`
          <html>
            <head><title>Merchant Checkout Page</title></head>
            <body>
              <center><h1>Please do not refresh this page...</h1></center>
              <form method="post" action="${txn_url}" name="f1">
                ${form_fields}
              </form>
              <script type="text/javascript">document.f1.submit();</script>
            </body>
          </html>
        `);
        res.end(); // Ensure the response is properly ended
      }, 5000); // 5000ms (5 seconds) delay before redirecting to Paytm

    });
  } catch (err) {
    console.error("Error occurred:", err);
    // Return a 500 status with a generic error message
    res.status(500).json({
      message: "Something went wrong while processing the payment. Please try again.",
      error: err.message || err,
    });
  }
});

console.log("just before directing to success root");
router.post("/success", ctrl.payment.success);

module.exports = router;
