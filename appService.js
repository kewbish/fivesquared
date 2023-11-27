const oracledb = require("oracledb");
const loadEnvFile = require("./utils/envUtil");
const { connectString } = require("oracledb/examples/dbconfig");

const envVariables = loadEnvFile("./.env");

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
  user: envVariables.ORACLE_USER,
  password: envVariables.ORACLE_PASS,
  connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
  poolMax: 1,
};

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
let poolMade = false;
async function withOracleDB(action) {
  let connection;
  try {
    if (!poolMade) {
      await oracledb.createPool(dbConfig);
      poolMade = true;
    }

    connection = await oracledb.getConnection();
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

async function uploadImage(image_contents) {
  const form = new FormData();
  form.append(
    "image",
    image_contents.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")
  );
  const image_req = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: "Client-ID c3fc6d6a9597073" },
    body: form,
  });
  const resp = await image_req.json();
  if (!("data" in resp) || !("link" in resp["data"])) {
    return "";
  }
  return resp["data"]["link"];
}

async function signup(username, password, bio, dob, img_url, age) {
  const link = uploadImage(img_url);
  if (!link) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT * FROM AppUserAge WHERE dob = TO_DATE(:dob, 'YYYY-MM-DD')",
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
      `INSERT INTO AppUser VALUES (:username, :bio, TO_DATE(:dob, 'YYYY-MM-DD'), :password, :image_url)`,
      {
        username,
        bio,
        dob,
        password,
        image_url: { val: link, type: oracledb.CLOB },
      },
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

async function updateProfile(username, password, bio, dob, img_url, age) {
  const link = uploadImage(img_url);
  if (!link) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      "SELECT * FROM AppUserAge WHERE dob = TO_DATE(:dob, 'YYYY-MM-DD')",
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
      `UPDATE AppUser SET bio = :bio, dob = TO_DATE(:dob, 'YYYY-MM-DD'), password = :password, pfp_clob = :image_url WHERE username = :username`,
      {
        username,
        bio,
        dob,
        password,
        image_url: { val: link, type: oracledb.CLOB },
      },
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
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
        `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM Post p,
              ArtPiece ap
         WHERE p.piece_id = ap.piece_id
         ORDER BY p.datetime DESC`
    );

    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostsFollowing(username) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
        `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM Post p,
              ArtPiece ap
         WHERE p.piece_id = ap.piece_id
           AND p.username IN (SELECT followee FROM Follows WHERE follower = :username)
         ORDER BY p.datetime DESC`,
        [username],
        {autoCommit: true}
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostsUser(tag) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
        `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM Post p,
              ArtPiece ap
         WHERE p.piece_id = ap.piece_id
           AND p.username = :tag
         ORDER BY p.datetime DESC`,
        [tag],
        {autoCommit: true}
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostsPiece(id) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM Post p,
              ArtPiece ap
         WHERE p.piece_id = ap.piece_id
           AND p.piece_id = :id
         ORDER BY p.datetime DESC`,
      [id],
      { autoCommit: true }
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}


async function getPostsArtist(id) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM Post p,
              ArtPiece ap,
              Creates cr,
              Artist a
         WHERE cr.artist_id = a.artist_id
           and cr.piece_id = ap.piece_id
           and p.piece_id = ap.piece_id
           and a.artist_id = :id
         ORDER BY p.datetime DESC`,
      [id],
      { autoCommit: true }
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostsLocation(name) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM POST p,
              ARTPIECE ap,
              COLLECTION c
         WHERE p.piece_id = ap.piece_id
           AND ap.collection_curator = c.curator
           AND ap.collection_title = c.title
           AND c.location_name = :name
         ORDER BY p.datetime DESC`,
      [name],
      { autoCommit: true }
    );
    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
    }));
  }).catch(() => {
    return [];
  });
}

async function getPostsCollection(title, curator) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];

    const result = await connection.execute(
      `SELECT p.post_id, p.text, p.datetime, p.age_restricted, p.username, ap.title, p.image_url, ap.piece_id
         FROM POST p,
              ARTPIECE ap
         WHERE p.piece_id = ap.piece_id
           AND ap.collection_title = :title
           AND ap.collection_curator = :curator
         ORDER BY p.datetime DESC`,
      [title, curator],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      post_id: row[0],
      text: row[1],
      datetime: row[2],
      age_restricted: row[3],
      username: row[4],
      piece_title: row[5],
      image_url: row[6] || "",
      piece_id: row[7]
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
      { autoCommit: true }
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
      { autoCommit: true }
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
    oracledb.fetchAsString = [oracledb.CLOB];
    const appUserResult = await connection.execute(
      `SELECT bio, pfp_url FROM AppUser WHERE username = :tag`,
      [tag],
      { autoCommit: true }
    );

    return appUserResult;
  }).catch(() => {
    return null;
  });
}

async function getAppUserAge(tag) {
  return await withOracleDB(async (connection) => {
    const appUserAgeResult = await connection.execute(
      `SELECT age FROM AppUser au, AppUserAge aug WHERE au.username = :tag AND au.dob = aug.dob`,
      [tag],
      { autoCommit: true }
    );
    await new Promise((r) => setTimeout(r, 100));

    return appUserAgeResult;
  }).catch(() => {
    return null;
  });
}

async function getfolloweesData(tag) {
  return await withOracleDB(async (connection) => {
    const followeesResult = await connection.execute(
      `SELECT * FROM Follows WHERE follower = :tag`,
      [tag],
      { autoCommit: true }
    );
    await new Promise((r) => setTimeout(r, 100));

    return followeesResult;
  }).catch(() => {
    return null;
  });
}

async function getFollowersData(tag) {
  return await withOracleDB(async (connection) => {
    const followersResult = await connection.execute(
      `SELECT * FROM Follows WHERE followee = :tag`,
      [tag],
      { autoCommit: true }
    );
    await new Promise((r) => setTimeout(r, 100));

    return followersResult;
  }).catch(() => {
    return null;
  });
}

async function getFollowingData(username, tag) {
  return await withOracleDB(async (connection) => {
    const followingResult = await connection.execute(
      `SELECT * FROM Follows WHERE followee = :tag AND follower = :username`,
      [username, tag],
      { autoCommit: true }
    );
    await new Promise((r) => setTimeout(r, 100));

    return followingResult;
  }).catch(() => {
    return null;
  });
}

async function getBadgesData(tag) {
  return await withOracleDB(async (connection) => {
    const badgesResult = await connection.execute(
      `SELECT name, description, icon_url FROM Badge b, Earns e WHERE e.username = :tag AND e.badge_name = b.name`,
      [tag],
      { autoCommit: true }
    );
    await new Promise((r) => setTimeout(r, 100));

    return badgesResult;
  }).catch(() => {
    return null;
  });
}

async function getProfile(username, tag) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const appUserResult = await connection.execute(
      `SELECT bio, pfp_clob, password FROM AppUser WHERE username = :tag`,
      [tag],
      { autoCommit: true }
    );

    const appUserAgeResult = await connection.execute(
      `SELECT age, aug.dob FROM AppUser au, AppUserAge aug WHERE au.username = :tag AND au.dob = aug.dob`,
      [tag],
      { autoCommit: true }
    );

    const followeesResult = await connection.execute(
      `SELECT bio, pfp_clob, username FROM AppUser WHERE username IN (SELECT followee FROM Follows WHERE follower = :tag)`,
      [tag],
      { autoCommit: true }
    );

    const followersResult = await connection.execute(
      `SELECT bio, pfp_clob, username FROM AppUser WHERE username IN (SELECT follower FROM Follows WHERE followee = :tag)`,
      [tag],
      { autoCommit: true }
    );

    const followingResult = await connection.execute(
      `SELECT * FROM Follows WHERE followee = :tag AND follower = :username`,
      [tag, username],
      { autoCommit: true }
    );

    const badgesResult = await connection.execute(
      `SELECT name, description, icon_url FROM Badge b, Earns e WHERE e.username = :tag AND e.badge_name = b.name`,
      [tag],
      { autoCommit: true }
    );

    const followersData = followersResult.rows.map((row) => ({
      bio: row[0],
      pfp_url: row[1] || "https://placehold.co/400x400/grey/white?text=pfp",
      username: row[2],
    }));
    const followeesData = followeesResult.rows.map((row) => ({
      bio: row[0],
      pfp_url: row[1] || "https://placehold.co/400x400/grey/white?text=pfp",
      username: row[2],
    }));

    const followingStatus = followingResult.rows.length > 0;

    const badges = badgesResult.rows.map((row) => ({
      name: row[0],
      description: row[1],
      icon_url: row[2],
    }));

    const result = {
      bio: appUserResult.rows[0][0],
      pfp_url:
        appUserResult.rows[0][1] ||
        "https://placehold.co/400x400/grey/white?text=pfp",
      password: appUserResult.rows[0][2],
      age: appUserAgeResult.rows[0][0],
      dob: appUserAgeResult.rows[0][1].toISOString().slice(0, 10),
      followees: followeesData,
      followers: followersData,
      followingStatus: followingStatus,
      badges: badges,
      username: username,
    };

    return result;
  }).catch(() => {
    return null;
  });
}

async function getProfiles(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT bio, pfp_clob, username FROM AppUser WHERE UPPER(username) LIKE  :pattern`,
      [pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      bio: row[0],
      pfp_url: row[1] || "https://placehold.co/400x400/grey/white?text=pfp",
      username: row[2],
    }));
  }).catch(() => {
    return null;
  });
}

