const express = require("express");
const appService = require("./appService");

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get("/check-db-connection", async (req, res) => {
  const isConnect = await appService.testOracleConnection();
  if (isConnect) {
    res.send("connected");
  } else {
    res.send("unable to connect");
  }
});

/*router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});*/

router.get("/posts", async (req, res) => {
  const posts = await appService.getPosts();
  res.json({
    success: true,
    posts,
  });
});

router.post("/posts/:postId/likes", async (req, res) => {
  const result = await appService.likePost(Number.parseInt(req.params.postId));
  res.json({
    success: result,
  });
});

router.get("/posts/:postId/comments", async (req, res) => {
  const result = await appService.getComments(Number.parseInt(req.params.postId));
  res.json({
    success: result,
  });
});

router.post("/posts/:postId/:commentId/likes", async (req, res) => {
  const result = await appService.likeComment(Number.parseInt(req.params.postId), Number.parseInt(req.params.commentId));
  res.json({
    success: result,
  });
});

router.post("/login/verify/", (req, res) => {
    username = req.body.username;
    password = req.body.password;

    // ORACLE PASSWORD-CHECKING LOGIC TO GO HERE

    // TEMPORARY CODE TO TEST SUCCESS AND FAILURE CASES:
    let status = false;
    if (password === "12345") {
        status = true;
    }
    // END TEMPORARY CODE

    res.json({ 
       success: status
    });
  });

module.exports = router;

