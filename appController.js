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

router.get("/posts/:postId/like", async (req, res) => {
  const result = await appService.getPostLikes(req.params.postId);
  res.json({
    success: result,
  });
});

router.post("/posts/:postId/like", async (req, res) => {
  const result = await appService.likePost(req.body);
  res.json({
    success: result,
  });
});

router.delete("/posts/:postId/like", async (req, res) => {
  const result = await appService.unlikePost(req.body);
  res.json({
    success: result,
  });
});

router.get("/posts/:postId/like/:username", async (req, res) => {
  const result = await appService.isPostLiked(
    req.params["postId"],
    req.params["username"]
  );
  res.json({
    success: result,
  });
});

router.post("/posts", async (req, res) => {
  const result = await appService.createPost(req.body);
  res.json({
    success: result,
  });
});

router.get("/posts/following/:username", async (req, res) => {
  const posts = await appService.getPostsFollowing(req.params["username"]);
  res.json({
    success: true,
    posts,
  });
});

router.get("/posts/:tag", async (req, res) => {
  const posts = await appService.getPostsUser(req.params["tag"]);
  res.json({
    success: true,
    posts,
  });
});

router.get("/posts/piece/:id", async (req, res) => {
  const posts = await appService.getPostsPiece(req.params["id"]);
  res.json({
    success: true,
    posts,
  });
});

router.get("/posts/artist/:id", async (req, res) => {
  const posts = await appService.getPostsArtist(req.params["id"]);
  res.json({
    success: true,
    posts,
  });
});

router.get("/posts/collection/:title&:curator", async (req, res) => {
  const posts = await appService.getPostsCollection(
    req.params["title"],
    req.params["curator"]
  );
  res.json({
    success: true,
    posts,
  });
});

router.get("/posts/location/:name", async (req, res) => {
  const posts = await appService.getPostsLocation(req.params["name"]);
  res.json({
    success: true,
    posts,
  });
});

router.delete("/posts/:postId", async (req, res) => {
  const result = await appService.deletePost(req.params["postId"]);
  res.json({
    success: result,
  });
});

router.get("/posts/:postId/comments", async (req, res) => {
  const result = await appService.getComments(
    Number.parseInt(req.params.postId)
  );
  res.json({
    success: result,
  });
});

router.get("/posts/:postId/comments/:commentId/like", async (req, res) => {
  const result = await appService.getCommentLikes(
    req.params["postId"],
    req.params["commentId"]
  );
  res.json({
    success: result,
  });
});

router.post("/posts/:postId/comments/:commentId/like", async (req, res) => {
  const result = await appService.likeComment(req.body);
  res.json({
    success: result,
  });
});

router.delete("/posts/:postId/comments/:commentId/like", async (req, res) => {
  const result = await appService.unlikeComment(req.body);
  res.json({
    success: result,
  });
});

router.get(
  "/posts/:postId/comments/:commentId/like/:username",
  async (req, res) => {
    const result = await appService.isCommentLiked(
      req.params["postId"],
      req.params["commentId"],
      req.params["username"]
    );
    res.json({
      success: result,
    });
  }
);

router.post("/posts/:postId/comments", async (req, res) => {
  const result = await appService.createComment(
    Number.parseInt(req.params.postId),
    req.body
  );
  res.json({
    success: result,
  });
});

router.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const result = await appService.deleteComment(
    req.params["postId"],
    req.params["commentId"]
  );
  res.json({
    success: result,
  });
});

router.post("/login/verify/", async (req, res) => {
  username = req.body.username;
  password = req.body.password;

  const result = await appService.verifyLogin(username, password);

  res.json({
    success: result,
  });
});

router.post("/signup", async (req, res) => {
  username = req.body.username;
  password = req.body.password;
  bio = req.body.bio;
  dob = req.body.dob;
  img_url = req.body.img_url;

  let bday = Date.parse(dob);
  let now = new Date();
  let diff = now - bday;
  let age = Math.floor(diff / 31557600000);

  const result = await appService.signup(
    username,
    password,
    bio,
    dob,
    img_url,
    age
  );

  res.json({
    success: result,
  });
});

router.post("/updateProfile", async (req, res) => {
  username = req.body.username;
  password = req.body.password;
  bio = req.body.bio;
  dob = req.body.dob;
  img_url = req.body.img_url;

  let bday = Date.parse(dob);
  let now = new Date();
  let diff = now - bday;
  let age = Math.floor(diff / 31557600000);

  const result = await appService.updateProfile(
    username,
    password,
    bio,
    dob,
    img_url,
    age
  );

  res.json({
    success: result,
  });
});

router.post("/follow/:username/:tag", async (req, res) => {
  const result = await appService.follow(req.params.username, req.params.tag);

  res.json({
    success: result,
  });
});