async function getPieces(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT ap.title, ap.description, a.name, ap.piece_id
         FROM ArtPiece ap,
              Creates cr,
              Artist a
         WHERE cr.artist_id = a.artist_id
           and cr.piece_id = ap.piece_id
           and UPPER(ap.title) LIKE :pattern`,
      [pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      title: row[0],
      description: row[1],
      artist: row[2],
      piece_id: row[3]
    }));
  }).catch(() => {
    return null;
  });
}

async function getPiece(id) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT ap.title, ap.description, a.artist_id, a.name, c.title, c.curator, ap.value, ap.year
         FROM ArtPiece ap,
              Creates cr,
              Artist a,
              Collection c
         WHERE cr.artist_id = a.artist_id
           and ap.collection_title = c.title
           and ap.collection_curator = c.curator
           and cr.piece_id = :id
           and ap.piece_id = :id`,
      { id },
      { autoCommit: true }
    );

    return {
      title: result.rows[0][0],
      description: result.rows[0][1],
      artist_id: result.rows[0][2],
      artist_name: result.rows[0][3],
      collection: result.rows[0][4],
      curator: result.rows[0][5],
      value: result.rows[0][6],
      year: result.rows[0][7]
    };

  }).catch(() => {
    return null;
  });
}

async function getArtists(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT description, name, artist_id
         FROM Artist
         WHERE UPPER(name) LIKE :pattern`,
      [pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      description: row[0],
      name: row[1],
      artist_id: row[2]
    }));
  }).catch(() => {
    return null;
  });
}

async function getArtist(id) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT name, description, dob, dod
         FROM Artist
         WHERE artist_id = :id`,
      { id },
      { autoCommit: true }
    );

    return {
      name: result.rows[0][0],
      description: result.rows[0][1],
      dob: result.rows[0][2].toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      dod: result.rows[0][3].toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };

  }).catch(() => {
    return null;
  });
}

