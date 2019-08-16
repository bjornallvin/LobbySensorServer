const express = require("express");
const router = express.Router();
const common = require("./common");

router.route("/").get(common.indexPage);
router.route("/video").get(common.videoPage);

module.exports = router;