router.delete("/unfollow/:username/:tag", async (req, res) => {
  const result = await appService.unfollow(req.params.username, req.params.tag);

  res.json({
    success: result,
  });
});

router.get("/profile/:username/:tag", async (req, res) => {
  // username is the currently signed-in user. tag is the profile being viewed
  const result = await appService.getProfile(
    req.params.username,
    req.params.tag
  );

  res.json({
    profile: result,
  });
});

router.get("/search/profiles/:term", async (req, res) => {
  const result = await appService.getProfiles(req.params.term);

  res.json({
    profile: result,
  });
});

router.get("/search/pieces/:term", async (req, res) => {
  const result = await appService.getPieces(req.params.term);

  res.json({
    pieces: result,
  });
});

router.get("/search/artists/:term", async (req, res) => {
  const result = await appService.getArtists(req.params.term);

  res.json({
    artists: result,
  });
});

router.get("/search/locations/:term", async (req, res) => {
  const result = await appService.getLocations(req.params.term);

  res.json({
    locations: result,
  });
});

router.get("/search/collections/:term", async (req, res) => {
  const result = await appService.getCollections(req.params.term);

  res.json({
    collections: result,
  });
});

router.get("/advanced/search/profiles/:term", async (req, res) => {
  const result = await appService.getProfiles(req.params.term);

  res.json({
    profile: result,
  });
});

router.get("/advanced/search/pieces/:title/:artist/:medium/:col/:cur/:loc/:lo/:hi/:desc", async (req, res) => {
  const result = await appService.getPiecesAdvanced(req.params.title, req.params.artist, req.params.medium, req.params.col, req.params.cur, req.params.loc, req.params.lo, req.params.hi, req.params.desc);
  res.json({
    pieces: result,
  });
});

router.get("/advanced/search/artists/:name/:dob/:dod/:desc", async (req, res) => {
  const result = await appService.getArtistsAdvanced(req.params.name, req.params.dob, req.params.dod, req.params.desc);

  res.json({
    artists: result,
  });
});

router.get("/advanced/search/collections/:title/:cur/:theme/:loc/:desc", async (req, res) => {
  const result = await appService.getCollectionsAdvanced(req.params.title, req.params.cur, req.params.theme, req.params.loc, req.params.desc);

  res.json({
    collections: result,
  });
});

router.get("/advanced/search/locations/:name/:earl/:late/:addr/:city/:regn/:ctry/:post", async (req, res) => {
  const result = await appService.getLocationsAdvanced(req.params.name, req.params.earl, req.params.late, req.params.addr, req.params.city, req.params.regn, req.params.ctry, req.params.post);

  res.json({
    locations: result,
  });
});

router.get("/piece/:id", async (req, res) => {
  const result = await appService.getPiece(req.params.id);

  res.json({
    piece: result,
  });
});

router.get("/artist/:id", async (req, res) => {
  const result = await appService.getArtist(req.params.id);

  res.json({
    artist: result,
  });
});

router.get("/location/:name", async (req, res) => {
  const result = await appService.getLocation(req.params.name);
  res.json({
    location: result,
  });
});

router.get("/museum/:name", async (req, res) => {
  const result = await appService.getMuseum(req.params.name);
  res.json({
    museum: result,
  });
});

router.get("/gallery/:name", async (req, res) => {
  const result = await appService.getGallery(req.params.name);
  res.json({
    gallery: result,
  });
});

router.get("/private-collection/:name", async (req, res) => {
  const result = await appService.getPrivateCollection(req.params.name);
  res.json({
    privateCollection: result,
  });
});

router.get("/collection/:title&:curator", async (req, res) => {
  const result = await appService.getCollection(
    req.params.title,
    req.params.curator
  );
  res.json({
    collection: result,
  });
});

router.get("/tables", async (req, res) => {
  const tables = await appService.getTables();

  res.json({
    tables,
  });
});

router.get("/tables/:tableName/columns", async (req, res) => {
  const columns = await appService.getColumns(req.params.tableName);

  res.json({
    columns,
  });
});

router.post("/tables/:tableName/visualize", async (req, res) => {
  const result = await appService.projectColumns(
    req.params.tableName,
    req.body
  );
  res.json(result);
});

router.get("/pieces", async (req, res) => {
  const pieces = await appService.getPieceSummary();
  res.json({
    pieces,
  });
});

router.get("/stats", async (req, res) => {
  res.json({
    postedAboutAll: await appService.postedAboutAll(),
    totalPostsPerAge: await appService.totalPostsPerAge(),
    totalNSFWPostsByActiveUsers: await appService.totalNSFWPostsByActiveUsers(),
    mostExpensiveArtPieces: await appService.mostExpensiveArtPieces(),
  });
});

module.exports = router;
