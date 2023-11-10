const oracledb = require("oracledb");
const loadEnvFile = require("./utils/envUtil");
const {connectString} = require("oracledb/examples/dbconfig");

const envVariables = loadEnvFile("./.env");

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
  user: envVariables.ORACLE_USER,
  password: envVariables.ORACLE_PASS,
  connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
};

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    return await action(connection);
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
  return await withOracleDB(async (connection) => {
    return true;
  }).catch(() => {
    return false;
  });
}

async function fetchDemotableFromDb() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT * FROM DEMOTABLE");
    return result.rows;
  }).catch(() => {
    return [];
  });
}

async function initiateDemotable() {
  return await withOracleDB(async (connection) => {
    try {
      await connection.execute(`DROP TABLE DEMOTABLE`);
    } catch (err) {
      console.log("Table might not exist, proceeding to create...");
    }

    const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
    return true;
  }).catch(() => {
    return false;
  });
}

async function insertDemotable(id, name) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
      [id, name],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function updateNameDemotable(oldName, newName) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
      [newName, oldName],
      { autoCommit: true }
    );

    return result.rowsAffected && result.rowsAffected > 0;
  }).catch(() => {
    return false;
  });
}

async function countDemotable() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT Count(*) FROM DEMOTABLE");
    return result.rows[0][0];
  }).catch(() => {
    return -1;
  });
}

async function verifyLogin(username, password) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT username FROM AppUser WHERE username = :username AND password = :password`,
      [username, password],
      { autoCommit: true }
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }

    return result.rows;
  }).catch(() => {
    return [];
  });
}

async function signup(username, password, bio, dob, img_url, age) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT * FROM AppUserAge WHERE dob = TO_DATE(:dob, 'YYYY-MM-DD')",
    [dob],
    { autoCommit: true }
    );
    if (result.rows.length === 0) {
      await connection.execute(
        `INSERT INTO AppUserAge VALUES (TO_DATE(:dob, 'YYYY-MM-DD'), :age)`,
        [dob, age],
        { autoCommit: true }
      );
    }

    let result2 = await connection.execute(
      `INSERT INTO AppUser VALUES (:username, :bio, 'deprecated', TO_DATE(:dob, 'YYYY-MM-DD'), :password, utl_raw.cast_to_raw(:image_url))`,
      [username, bio, dob, password, img_url],
      { autoCommit: true }
    );

    if (result2.errorNum) {
      return false;
    }

    return true;
  }).catch(() => {
    return false;
  });
}

async function getPosts() {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsBuffer = [oracledb.BLOB];
    const result = await connection.execute(
      "SELECT p.*, ap.title, p.image_url FROM Post p, ArtPiece ap WHERE p.piece_id = ap.piece_id ORDER BY p.datetime DESC"
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_id: row[7],
      image_url: row[8] ? row[8].toString() : "",
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostLikes(post_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT COUNT(*) FROM LikesPost WHERE post_id = :postId`,
        [post_id]
    );
    return result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function likePost(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
        `INSERT INTO LikesPost
         VALUES (:username, :postId)`,
        [body["username"], body["post_id"]],
        {autoCommit: true}
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function unlikePost(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
        `DELETE
         FROM LikesPost
         WHERE username = :username
           AND post_id = :postId`,
        [body["username"], body["post_id"]],
        {autoCommit: true}
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function isPostLiked(post_id, username) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT * FROM LikesPost WHERE post_id = :postId AND username = :username`,
        [post_id, username]
    );
    return !!result.rows[0] && !!result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function getAppUserData(tag) {
  return await withOracleDB(async (connection) => {

    const appUserResult = await connection.execute(`SELECT bio, pfp_url FROM AppUser WHERE username = :tag`,
    [tag],
    { autoCommit: true });

    return appUserResult;

  }).catch(() => {
    return null;
  });
}

async function getAppUserAge(tag) {
  return await withOracleDB(async (connection) => {

    const appUserAgeResult = await connection.execute(`SELECT age FROM AppUser au, AppUserAge aug WHERE au.username = :tag AND au.dob = aug.dob`,
    [tag],
    { autoCommit: true });
    await new Promise(r => setTimeout(r, 100));

    return appUserAgeResult;

  }).catch(() => {
    return null;
  });
}

async function getfolloweesData(tag) {
  return await withOracleDB(async (connection) => {

    const followeesResult = await connection.execute(`SELECT * FROM Follows WHERE follower = :tag`,
    [tag],
    { autoCommit: true });
    await new Promise(r => setTimeout(r, 100));

    return followeesResult;

  }).catch(() => {
    return null;
  });
}

async function getFollowersData(tag) {
  return await withOracleDB(async (connection) => {

    const followersResult = await connection.execute(`SELECT * FROM Follows WHERE followee = :tag`,
    [tag],
    { autoCommit: true });
    await new Promise(r => setTimeout(r, 100));

    return followersResult;

  }).catch(() => {
    return null;
  });
}

async function getFollowingData(username, tag) {
  return await withOracleDB(async (connection) => {

    const followingResult = await connection.execute(`SELECT * FROM Follows WHERE followee = :tag AND follower = :username`,
    [username, tag],
    { autoCommit: true });
    await new Promise(r => setTimeout(r, 100));

    return followingResult;

  }).catch(() => {
    return null;
  });
}

async function getBadgesData(tag) {
  return await withOracleDB(async (connection) => {

    const badgesResult = await connection.execute(`SELECT name, description, icon_url FROM Badge b, Earns e WHERE e.username = :tag AND e.badge_name = b.name`,
    [tag],
    { autoCommit: true });
    await new Promise(r => setTimeout(r, 100));

    return badgesResult;

  }).catch(() => {
    return null;
  });
}

async function getProfile(username, tag) {
  return await withOracleDB(async (connection) => {

    const appUserResult = await connection.execute(`SELECT bio, utl_raw.cast_to_varchar2(dbms_lob.substr(pfp_blob)) FROM AppUser WHERE username = :tag`,
    [tag],
    { autoCommit: true });

    const appUserAgeResult = await connection.execute(`SELECT age FROM AppUser au, AppUserAge aug WHERE au.username = :tag AND au.dob = aug.dob`,
    [tag],
    { autoCommit: true });

    const followeesResult = await connection.execute(`SELECT * FROM Follows WHERE follower = :tag`,
    [tag],
    { autoCommit: true });

    const followersResult = await connection.execute(`SELECT * FROM Follows WHERE followee = :tag`,
    [tag],
    { autoCommit: true });   

    const followingResult = await connection.execute(`SELECT * FROM Follows WHERE followee = :tag AND follower = :username`,
    [tag, username],
    { autoCommit: true });

    const badgesResult = await connection.execute(`SELECT name, description, icon_url FROM Badge b, Earns e WHERE e.username = :tag AND e.badge_name = b.name`,
    [tag],
    { autoCommit: true });

    const followeesCount = followeesResult.rows.length;
    const followersCount = followersResult.rows.length;
    const followingStatus = followingResult.rows.length > 0;
    const age = appUserAgeResult.rows[0][0];

    const badges = badgesResult.rows.map((row) => ({
      name: row[0],
      description: row[1],
      icon_url: row[2],
    }));

    const result = {
      bio: appUserResult.rows[0][0],
      pfp_url: appUserResult.rows[0][1],
      age: age,
      followeesCount: followeesCount,
      followersCount: followersCount,
      followingStatus: followingStatus,
      badges: badges,
      username: username
    };

    return result;

  }).catch(() => {
    return null;
  });
}

async function createPost(body) {
  if (
    // !("image_url" in body) ||
    !("username" in body) ||
    !("piece_id" in body)
  ) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT max(post_id) FROM Post");
    const id = result.rows[0][0] + 1;
    const insert = await connection.execute(
      `INSERT INTO Post VALUES (:postId, :text, :datetime, :age_restricted, :username, :piece_id, utl_raw.cast_to_raw(:image_url))`,
      {
        postId: id,
        text: body["text"] || null,
        datetime: new Date(),
        age_restricted: body["age_restricted"] || 0,
        username: body["username"],
        piece_id: body["piece_id"],
        image_url: body["image_url"],
      },
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function deletePost(post_id) {
    return await withOracleDB(async (connection) => {
    await connection.execute(
      `DELETE FROM Post WHERE post_id = :postId`,
      [post_id],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function getComments(post_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT * FROM CommentPost WHERE post_id = :postId ORDER BY datetime`,
      [post_id]
    );
    return result.rows.map((row) => ({
      comment_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      post_id: row[5],
    }));
  }).catch(() => {
    return [];
  });
}

