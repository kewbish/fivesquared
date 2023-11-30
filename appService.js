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
      `SELECT ap.title, ap.description, ap.medium, a.name, ap.piece_id
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
      medium: row[2],
      artist: row[3],
      piece_id: row[4],
    }));
  }).catch(() => {
    return null;
  });
}

async function getPiecesAdvanced(title, artist, medium, col, cur, loc, lo, hi, desc) {
  return await withOracleDB(async (connection) => {
    const condArray = [];
    const values = [];

    if (title !== "\x00") {
      condArray.push(`Upper(AP.TITLE) LIKE :title`);
      values.push("%" + title.toUpperCase() + "%");
    }

    if (artist !== "\x00") {
      condArray.push(`Upper(A.NAME) LIKE :artist`);
      values.push("%" + artist.toUpperCase() + "%");
    }

    if (medium !== "\x00") {
      condArray.push(`Upper(AP.MEDIUM) LIKE :medium`);
      values.push("%" + medium.toUpperCase() + "%");
    }

    if (col !== "\x00") {
      condArray.push(`Upper(AP.COLLECTION_TITLE) LIKE :col`);
      values.push("%" + col.toUpperCase() + "%");
    }

    if (cur !== "\x00") {
      condArray.push(`Upper(AP.COLLECTION_CURATOR) LIKE :cur`);
      values.push("%" + cur.toUpperCase() + "%");
    }

    if (loc !== "\x00") {
      condArray.push(`Upper(C.LOCATION_NAME) LIKE :cur`);
      values.push("%" + cur.toUpperCase() + "%");
    }

    if (lo !== "\x00") {
      condArray.push(`AP.VALUE >= :lo`);
      values.push(lo);
    }

    if (hi !== "\x00") {
      condArray.push(`AP.VALUE <= :hi`);
      values.push(hi);
    }

    if (desc !== "\x00") {
      condArray.push(`Upper(AP.DESCRIPTION) LIKE :description`);
      values.push("%" + desc.toUpperCase() + "%");
    }

    let cond = condArray.join(" AND ");
    if (cond) cond = "OR " + cond;

    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT ap.title, ap.description, ap.medium, a.name, ap.piece_id
         FROM ArtPiece ap,
              Creates cr,
              Artist a,
              Collection c
         WHERE cr.artist_id = a.artist_id
           and cr.piece_id = ap.piece_id
           and c.title = ap.collection_title
           and c.curator = ap.collection_curator
           and (ap.title <> ap.title 
               ${cond}
               )`,
      values,
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      title: row[0],
      description: row[1],
      medium: row[2],
      artist: row[3],
      piece_id: row[4],
    }));
  }).catch(() => {
    return null;
  });
}

