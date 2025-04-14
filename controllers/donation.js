const db = require("../models");

const details = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Page Not Found." });
    }

    const donationDetails = await db.Donation.findById(id);

    if (!donationDetails) {
      return res.status(404).json({ message: "Page Not Found." });
    }

    console.log("Thanks for payment!!");
    res.status(200).json(donationDetails);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      message: "Something went wrong while getting donation details.",
    });
  }
};

module.exports = {
  details,
};