async function getLocations(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND (UPPER(l.name) LIKE :pattern
           OR UPPER(l.country) LIKE :pattern
           OR UPPER(p.city) LIKE :pattern
           OR UPPER(p.region) LIKE :pattern)`,
      [pattern, pattern, pattern, pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      name: row[0],
      country: row[1],
      st_address: row[2],
      city: row[3],
      region: row[4],
      postcode: row[5],
      yr_est: row[6]
    }));
  }).catch(() => {
    return null;
  });
}

async function getLocation(name) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.name = :name
           AND l.postcode = p.postcode`,
      { name },
      { autoCommit: true }
    );

    return {
      name: result.rows[0][0],
      country: result.rows[0][1],
      st_address: result.rows[0][2],
      city: result.rows[0][3],
      region: result.rows[0][4],
      postcode: result.rows[0][5],
      yr_est: result.rows[0][6]
    };

  }).catch(() => {
    return null;
  });
}

async function getCollections(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT title, curator, theme, description
         FROM COLLECTION
         WHERE UPPER(title) LIKE :pattern
            OR UPPER(curator) LIKE :pattern`,
      [pattern, pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      title: row[0],
      curator: row[1],
      theme: row[2],
      description: row[3]
    }));
  }).catch(() => {
    return null;
  });
}

async function getCollection(title, curator) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT title, curator, theme, description, location_name
         FROM Collection
         WHERE title = :title
           AND curator = :curator`,
      [title, curator],
      { autoCommit: true }
    );

    return {
      title: result.rows[0][0],
      curator: result.rows[0][1],
      theme: result.rows[0][2],
      description: result.rows[0][3],
      location_name: result.rows[0][4]
    };

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
  const link = uploadImage(body["image_url"]);
  if (!link) {
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute("SELECT max(post_id) FROM Post");
    const id = result.rows[0][0] + 1;
    const insert = await connection.execute(
      `INSERT INTO Post VALUES (:postId, :text, :datetime, :age_restricted, :username, :piece_id, :image_url)`,
      {
        postId: id,
        text: body["text"] || null,
        datetime: new Date(),
        age_restricted: body["age_restricted"] || 0,
        username: body["username"],
        piece_id: body["piece_id"],
        image_url: { val: link, type: oracledb.CLOB },
      },
      { autoCommit: true }
    );
    assignBadges(body["username"]);
    return true;
  }).catch(() => {
    return false;
  });
}