async function getPiece(id) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT ap.title, ap.description, ap.medium, a.artist_id, a.name, c.title, c.curator, ap.value, ap.year
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
      medium: result.rows[0][2],
      artist_id: result.rows[0][3],
      artist_name: result.rows[0][4],
      collection: result.rows[0][5],
      curator: result.rows[0][6],
      value: result.rows[0][7],
      year: result.rows[0][8]
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
         WHERE UPPER(name) LIKE :pattern
            OR UPPER(description) LIKE :pattern`,
      [pattern, pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      description: row[0],
      name: row[1],
      artist_id: row[2],
    }));
  }).catch(() => {
    return null;
  });
}

async function getArtistsAdvanced(name, dob, dod, description) {
  const condArray = [];
  const values = [];

  if (name !== "\x00") {
    condArray.push(`Upper(NAME) LIKE :name`);
    values.push("%" + name.toUpperCase() + "%");
  }

  if (dob !== "\x00") {
    // console.log(dob);
    condArray.push(`DOB >= TO_DATE(:dob, 'YYYY-MM-DD')`);
    values.push(dob);
  }

  if (dod !== "\x00") {
    // console.log(dod);
    condArray.push(`DOD <= TO_DATE(:dod, 'YYYY-MM-DD')`);
    values.push(dod)
  }

  if (description !== "\x00") {
    condArray.push(`Upper(DESCRIPTION) LIKE :description`);
    values.push("%"+description.toUpperCase()+"%");
  }

  let cond = condArray.join(" AND ");
  if (cond) cond = "OR " + cond;

  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
        `SELECT name, description, artist_id
         FROM Artist 
         WHERE name <> name ` + cond,
        values
    );

    return result.rows.map((row) => ({
      name: row[0],
      description: row[1],
      artist_id: row[2],
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
      dob: result.rows[0][2].toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dod: result.rows[0][3].toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }).catch(() => {
    return null;
  });
}

async function getLocations(term) {
  return await withOracleDB(async (connection) => {
    let pattern = "%" + term + "%";
    oracledb.fetchAsString = [oracledb.CLOB];
    const museums = await connection.execute(
        `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT m.name
                      FROM Museum m
                      WHERE l.name = m.name)
           AND (
           (UPPER(l.name) LIKE :pattern
             OR UPPER(l.country) LIKE :pattern
             OR UPPER(p.city) LIKE :pattern
             OR UPPER(p.region) LIKE :pattern))`,
        [pattern, pattern, pattern, pattern],
        {autoCommit: true}
    );

    const galleries = await connection.execute(
        `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT g.name
                      FROM Gallery g
                      WHERE l.name = g.name)
           AND (
           (UPPER(l.name) LIKE :pattern
             OR UPPER(l.country) LIKE :pattern
             OR UPPER(p.city) LIKE :pattern
             OR UPPER(p.region) LIKE :pattern))`,
        [pattern, pattern, pattern, pattern],
        {autoCommit: true}
    );

    const privateCollections = await connection.execute(
        `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT pc.name
                      FROM PrivateCollection pc
                      WHERE l.name = pc.name)
           AND (
           (UPPER(l.name) LIKE :pattern
             OR UPPER(l.country) LIKE :pattern
             OR UPPER(p.city) LIKE :pattern
             OR UPPER(p.region) LIKE :pattern))`,
        [pattern, pattern, pattern, pattern],
        {autoCommit: true}
    );

    const mapped = (row) => ({
      name: row[0],
      country: row[1],
      st_address: row[2],
      city: row[3],
      region: row[4],
      postcode: row[5],
      yr_est: row[6],
    });

    return {
      museums: museums.rows.map((row) => mapped(row)),
      galleries: galleries.rows.map((row) => mapped(row)),
      privateCollections: privateCollections.rows.map((row) => mapped(row))
    }
  }).catch(() => {
    return null;
  });
}

async function getLocationsAdvanced(name, earl, late, addr, city, regn, ctry, post) {
  const condArray = [];
  const values = [];

  if (name !== "\x00") {
    condArray.push(`Upper(L.NAME) LIKE :name`);
    values.push("%" + name.toUpperCase() + "%");
  }

  if (earl !== "\x00") {
    condArray.push(`L.YR_EST >= :earl`);
    values.push(earl);
  }

  if (late !== "\x00") {
    condArray.push(`L.YR_EST <= :late`);
    values.push(late);
  }

  if (addr !== "\x00") {
    condArray.push(`Upper(L.ST_ADDRESS) LIKE :addr`);
    values.push("%" + addr.toUpperCase() + "%");
  }

  if (regn !== "\x00") {
    condArray.push(`Upper(P.REGION) LIKE :regn`);
    values.push("%" + regn.toUpperCase() + "%");
  }

  if (ctry !== "\x00") {
    condArray.push(`Upper(L.COUNTRY) LIKE :ctry`);
    values.push("%" + ctry.toUpperCase() + "%");
  }

  if (post !== "\x00") {
    condArray.push(`Upper(L.POSTCODE) LIKE :post`);
    values.push("%" + post.toUpperCase() + "%");
  }

  let cond = condArray.join(" AND ");
  if (cond) cond = "OR " + cond;

  // console.log(cond);



  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const museums = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT m.name
                      FROM Museum m
                      WHERE l.name = m.name)
           AND (l.name <> l.name ${cond})`,
      values,
      { autoCommit: true }
    );

    const galleries = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT g.name
                      FROM Gallery g
                      WHERE l.name = g.name)
           AND (l.name <> l.name ${cond})`,
      values,
      { autoCommit: true }
    );

    const privateCollections = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est
         FROM Location l,
              Postcode p
         WHERE l.postcode = p.postcode
           AND EXISTS(SELECT pc.name
                      FROM PrivateCollection pc
                      WHERE l.name = pc.name)
           AND (l.name <> l.name ${cond})`,
      values,
      { autoCommit: true }
    );

    const mapped = (row) => ({
      name: row[0],
      country: row[1],
      st_address: row[2],
      city: row[3],
      region: row[4],
      postcode: row[5],
      yr_est: row[6],
    });

    return {
      museums: museums.rows.map((row) => mapped(row)),
      galleries: galleries.rows.map((row) => mapped(row)),
      privateCollections: privateCollections.rows.map((row) => mapped(row))
    }
  }).catch(() => {
    return null;
  });
}