async function getCommentLikes(post_id, comment_id) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT COUNT(*) FROM LikesComment WHERE post_id = :postId AND comment_id = :commentId`,
        [post_id, comment_id]
    );
    return result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function likeComment(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `INSERT INTO LikesComment VALUES (:username, :postId, :commentId)`,
      [body["username"], body["post_id"], body["comment_id"]],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function unlikeComment(body) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `DELETE FROM LikesComment WHERE username = :username AND post_id = :postId AND comment_id = :commentId`,
      [body["username"], body["post_id"], body["comment_id"]],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}


async function follow(username, tag) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `INSERT INTO Follows VALUES (:username, :tag)`,
      [username, tag],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function unfollow(username, tag) {
  return await withOracleDB(async (connection) => {
    await connection.execute(
      `DELETE FROM Follows WHERE followee = :tag AND follower = :username`,
      [tag, username],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function isCommentLiked(post_id, comment_id, username) {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `SELECT * FROM LikesComment WHERE post_id = :postId AND comment_id = :commentId AND username = :username`,
        [post_id, comment_id, username]
    );
    return !!result.rows[0] && !!result.rows[0][0];
  }).catch(() => {
    return false;
  });
}

async function createComment(post_id, body) {
  // console.log(body);
  if (
    !("username" in body) ||
    !("post_id" in body) ||
    body["post_id"] !== post_id
  ) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT max(comment_id) FROM CommentPost WHERE post_id = :postId`,
      [post_id]
    );
    const id = result.rows[0][0] + 1;
    // console.log(id);
    const insert = await connection.execute(
      `INSERT INTO CommentPost VALUES (:comment_id, :text, :datetime, :age_restricted, :username, :post_id)`,
      [
        id,
        body["text"] || null,
        new Date(),
        body["age_restricted"] || 0,
        body["username"],
        post_id,
      ],
      { autoCommit: true }
    );
    return true;
  }).catch(() => {
    return false;
  });
}

async function deleteComment(post_id, comment_id) {
    return await withOracleDB(async (connection) => {
    await connection.execute(
      `DELETE FROM CommentPost WHERE post_id = :postId AND comment_id = :commentId`,
      [post_id, comment_id],
      { autoCommit: true }
    );
    // console.log(`comment ${post_id}.${comment_id} deleted!`);
    return true;
  }).catch(() => {
    return false;
  });
}

module.exports = {
  testOracleConnection,
  getPosts,
  getPostLikes,
  likePost,
  unlikePost,
  isPostLiked,
  createPost,
  deletePost,
  getComments,
  getCommentLikes,
  likeComment,
  unlikeComment,
  isCommentLiked,
  createComment,
  deleteComment,
  verifyLogin,
  getProfile,
  follow,
  unfollow,
  signup,
};