async function assignBadges(username) {
  const award = async (badge_name) => {
    return await withOracleDB(async (connection) => {
      await connection.execute(
        `INSERT INTO Earns VALUES (:username, :badge_name)`,
        {
          username,
          badge_name: badge_name,
        },
        { autoCommit: true }
      );
    });
  };

  return await withOracleDB(async (connection) => {
    // reducing counts so data population is less painful
    // enthusiast => 3
    // explorer => 5
    // connoisseur => 10
    // collector => 3 from one location
    // explorer => 3 diff locations location
    const already_earned_rows = await connection.execute(
      "SELECT badge_name FROM Earns WHERE username = :username",
      [username]
    );
    const already_earned = already_earned_rows.rows.map((row) => row[0]);
    const post_counts = (
      await connection.execute(
        "SELECT count(post_id) FROM Post WHERE username = :username",
        [username]
      )
    ).rows[0][0];
    const post_from_location = await connection.execute(
      "SELECT count(p.post_id) FROM Post p, ArtPiece ap, Collection c WHERE p.piece_id = ap.piece_id AND ap.collection_title = c.title AND ap.collection_curator = c.curator AND p.username = :username GROUP BY c.location_name HAVING count(p.post_id) > 3",
      [username]
    );
    const locations = await connection.execute(
      "SELECT count(c.location_name) FROM Post p, ArtPiece ap, Collection c WHERE p.piece_id = ap.piece_id AND ap.collection_title = c.title AND ap.collection_curator = c.curator AND p.username = :username",
      [username]
    );
    if (post_counts >= 3 && !already_earned.includes("Enthusiast")) {
      award("Enthusiast");
    }
    if (post_counts >= 5 && !already_earned.includes("Explorer")) {
      award("Explorer");
    }
    if (post_counts >= 10 && !already_earned.includes("Connoisseur")) {
      award("Connoisseur");
    }
    if (post_from_location.rows.length >= 1) {
      award("Collector");
    }
    if (locations.rows.length >= 3) {
      award("Explorer");
    }
  }).catch(() => { });
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
  getPostsFollowing,
  getPostsUser,
  getPostsPiece,
  getPostsLocation,
  getPostsCollection,
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
  updateProfile,
  getProfiles,
  getPieces,
  getPiece,
  getLocation,
  getLocations,
  getCollection,
  getCollections,
  getArtists,
  getArtist,
  getPostsArtist,
};