async function getMuseum(name) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est, m.num_visitors, m.ticket_price, m.benefactor
         FROM Location l,
              Postcode p,
              Museum m
         WHERE m.name = :name
           AND l.name = m.name
           AND l.postcode = p.postcode`,
      { name },
      { autoCommit: true }
    );

    if (!result.rows[0]) {
      return null;
    }

    return {
      name: result.rows[0][0],
      country: result.rows[0][1],
      st_address: result.rows[0][2],
      city: result.rows[0][3],
      region: result.rows[0][4],
      postcode: result.rows[0][5],
      yr_est: result.rows[0][6],
      num_visitors: result.rows[0][7],
      ticket_price: result.rows[0][8],
      benefactor: result.rows[0][9]
    };
  }).catch(() => {
    return null;
  });
}

async function getGallery(name) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est, g.num_pieces, g.curator
         FROM Location l,
              Postcode p,
              Gallery g
         WHERE g.name = :name
           AND l.name = g.name
           AND l.postcode = p.postcode`,
      { name },
      { autoCommit: true }
    );

    if (!result.rows[0]) {
      return null;
    }

    return {
      name: result.rows[0][0],
      country: result.rows[0][1],
      st_address: result.rows[0][2],
      city: result.rows[0][3],
      region: result.rows[0][4],
      postcode: result.rows[0][5],
      yr_est: result.rows[0][6],
      num_pieces: result.rows[0][7],
      curator: result.rows[0][8]
    };
  }).catch(() => {
    return null;
  });
}

async function getPrivateCollection(name) {
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT l.name, l.country, l.st_address, p.city, p.region, l.postcode, l.yr_est, pc.owner
         FROM Location l,
              Postcode p,
              PrivateCollection pc
         WHERE pc.name = :name
           AND l.name = pc.name
           AND l.postcode = p.postcode`,
      { name },
      { autoCommit: true }
    );

    if (!result.rows[0]) {
      return null;
    }

    return {
      name: result.rows[0][0],
      country: result.rows[0][1],
      st_address: result.rows[0][2],
      city: result.rows[0][3],
      region: result.rows[0][4],
      postcode: result.rows[0][5],
      yr_est: result.rows[0][6],
      owner: result.rows[0][7]
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
            OR UPPER(curator) LIKE :pattern
            OR UPPER(theme) LIKE :pattern
            OR UPPER(description) LIKE :pattern`,
      [pattern, pattern, pattern, pattern],
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      title: row[0],
      curator: row[1],
      theme: row[2],
      description: row[3],
    }));
  }).catch(() => {
    return null;
  });
}

async function getCollectionsAdvanced(title, cur, theme, loc, desc) {
  const condArray = [];
  const values = [];

  if (title !== "\x00") {
    condArray.push(`Upper(TITLE) LIKE :title`);
    values.push("%" + title.toUpperCase() + "%");
  }

  if (cur !== "\x00") {
    condArray.push(`Upper(CURATOR) LIKE :cur`);
    values.push("%" + cur.toUpperCase() + "%");
  }

  if (theme !== "\x00") {
    condArray.push(`Upper(THEME) LIKE :theme`);
    values.push("%" + theme.toUpperCase() + "%");
  }

  if (loc !== "\x00") {
    condArray.push(`Upper(LOCATION_NAME) LIKE :loc`);
    values.push("%" + loc.toUpperCase() + "%");
  }

  if (desc !== "\x00") {
    condArray.push(`Upper(DESCRIPTION) LIKE :description`);
    values.push("%" + desc.toUpperCase() + "%");
  }

  let cond = condArray.join(" AND ");
  if (cond) cond = "OR " + cond;

  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT title, curator, theme, description
         FROM COLLECTION
         WHERE title <> title ` + cond,
      values,
      { autoCommit: true }
    );

    return result.rows.map((row) => ({
      title: row[0],
      curator: row[1],
      theme: row[2],
      description: row[3],
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
          `INSERT INTO Earns
           VALUES (:username, :badge_name)`,
          {
            username,
            badge_name: badge_name,
          },
          {autoCommit: true}
      );
    });
  };

  return await withOracleDB(async (connection) => {
    // reducing counts so data population is less painful
    // enthusiast => 5
    // expert => 25
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
    if (post_counts >= 5 && !already_earned.includes("Enthusiast")) {
      award("Enthusiast");
    }
    if (post_counts >= 25 && !already_earned.includes("Expert")) {
      award("Expert");
    }
    if (post_counts >= 10 && !already_earned.includes("Connoisseur")) {
      award("Connoisseur");
    }
    if (post_from_location.rows.length >= 3 && !already_earned.includes("Collector")) {
      award("Collector");
    }
    if (locations.rows.length >= 3 && !already_earned.includes("Explorer")) {
      award("Explorer");
    }
  }).catch(() => {});
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

async function getTables() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT table_name FROM all_tables WHERE owner = 'ORA_KEWBISH'`
    );
    return result.rows.map((row) => row[0]);
  }).catch(() => {
    return [];
  });
}

