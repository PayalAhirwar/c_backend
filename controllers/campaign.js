const db = require("../models");

// Mask middle part of each transaction ID with 'X'
function hideTransactionID(donors) {
  donors.forEach(donor => {
    const original = donor.transactionID;
    let masked = '';
    for (let i = 0; i < original.length; i++) {
      masked += (i > 3 && i < original.length - 3) ? 'X' : original[i];
    }
    donor.transactionID = masked;
  });
}

// Show a single campaign by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Page Not Found." });
    }

    const showCampaign = await db.Campaign.findById(id);

    if (!showCampaign) {
      return res.status(404).json({ message: "Page Not Found" });
    }

    hideTransactionID(showCampaign.donors);
    res.status(200).json(showCampaign);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Something went wrong while getting the campaign" });
  }
};

// Show all campaigns sorted by start date (latest first)
const showAll = async (req, res) => {
  try {
    const allCampaign = await db.Campaign.find({}).sort({ start: -1 });

    allCampaign.forEach(campaign => {
      hideTransactionID(campaign.donors);
    });

    res.status(200).json(allCampaign);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ message: "Error fetching campaigns" });
  }
};

module.exports = {
  show,
  showAll,
};