async function getColumns(tableName) {
  if (!!tableName.match(/DROP|CREATE|UPDATE|SET|SELECT|FROM|WHERE/g)) {
    // basic sanitation
    return false;
  }
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(`SELECT * FROM ` + tableName);
    return result.metaData.map((data) => data.name);
  }).catch(() => {
    return [];
  });
}

async function projectColumns(tableName, body) {
  if (!!tableName.match(/DROP|CREATE|UPDATE|SET|SELECT|FROM|WHERE/g)) {
    // basic sanitation
    return false;
  }
  for (const column of body["columns"]) {
    if (!!column.match(/DROP|CREATE|UPDATE|SET|SELECT|FROM|WHERE/g)) {
      return false;
    }
  }
  const columns = body["columns"].join(",");
  return await withOracleDB(async (connection) => {
    oracledb.fetchAsString = [oracledb.CLOB];
    const result = await connection.execute(
      `SELECT ${columns} FROM ` + tableName
    );
    return result.rows;
  });
}

async function getPieceSummary() {
  return await withOracleDB(async (connection) => {
    const result = await connection.execute(
      `SELECT ap.piece_id, ap.title, a.name FROM ArtPiece ap, Creates c, Artist a WHERE ap.piece_id = c.piece_id AND c.artist_id = a.artist_id`
    );
    return result.rows.map((row) => ({
      piece_id: row[0],
      title: row[1],
      artist: row[2],
    }));
  }).catch(() => {
    return [];
  });
}

async function postedAboutAll() {
  return await withOracleDB(async (connection) => {
    const users = await connection.execute(
      `SELECT a.username FROM AppUser a WHERE NOT EXISTS ((SELECT piece_id FROM ArtPiece) MINUS (SELECT p.piece_id FROM Post p WHERE p.username = a.username)) ORDER BY a.username`
    );
    return users.rows.map((user) => user[0]);
  }).catch(() => {
    return false;
  });
}

async function totalPostsPerAge() {
  return await withOracleDB(async (connection) => {
    const posts = await connection.execute(
      `SELECT age.age, count(p.post_id) as cnt FROM AppUser a, AppUserAge age, Post p WHERE a.username = p.username AND a.dob = age.dob GROUP BY age.age ORDER BY cnt DESC`
    );
    return posts.rows.map((post) => ({ age: post[0], count: post[1] }));
  }).catch(() => {
    return false;
  });
}

async function totalNSFWPostsByActiveUsers() {
  return await withOracleDB(async (connection) => {
    const posts = await connection.execute(
      `SELECT age.age, count(p.post_id) as cnt FROM AppUser a, AppUserAge age, Post p WHERE a.username = p.username AND a.dob = age.dob AND p.age_restricted = 1 GROUP BY age.age HAVING count(p.post_id) > 5 ORDER BY cnt DESC`
    );
    return posts.rows.map((post) => ({ age: post[0], count: post[1] }));
  }).catch(() => {
    return false;
  });
}

async function mostExpensiveArtPieces() {
  return await withOracleDB(async (connection) => {
    const pieces = await connection.execute(
      `SELECT ap.year, max(ap.value) FROM ArtPiece ap GROUP BY ap.year HAVING 3 <= (SELECT count(*) FROM ArtPiece ap2 WHERE ap2.year = ap.year)`
    );
    const formatter = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return pieces.rows.map((piece) => ({
      year: piece[0],
      cost: formatter.format(piece[1]),
    }));
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
  getPiecesAdvanced,
  getPiece,
  getLocations,
  getLocationsAdvanced,
  getMuseum,
  getGallery,
  getPrivateCollection,
  getCollections,
  getCollectionsAdvanced,
  getCollection,
  getArtists,
  getArtistsAdvanced,
  getArtist,
  getPostsArtist,
  getTables,
  getColumns,
  projectColumns,
  getPieceSummary,
  postedAboutAll,
  totalPostsPerAge,
  totalNSFWPostsByActiveUsers,
  mostExpensiveArtPieces,
};
